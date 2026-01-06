import { createClient } from "./client";
import type { Profile } from "./types";

export interface FiscalProfileData {
  monthlyAmount: number;
  beneficiaryType: string;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
  spouseIncome?: number;
  tmi: number;
  estimatedRecovery: number;
}

/**
 * Sauvegarde ou met à jour le profil fiscal d'un utilisateur
 */
export async function saveFiscalProfile(
  userId: string,
  data: FiscalProfileData
): Promise<{ data: Profile | null; error: Error | null }> {
  const supabase = createClient();

  console.log("[FiscalProfile] Saving for user:", userId, data);

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      monthly_amount: data.monthlyAmount,
      beneficiary_type: data.beneficiaryType,
      is_married: data.isMarried,
      children_count: data.childrenCount,
      annual_income: data.annualIncome,
      spouse_income: data.spouseIncome || null,
      tmi: data.tmi,
      estimated_recovery: data.estimatedRecovery,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("[FiscalProfile] Error saving:", error);
    return { data: null, error: new Error(error.message) };
  }

  console.log("[FiscalProfile] Saved successfully:", profile.estimated_recovery);
  return { data: profile, error: null };
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
