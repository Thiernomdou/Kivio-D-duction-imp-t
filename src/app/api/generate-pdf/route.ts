import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasUserPaidForYear } from "@/lib/supabase/orders";
import { generateFiscalPDF } from "@/lib/pdf-generator";
import type { Receipt } from "@/lib/supabase/types";
import { TESTING_MODE_BYPASS_PAYWALL } from "@/lib/admin-config";
import { calculateTMI } from "@/lib/tax-calculator";

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

    // Parse request body - tmiRate peut être passé par le frontend pour garantir la cohérence
    const { taxYear = new Date().getFullYear(), tmiRate: requestedTmi } = await request.json();

    console.log("[GeneratePDF] Starting for user:", user.id, "year:", taxYear);

    // 1. Vérifier si l'utilisateur a payé (ou mode test actif)
    const paymentResult = await hasUserPaidForYear(user.id, taxYear, supabase);
    const hasPaid = TESTING_MODE_BYPASS_PAYWALL || paymentResult.hasPaid;

    if (!hasPaid) {
      return NextResponse.json(
        { error: "Veuillez débloquer votre dossier fiscal pour télécharger le PDF." },
        { status: 403 }
      );
    }

    console.log("[GeneratePDF] Access granted:", TESTING_MODE_BYPASS_PAYWALL ? "TEST MODE" : "PAID");

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

    // 4. Calculer les totaux depuis les reçus (source de vérité)
    let totalDeductible = 0;
    for (const receipt of receipts as Receipt[]) {
      totalDeductible += (receipt.amount_eur || 0) + (receipt.fees || 0);
    }

    // 5. Déterminer le TMI - Priorité: frontend > profil recalculé > profil.tmi > simulation > défaut
    let tmiRate: number;

    // PRIORITÉ 1: TMI passé par le frontend (source de vérité car calculé côté client avec les données à jour)
    if (requestedTmi && requestedTmi > 0) {
      tmiRate = requestedTmi;
      console.log("[GeneratePDF] TMI from frontend request:", tmiRate);
    }
    // PRIORITÉ 2: Recalculer depuis les données fiscales du profil
    else if (profile?.annual_income && profile.annual_income > 0) {
      tmiRate = calculateTMI(
        profile.annual_income,
        profile.is_married || false,
        profile.children_count || 0
      );
      console.log("[GeneratePDF] TMI recalculated from profile:", tmiRate);
    }
    // PRIORITÉ 3: TMI stocké dans le profil
    else if (profile?.tmi && profile.tmi > 0) {
      tmiRate = profile.tmi;
      console.log("[GeneratePDF] TMI from profile.tmi:", tmiRate);
    }
    // PRIORITÉ 4: Récupérer depuis la simulation
    else {
      const { data: simulation } = await supabase
        .from("tax_simulations")
        .select("tmi, annual_income, is_married, children_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (simulation?.annual_income && simulation.annual_income > 0) {
        tmiRate = calculateTMI(
          simulation.annual_income,
          simulation.is_married || false,
          simulation.children_count || 0
        );
        console.log("[GeneratePDF] TMI recalculated from simulation:", tmiRate);
      } else if (simulation?.tmi && simulation.tmi > 0) {
        tmiRate = simulation.tmi;
        console.log("[GeneratePDF] TMI from simulation.tmi:", tmiRate);
      } else {
        tmiRate = 30; // Défaut
        console.log("[GeneratePDF] TMI defaulted to 30%");
      }
    }

    // Calculer la réduction d'impôt avec le TMI recalculé
    const taxReduction = Math.round(totalDeductible * (tmiRate / 100) * 100) / 100;

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
