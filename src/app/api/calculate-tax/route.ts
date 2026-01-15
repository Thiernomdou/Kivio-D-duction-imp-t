import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Receipt } from "@/lib/supabase/types";
import { hasUserPaidForYear } from "@/lib/supabase/orders";
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

    // Parse request body
    const { taxYear = new Date().getFullYear() } = await request.json();

    console.log("[CalculateTax] Starting calculation for user:", user.id, "year:", taxYear);

    // 1. Get user's fiscal profile to calculate TMI
    const { data: fiscalProfile, error: profileError } = await supabase
      .from("profiles")
      .select("tmi, beneficiary_type, annual_income, is_married, children_count")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("[CalculateTax] Profile error:", profileError);
    }

    // Calculer le TMI depuis les données fiscales (source de vérité)
    let tmiRate: number;

    if (fiscalProfile?.annual_income && fiscalProfile.annual_income > 0) {
      // Recalculer le TMI depuis les données fiscales
      tmiRate = calculateTMI(
        fiscalProfile.annual_income,
        fiscalProfile.is_married || false,
        fiscalProfile.children_count || 0
      );
      console.log("[CalculateTax] TMI recalculated:", tmiRate, {
        income: fiscalProfile.annual_income,
        married: fiscalProfile.is_married,
        children: fiscalProfile.children_count,
      });
    } else if (fiscalProfile?.tmi && fiscalProfile.tmi > 0) {
      tmiRate = fiscalProfile.tmi;
      console.log("[CalculateTax] TMI from profile:", tmiRate);
    } else {
      // Dernier recours: chercher dans la simulation
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
        console.log("[CalculateTax] TMI recalculated from simulation:", tmiRate);
      } else if (simulation?.tmi && simulation.tmi > 0) {
        tmiRate = simulation.tmi;
        console.log("[CalculateTax] TMI from simulation:", tmiRate);
      } else {
        tmiRate = 30; // Défaut
        console.log("[CalculateTax] TMI defaulted to 30%");
      }
    }

    // 2. Get all receipts for the year (no identity document needed - user attestation)
    const { data: receipts, error: receiptsError } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .eq("tax_year", taxYear);

    if (receiptsError) {
      console.error("[CalculateTax] Receipts error:", receiptsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des reçus" },
        { status: 500 }
      );
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json(
        { error: "Aucun reçu trouvé pour cette année. Veuillez télécharger vos reçus de transfert." },
        { status: 400 }
      );
    }

    console.log("[CalculateTax] Found", receipts.length, "receipts");

    // 3. Calculate totals - all receipts are valid (user attestation on honor)
    let totalAmountSent = 0;
    let totalFees = 0;
    let totalDeductible = 0;
    const validatedReceipts: string[] = [];

    for (const receipt of receipts as Receipt[]) {
      const amountEur = receipt.amount_eur || 0;
      const fees = receipt.fees || 0;

      totalAmountSent += amountEur;
      totalFees += fees;
      totalDeductible += amountEur + fees; // Fees are also deductible

      validatedReceipts.push(receipt.id);
    }

    // Batch update all receipts at once (instead of N individual updates)
    if (validatedReceipts.length > 0) {
      const { error: updateError } = await supabase
        .from("receipts")
        .update({
          validation_status: "auto_validated",
          is_validated: true,
        })
        .in("id", validatedReceipts);

      if (updateError) {
        console.error("[CalculateTax] Batch update error:", updateError);
      }
    }

    // 4. Calculate tax reduction: totalDeductible * (TMI / 100)
    const taxReduction = Math.round(totalDeductible * (tmiRate / 100) * 100) / 100;

    console.log("[CalculateTax] Summary:", {
      totalReceipts: validatedReceipts.length,
      totalAmountSent,
      totalFees,
      totalDeductible,
      taxReduction,
    });

    // 5. Upsert tax calculation summary
    const { data: taxCalc, error: calcError } = await supabase
      .from("tax_calculations")
      .upsert(
        {
          user_id: user.id,
          tax_year: taxYear,
          total_receipts: validatedReceipts.length,
          total_amount_sent: totalAmountSent,
          total_fees: totalFees,
          total_deductible: totalDeductible,
          tmi_rate: tmiRate,
          tax_reduction: taxReduction,
          matched_relations: {}, // No longer used - attestation sur l'honneur
          status: "calculated",
        },
        {
          onConflict: "user_id,tax_year",
        }
      )
      .select()
      .single();

    if (calcError) {
      console.error("[CalculateTax] Save error:", calcError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du calcul" },
        { status: 500 }
      );
    }

    // 6. Vérifier si l'utilisateur a payé pour cette année (passer le client serveur)
    // En mode test, tout le monde a accès gratuitement
    const paymentResult = await hasUserPaidForYear(user.id, taxYear, supabase);
    const hasPaid = TESTING_MODE_BYPASS_PAYWALL || paymentResult.hasPaid;
    const order = paymentResult.order;
    console.log("[CalculateTax] Payment status:", hasPaid ? "PAID" : "FREE", TESTING_MODE_BYPASS_PAYWALL ? "(TEST MODE)" : "");

    // Si l'utilisateur N'A PAS payé, retourner des données partielles (PAYWALL)
    if (!hasPaid) {
      return NextResponse.json({
        success: true,
        hasPaid: false,
        requiresPayment: true,
        // Données visibles gratuitement
        summary: {
          receiptsCount: validatedReceipts.length,
          estimatedTaxReduction: Math.round(taxReduction * 100) / 100, // 2 décimales, affiché avec ~
          tmiRate,
        },
        // Données masquées
        totalDeductible: null,
        receiptsDetails: null,
        case6GU: null,
        canDownloadPDF: false,
        // Message incitatif
        paywall: {
          price: 49,
          currency: "EUR",
          features: [
            "Le montant exact à déclarer",
            "Le détail de vos transferts",
            "Votre dossier fiscal complet (PDF)",
            "Le justificatif à conserver 3 ans",
          ],
        },
      });
    }

    // Si l'utilisateur A payé, retourner toutes les données
    return NextResponse.json({
      success: true,
      hasPaid: true,
      requiresPayment: false,
      taxCalculation: taxCalc,
      summary: {
        receiptsCount: validatedReceipts.length,
        totalAmountSent: Math.round(totalAmountSent * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalDeductible: Math.round(totalDeductible * 100) / 100,
        taxReduction,
        tmiRate,
      },
      case6GU: {
        amount: Math.round(totalDeductible * 100) / 100,
        instruction:
          "Reportez ce montant dans la case 6GU de votre déclaration de revenus (pension alimentaire versée à un ascendant).",
      },
      receiptsDetails: receipts,
      canDownloadPDF: true,
      pdfPath: order?.pdf_path || null,
      attestation: {
        message: "Les transferts sont validés sur la base de votre déclaration sur l'honneur.",
        warning: "Conservez vos justificatifs de lien de parenté en cas de contrôle fiscal.",
      },
    });
  } catch (error) {
    console.error("[CalculateTax] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors du calcul" },
      { status: 500 }
    );
  }
}
