import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ContentBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { convertToEUR } from "@/lib/currency-converter";
import type { InsertReceipt, Receipt } from "@/lib/supabase/types";
import { checkForDuplicate, formatDuplicateMessage } from "@/lib/duplicate-detector";
import sharp from "sharp";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// OCR prompt for receipt extraction
const RECEIPT_OCR_PROMPT = `Analyse ce reçu de transfert d'argent et extrais les informations suivantes en JSON strict:

{
  "sender_name": "Nom complet de l'expéditeur",
  "receiver_name": "Nom complet du bénéficiaire/destinataire",
  "amount_sent": nombre (montant envoyé, sans devise),
  "currency": "Code devise à 3 lettres: EUR, XOF, XAF, USD, GBP, MAD, etc.",
  "fees": nombre (frais de transfert, 0 si non visible),
  "date": "Date au format YYYY-MM-DD",
  "provider": "Nom du service: Wave, Orange Money, Western Union, MoneyGram, Tap Tap Send, Ria, Wise, etc.",
  "confidence": nombre entre 0 et 1 (confiance dans l'extraction)
}

Règles importantes:
- Si une information n'est pas lisible ou absente, utilise null
- Le montant doit être un nombre sans symbole de devise
- La date doit être au format ISO (YYYY-MM-DD)
- Réponds UNIQUEMENT avec le JSON, sans texte explicatif
- La confiance (confidence) indique la qualité globale de l'extraction`;

