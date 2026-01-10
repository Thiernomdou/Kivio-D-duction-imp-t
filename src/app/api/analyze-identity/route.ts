import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InsertIdentityDocument } from "@/lib/supabase/types";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// OCR prompt for identity document extraction
const IDENTITY_OCR_PROMPT = `Analyse ce document d'état civil français (extrait de naissance, livret de famille ou acte de naissance) et extrais les informations suivantes en JSON strict:

{
  "document_type": "livret_famille" ou "extrait_naissance" ou "acte_naissance",
  "person_name": "Nom complet de la personne principale concernée par le document",
  "father_name": "Nom complet du père",
  "mother_name": "Nom complet de la mère",
  "children": [
    {"name": "Nom complet de l'enfant 1", "birth_date": "YYYY-MM-DD ou null"},
    {"name": "Nom complet de l'enfant 2", "birth_date": "YYYY-MM-DD ou null"}
  ],
  "confidence": nombre entre 0 et 1 (confiance dans l'extraction)
}

Règles importantes:
- Si une information n'est pas lisible ou absente, utilise null
- Pour le livret de famille, extrais tous les enfants listés
- Pour un extrait/acte de naissance, le person_name est l'enfant concerné
- Les dates doivent être au format ISO (YYYY-MM-DD) si disponibles
- Réponds UNIQUEMENT avec le JSON, sans texte explicatif
- La confiance (confidence) indique la qualité globale de l'extraction

Types de documents:
- livret_famille: Document listant les membres d'une famille (parents et enfants)
- extrait_naissance: Copie résumée d'un acte de naissance
- acte_naissance: Copie intégrale de l'acte de naissance`;

interface OcrResult {
  document_type: "livret_famille" | "extrait_naissance" | "acte_naissance" | null;
  person_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  children: { name: string; birth_date?: string }[];
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

    console.log("[AnalyzeIdentity] Starting analysis:", { filePath, fileName });

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("identity-documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("[AnalyzeIdentity] Download error:", downloadError);
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
      return NextResponse.json(
        {
          error:
            "L'analyse PDF n'est pas encore supportée. Veuillez convertir en image.",
        },
        { status: 400 }
      );
    }

    // Call Claude API with vision
    console.log("[AnalyzeIdentity] Calling Claude API...");
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
              text: IDENTITY_OCR_PROMPT,
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
      console.error("[AnalyzeIdentity] JSON parse error:", parseError);
      console.error("[AnalyzeIdentity] Raw response:", textContent.text);
      return NextResponse.json(
        { error: "Impossible de parser la réponse OCR" },
        { status: 500 }
      );
    }

    console.log("[AnalyzeIdentity] OCR result:", ocrResult);

    // Check if user already has an identity document (replace it)
    const { data: existingDoc } = await supabase
      .from("identity_documents")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Prepare identity document data
    const identityData: InsertIdentityDocument = {
      user_id: user.id,
      file_path: filePath,
      file_name: fileName || "identity_document",
      file_size: fileSize || null,
      mime_type: mimeType || null,
      document_type: ocrResult.document_type,
      person_name: ocrResult.person_name,
      father_name: ocrResult.father_name,
      mother_name: ocrResult.mother_name,
      children: ocrResult.children || [],
      ocr_confidence: ocrResult.confidence,
      is_validated: (ocrResult.confidence || 0) >= 0.7,
    };

    let identityDocument;

    if (existingDoc) {
      // Update existing document
      const { data: updated, error: updateError } = await supabase
        .from("identity_documents")
        .update(identityData)
        .eq("id", existingDoc.id)
        .select()
        .single();

      if (updateError) {
        console.error("[AnalyzeIdentity] Update error:", updateError);
        return NextResponse.json(
          { error: `Erreur lors de la mise à jour: ${updateError.message}` },
          { status: 500 }
        );
      }
      identityDocument = updated;
      console.log("[AnalyzeIdentity] Identity document updated:", identityDocument.id);
    } else {
      // Insert new document
      const { data: inserted, error: insertError } = await supabase
        .from("identity_documents")
        .insert(identityData)
        .select()
        .single();

      if (insertError) {
        console.error("[AnalyzeIdentity] Insert error:", insertError);
        return NextResponse.json(
          { error: `Erreur lors de la sauvegarde: ${insertError.message}` },
          { status: 500 }
        );
      }
      identityDocument = inserted;
      console.log("[AnalyzeIdentity] Identity document created:", identityDocument.id);
    }

    // Extract family members for display
    const familyMembers = {
      father: ocrResult.father_name,
      mother: ocrResult.mother_name,
      children: ocrResult.children?.map((c) => c.name) || [],
    };

    return NextResponse.json({
      success: true,
      identityDocument,
      ocrData: ocrResult,
      familyMembers,
    });
  } catch (error) {
    console.error("[AnalyzeIdentity] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'analyse" },
      { status: 500 }
    );
  }
}
