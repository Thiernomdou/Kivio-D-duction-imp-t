import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    const body = await request.json();
    const {
      monthlySent,
      beneficiaryType,
      expenseType,
      isMarried,
      childrenCount,
      annualIncome,
      // Calculated results
      tmi,
      estimatedRecovery,
      fiscalParts,
      taxBefore,
      taxAfter,
    } = body;

    console.log("[SaveQuestionnaire] Saving for user:", user.id, body);

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const profileData = {
      monthly_amount: monthlySent,
      beneficiary_type: beneficiaryType,
      expense_type: expenseType,
      is_married: isMarried,
      children_count: childrenCount,
      annual_income: annualIncome,
      tmi: tmi,
      estimated_recovery: estimatedRecovery || 0,
      fiscal_parts: fiscalParts,
      tax_before: taxBefore,
      tax_after: taxAfter,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("[SaveQuestionnaire] Update error:", error);
        return NextResponse.json(
          { error: `Erreur lors de la mise à jour: ${error.message}` },
          { status: 500 }
        );
      }
      result = data;
      console.log("[SaveQuestionnaire] Profile updated:", result.id);
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        console.error("[SaveQuestionnaire] Insert error:", error);
        return NextResponse.json(
          { error: `Erreur lors de la sauvegarde: ${error.message}` },
          { status: 500 }
        );
      }
      result = data;
      console.log("[SaveQuestionnaire] Profile created:", result.id);
    }

    return NextResponse.json({
      success: true,
      profile: result,
    });
  } catch (error) {
    console.error("[SaveQuestionnaire] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
