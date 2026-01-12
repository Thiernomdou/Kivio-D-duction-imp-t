import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Allowed file types - including mobile formats
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

// Also check by extension for mobile compatibility
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".pdf"];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Check if file is allowed by type or extension
function isFileAllowed(file: File): boolean {
  // Check MIME type
  if (ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return true;
  }

  // Fallback: check extension (mobile browsers sometimes don't set correct MIME type)
  const fileName = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "receipt" | "identity";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!type || !["receipt", "identity"].includes(type)) {
      return NextResponse.json(
        { error: "Type de fichier invalide. Utilisez 'receipt' ou 'identity'" },
        { status: 400 }
      );
    }

    // Validate file type (with mobile fallback)
    if (!isFileAllowed(file)) {
      console.error("[Upload] Invalid file type:", file.type, file.name);
      return NextResponse.json(
        {
          error: `Type de fichier non supporté: ${file.type || 'inconnu'}. Types acceptés: JPEG, PNG, PDF`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximale: 10MB" },
        { status: 400 }
      );
    }

    // Determine bucket based on type
    const bucket = type === "receipt" ? "receipts" : "identity-documents";

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: `Erreur lors de l'upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log("[Upload] File uploaded successfully:", {
      bucket,
      path: data.path,
      size: file.size,
      type: file.type,
    });

    return NextResponse.json({
      success: true,
      filePath: data.path,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      bucket,
    });
  } catch (error) {
    console.error("[Upload] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'upload" },
      { status: 500 }
    );
  }
}
