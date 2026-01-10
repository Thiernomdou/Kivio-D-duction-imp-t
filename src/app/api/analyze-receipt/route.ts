import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { convertToEUR } from "@/lib/currency-converter";
import type { InsertReceipt } from "@/lib/supabase/types";

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

    // Convert file to base64
    const buffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Determine media type for Claude
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
      "image/jpeg";
    if (mimeType === "image/png") {
      mediaType = "image/png";
    } else if (mimeType === "application/pdf") {
      // For PDFs, we'll need to handle differently
      // Claude can analyze PDFs directly with the pdf type
      // For now, let's return an error for PDFs and handle images
      return NextResponse.json(
        {
          error:
            "L'analyse PDF n'est pas encore supportée. Veuillez convertir en image.",
        },
        { status: 400 }
      );
    }

    // Call Claude API with vision
    console.log("[AnalyzeReceipt] Calling Claude API...");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: RECEIPT_OCR_PROMPT,
            },
          ],
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
      validation_status: "pending",
      is_validated: false,
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
  } catch (error) {
    console.error("[AnalyzeReceipt] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'analyse" },
      { status: 500 }
    );
  }
}
