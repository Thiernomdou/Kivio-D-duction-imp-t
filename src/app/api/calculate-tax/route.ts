import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Receipt } from "@/lib/supabase/types";

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

    // 1. Get user's TMI from fiscal profile
    const { data: fiscalProfile, error: profileError } = await supabase
      .from("profiles")
      .select("tmi, beneficiary_type")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[CalculateTax] Profile error:", profileError);
      return NextResponse.json(
        { error: "Profil fiscal non trouvé. Veuillez compléter votre simulation." },
        { status: 400 }
      );
    }

    const tmiRate = fiscalProfile?.tmi || 30; // Default 30%
    console.log("[CalculateTax] TMI rate:", tmiRate);

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

      // Mark receipt as validated (attestation sur l'honneur)
      const { error: updateError } = await supabase
        .from("receipts")
        .update({
          validation_status: "auto_validated",
          is_validated: true,
        })
        .eq("id", receipt.id);

      if (updateError) {
        console.error("[CalculateTax] Update error for receipt:", receipt.id, updateError);
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

    return NextResponse.json({
      success: true,
      taxCalculation: taxCalc,
      summary: {
        totalReceipts: validatedReceipts.length,
        totalAmountSent: Math.round(totalAmountSent * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalDeductible: Math.round(totalDeductible * 100) / 100,
        taxReduction,
        tmiRate,
        matchedRelations: [], // No longer used
        pendingReviewCount: 0,
        rejectedCount: 0,
      },
      case6GU: {
        amount: Math.round(totalDeductible * 100) / 100,
        instruction:
          "Reportez ce montant dans la case 6GU de votre déclaration de revenus (pension alimentaire versée à un ascendant).",
      },
      // Note: attestation sur l'honneur - no family verification
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
