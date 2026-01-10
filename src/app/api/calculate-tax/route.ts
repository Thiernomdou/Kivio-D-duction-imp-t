import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  matchParenthood,
  getValidationStatus,
  getRelationLabel,
} from "@/lib/parenthood-matcher";
import type { Receipt, IdentityDocument } from "@/lib/supabase/types";

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

    // 2. Get identity document for parenthood matching
    const { data: identityDoc, error: identityError } = await supabase
      .from("identity_documents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (identityError || !identityDoc) {
      console.error("[CalculateTax] Identity doc error:", identityError);
      return NextResponse.json(
        { error: "Document d'identité non trouvé. Veuillez télécharger un justificatif de parenté." },
        { status: 400 }
      );
    }

    console.log("[CalculateTax] Identity document found:", {
      father: identityDoc.father_name,
      mother: identityDoc.mother_name,
      children: (identityDoc.children as { name: string }[])?.length || 0,
    });

    // 3. Get all receipts for the year
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

    // 4. Match each receipt against identity document
    let totalAmountSent = 0;
    let totalFees = 0;
    let totalDeductible = 0;
    const matchedRelations: Record<string, number> = {};
    const validatedReceipts: string[] = [];
    const pendingReview: string[] = [];
    const rejectedReceipts: string[] = [];

    for (const receipt of receipts as Receipt[]) {
      if (!receipt.receiver_name) {
        console.log("[CalculateTax] Skipping receipt without receiver:", receipt.id);
        continue;
      }

      // Match against family members
      const match = matchParenthood(receipt.receiver_name, {
        father_name: identityDoc.father_name,
        mother_name: identityDoc.mother_name,
        children: identityDoc.children as { name: string; birth_date?: string }[],
      });

      const validationStatus = getValidationStatus(match);

      console.log("[CalculateTax] Receipt match:", {
        receiptId: receipt.id,
        receiver: receipt.receiver_name,
        matchedName: match.matchedName,
        relation: match.relation,
        confidence: match.confidence,
        status: validationStatus,
      });

      // Update receipt with match result
      const { error: updateError } = await supabase
        .from("receipts")
        .update({
          matched_relation: match.relation,
          match_confidence: match.confidence,
          validation_status: validationStatus,
          is_validated: match.isMatch,
        })
        .eq("id", receipt.id);

      if (updateError) {
        console.error("[CalculateTax] Update error for receipt:", receipt.id, updateError);
      }

      // Track results
      if (match.isMatch) {
        // Auto-validated
        const amountEur = receipt.amount_eur || 0;
        const fees = receipt.fees || 0;
        totalAmountSent += amountEur;
        totalFees += fees;
        totalDeductible += amountEur + fees; // Fees are also deductible

        if (match.relation) {
          matchedRelations[match.relation] = (matchedRelations[match.relation] || 0) + 1;
        }
        validatedReceipts.push(receipt.id);
      } else if (match.requiresManualReview) {
        pendingReview.push(receipt.id);
      } else {
        rejectedReceipts.push(receipt.id);
      }
    }

    // 5. Calculate tax reduction: totalDeductible * (TMI / 100)
    const taxReduction = Math.round(totalDeductible * (tmiRate / 100) * 100) / 100;

    console.log("[CalculateTax] Summary:", {
      totalReceipts: validatedReceipts.length,
      totalAmountSent,
      totalFees,
      totalDeductible,
      taxReduction,
      pendingReview: pendingReview.length,
      rejected: rejectedReceipts.length,
    });

    // 6. Upsert tax calculation summary
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
          matched_relations: matchedRelations,
          status: pendingReview.length > 0 ? "draft" : "calculated",
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

    // Build response with detailed summary
    const relationsSummary = Object.entries(matchedRelations).map(([relation, count]) => ({
      relation,
      label: getRelationLabel(relation as "father" | "mother" | "child"),
      count,
    }));

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
        matchedRelations: relationsSummary,
        pendingReviewCount: pendingReview.length,
        rejectedCount: rejectedReceipts.length,
      },
      case6GU: {
        amount: Math.round(totalDeductible * 100) / 100,
        instruction:
          "Reportez ce montant dans la case 6GU de votre déclaration de revenus (pension alimentaire versée à un ascendant).",
      },
      familyVerification: {
        documentType: identityDoc.document_type,
        fatherName: identityDoc.father_name,
        motherName: identityDoc.mother_name,
        childrenCount: (identityDoc.children as { name: string }[])?.length || 0,
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
