import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasUserPaidForYear } from "@/lib/supabase/orders";
import { generateFiscalPDF } from "@/lib/pdf-generator";
import type { Receipt, Profile } from "@/lib/supabase/types";

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
    const { taxYear = new Date().getFullYear() } = await request.json();

    console.log("[GeneratePDF] Starting for user:", user.id, "year:", taxYear);

    // 1. Vérifier si l'utilisateur a payé
    const { hasPaid } = await hasUserPaidForYear(user.id, taxYear, supabase);

    if (!hasPaid) {
      return NextResponse.json(
        { error: "Veuillez débloquer votre dossier fiscal pour télécharger le PDF." },
        { status: 403 }
      );
    }

    // 2. Récupérer le profil fiscal
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[GeneratePDF] Profile error:", profileError);
    }

    // 3. Récupérer les reçus
    const { data: receipts, error: receiptsError } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .eq("tax_year", taxYear)
      .order("transfer_date", { ascending: true });

    if (receiptsError) {
      console.error("[GeneratePDF] Receipts error:", receiptsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des reçus" },
        { status: 500 }
      );
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json(
        { error: "Aucun reçu trouvé pour cette année" },
        { status: 400 }
      );
    }

    // 4. Récupérer le tax_calculation pour les totaux
    const { data: taxCalc } = await supabase
      .from("tax_calculations")
      .select("*")
      .eq("user_id", user.id)
      .eq("tax_year", taxYear)
      .single();

    // 5. Calculer les totaux
    let totalDeductible = 0;
    let taxReduction = 0;
    const tmiRate = profile?.tmi || 30;

    if (taxCalc) {
      totalDeductible = taxCalc.total_deductible || 0;
      taxReduction = taxCalc.tax_reduction || 0;
    } else {
      // Calculer manuellement si pas de tax_calculation
      for (const receipt of receipts as Receipt[]) {
        totalDeductible += (receipt.amount_eur || 0) + (receipt.fees || 0);
      }
      taxReduction = Math.round(totalDeductible * (tmiRate / 100) * 100) / 100;
    }

    // 6. Nom de l'utilisateur
    const userName = profile?.full_name || user.email?.split("@")[0]?.toUpperCase() || "UTILISATEUR";

    // 7. Date de génération
    const generatedDate = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    // 8. Générer le PDF (async pour lazy loading de jsPDF)
    console.log("[GeneratePDF] Generating PDF with", receipts.length, "receipts");

    const pdfBuffer = await generateFiscalPDF({
      userName,
      taxYear,
      generatedDate,
      totalDeductible,
      taxReduction,
      tmiRate,
      receipts: receipts as Receipt[],
      profile: profile as Profile | null,
      isMarried: profile?.is_married || false,
      annualIncome: profile?.annual_income || 0,
    });

    // 9. Créer le nom du fichier
    const lastName = userName.split(" ").pop()?.toUpperCase() || "UTILISATEUR";
    const fileName = `Kivio_Dossier_Fiscal_${taxYear}_${lastName}.pdf`;

    console.log("[GeneratePDF] PDF generated successfully:", fileName);

    // 10. Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[GeneratePDF] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