interface OcrResult {
  sender_name: string | null;
  receiver_name: string | null;
  amount_sent: number | null;
  currency: string | null;
  fees: number | null;
  date: string | null;
  provider: string | null;
  confidence: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // Parse request body
    const { filePath, fileName, fileSize, mimeType } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "Chemin du fichier requis" },
        { status: 400 }
      );
    }

    console.log("[AnalyzeReceipt] Starting analysis:", { filePath, fileName });

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("receipts")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("[AnalyzeReceipt] Download error:", downloadError);
      return NextResponse.json(
        { error: "Impossible de télécharger le fichier" },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Build the content array for Claude API
    const contentArray: ContentBlockParam[] = [];

    if (mimeType === "application/pdf") {
      // Send PDF directly to Claude as a document
      const base64 = buffer.toString("base64");
      console.log("[AnalyzeReceipt] Sending PDF to Claude...");
      contentArray.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      });
    } else {
      // For ALL images: Normalize via sharp to fix EXIF rotation, convert formats, etc.
      // This ensures compatibility with Claude and fixes mobile camera issues
      let imageBase64: string;
      const finalMediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";

      console.log("[AnalyzeReceipt] Processing image:", { mimeType, fileName, bufferSize: buffer.length });

      try {
        // Always process through sharp to:
        // 1. Fix EXIF rotation (common issue with mobile photos)
        // 2. Convert any format (HEIC, HEIF, WebP, etc.) to JPEG
        // 3. Ensure the image is valid
        const convertedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .jpeg({ quality: 85 }) // Convert to JPEG with good quality
          .toBuffer();

        imageBase64 = convertedBuffer.toString("base64");
        console.log("[AnalyzeReceipt] Image processed successfully:", {
          originalSize: buffer.length,
          newSize: convertedBuffer.length,
        });
      } catch (conversionError: unknown) {
        console.error("[AnalyzeReceipt] Sharp processing failed:", conversionError);

        // Fallback: try to use the original image if it's already JPEG/PNG
        if (mimeType === "image/jpeg" || mimeType === "image/png") {
          console.log("[AnalyzeReceipt] Falling back to original image");
          imageBase64 = buffer.toString("base64");
        } else {
          const errorMessage = conversionError instanceof Error ? conversionError.message : "Unknown error";
          return NextResponse.json(
            {
              error: `Impossible de traiter l'image (${mimeType || "format inconnu"}). Essayez de prendre une nouvelle photo ou utilisez un format JPEG/PNG.`,
              details: errorMessage,
            },
            { status: 400 }
          );
        }
      }

      console.log("[AnalyzeReceipt] Sending image to Claude as", finalMediaType, "...");
      contentArray.push({
        type: "image",
        source: {
          type: "base64",
          media_type: finalMediaType,
          data: imageBase64,
        },
      });
    }

    contentArray.push({
      type: "text",
      text: RECEIPT_OCR_PROMPT,
    });

    // Call Claude API
    console.log("[AnalyzeReceipt] Calling Claude API...");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: contentArray,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "Pas de réponse textuelle de l'API" },
        { status: 500 }
      );
    }

    // Parse OCR result
    let ocrResult: OcrResult;
    try {
      // Clean the response (remove markdown code blocks if present)
      let jsonStr = textContent.text.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      ocrResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("[AnalyzeReceipt] JSON parse error:", parseError);
      console.error("[AnalyzeReceipt] Raw response:", textContent.text);
      return NextResponse.json(
        { error: "Impossible de parser la réponse OCR" },
        { status: 500 }
      );
    }

    console.log("[AnalyzeReceipt] OCR result:", ocrResult);

    // Convert currency to EUR
    const currency = ocrResult.currency || "EUR";
    const amountSent = ocrResult.amount_sent || 0;
    const { amountEur, exchangeRate } = await convertToEUR(amountSent, currency);

    // ===== DUPLICATE DETECTION =====
    // Fetch existing receipts for this user to check for duplicates
    const currentYear = new Date().getFullYear();
    const { data: existingReceipts, error: fetchError } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .eq("tax_year", currentYear);

    if (fetchError) {
      console.error("[AnalyzeReceipt] Error fetching existing receipts:", fetchError);
      // Continue anyway - don't block upload if we can't check duplicates
    }

    // Check for duplicates
    if (existingReceipts && existingReceipts.length > 0) {
      const duplicateCheck = checkForDuplicate(
        {
          amount_sent: ocrResult.amount_sent,
          transfer_date: ocrResult.date,
          receiver_name: ocrResult.receiver_name,
          provider: ocrResult.provider,
          currency: currency,
        },
        existingReceipts as Receipt[]
      );

      if (duplicateCheck.isDuplicate) {
        console.log("[AnalyzeReceipt] Duplicate detected:", duplicateCheck);

        const duplicateMessage = formatDuplicateMessage(duplicateCheck);

        return NextResponse.json(
          {
            error: "Ce reçu a déjà été enregistré",
            isDuplicate: true,
            duplicateDetails: {
              message: duplicateMessage,
              existingReceiptId: duplicateCheck.matchingReceipt?.id,
              confidence: duplicateCheck.confidence,
              reasons: duplicateCheck.reasons,
            },
            ocrData: ocrResult,
          },
          { status: 409 } // Conflict
        );
      }
    }
    // ===== END DUPLICATE DETECTION =====

    // Prepare receipt data for database
    const receiptData: InsertReceipt = {
      user_id: user.id,
      file_path: filePath,
      file_name: fileName || "receipt",
      file_size: fileSize || null,
      mime_type: mimeType || null,
      sender_name: ocrResult.sender_name,
      receiver_name: ocrResult.receiver_name,
      amount_sent: ocrResult.amount_sent,
      currency: currency,
      fees: ocrResult.fees || 0,
      transfer_date: ocrResult.date,
      provider: ocrResult.provider,
      ocr_confidence: ocrResult.confidence,
      amount_eur: amountEur,
      exchange_rate: exchangeRate,
      validation_status: "auto_validated", // Attestation sur l'honneur - validation automatique
      is_validated: true, // Tous les reçus sont validés par défaut
      tax_year: new Date().getFullYear(),
    };

    // Save to database
    const { data: receipt, error: insertError } = await supabase
      .from("receipts")
      .insert(receiptData)
      .select()
      .single();

    if (insertError) {
      console.error("[AnalyzeReceipt] Database error:", insertError);
      return NextResponse.json(
        { error: `Erreur lors de la sauvegarde: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log("[AnalyzeReceipt] Receipt saved:", receipt.id);

    return NextResponse.json({
      success: true,
      receipt,
      ocrData: ocrResult,
      conversion: {
        originalAmount: amountSent,
        originalCurrency: currency,
        amountEur,
        exchangeRate,
      },
    });
  } catch (error: unknown) {
    console.error("[AnalyzeReceipt] Unexpected error:", error);

    // Provide more specific error messages
    let errorMessage = "Erreur inattendue lors de l'analyse";
    let statusCode = 500;

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "L'analyse a pris trop de temps. Veuillez réessayer avec une image plus petite.";
        statusCode = 504;
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques secondes et réessayer.";
        statusCode = 429;
      } else if (error.message.includes("Invalid API Key") || error.message.includes("401")) {
        errorMessage = "Erreur de configuration du service d'analyse.";
        statusCode = 500;
      } else if (error.message.includes("Could not process image")) {
        errorMessage = "L'image n'a pas pu être traitée. Essayez avec une autre photo.";
        statusCode = 400;
      } else {
        // Include partial error info for debugging
        errorMessage = `Erreur lors de l'analyse: ${error.message.substring(0, 100)}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
