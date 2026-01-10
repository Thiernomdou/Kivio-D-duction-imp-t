import { createClient } from "./client";
import type { Profile } from "./types";

export interface FiscalProfileData {
  monthlyAmount: number;
  beneficiaryType: string;
  expenseType?: string;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
  spouseIncome?: number;
  tmi: number;
  estimatedRecovery: number;
  fiscalParts?: number;
  taxBefore?: number;
  taxAfter?: number;
}

/**
 * Sauvegarde ou met à jour le profil fiscal d'un utilisateur
 */
export async function saveFiscalProfile(
  userId: string,
  data: FiscalProfileData,
  email?: string
): Promise<{ data: Profile | null; error: Error | null }> {
  const supabase = createClient();

  console.log("[FiscalProfile] Saving for user:", userId, data);

  const profileData = {
    monthly_amount: data.monthlyAmount,
    beneficiary_type: data.beneficiaryType,
    expense_type: data.expenseType || "alimentary",
    is_married: data.isMarried,
    children_count: data.childrenCount,
    annual_income: data.annualIncome,
    spouse_income: data.spouseIncome || null,
    tmi: data.tmi,
    estimated_recovery: data.estimatedRecovery,
    fiscal_parts: data.fiscalParts || null,
    tax_before: data.taxBefore || null,
    tax_after: data.taxAfter || null,
    updated_at: new Date().toISOString(),
  };

  // Try update first
  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();

  // If update failed because profile doesn't exist, insert it
  if (updateError && updateError.code === "PGRST116") {
    console.log("[FiscalProfile] Profile not found, creating new one");

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email || "",
        ...profileData,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[FiscalProfile] Error creating profile:", insertError);
      return { data: null, error: new Error(insertError.message) };
    }

    console.log("[FiscalProfile] Created new profile:", newProfile.estimated_recovery);
    return { data: newProfile, error: null };
  }

  if (updateError) {
    console.error("[FiscalProfile] Error saving:", updateError);
    return { data: null, error: new Error(updateError.message) };
  }

  console.log("[FiscalProfile] Saved successfully:", updatedProfile.estimated_recovery);
  return { data: updatedProfile, error: null };
}

/**
 * Récupère le profil fiscal d'un utilisateur
 */
export async function getFiscalProfile(
  userId: string
): Promise<{ data: Profile | null; error: Error | null }> {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[FiscalProfile] Error fetching:", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: profile, error: null };
}
