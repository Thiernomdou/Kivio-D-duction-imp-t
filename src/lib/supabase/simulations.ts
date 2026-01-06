import { createClient } from "./client";
import type { InsertTaxSimulation, TaxSimulation } from "./types";
import type { TaxResult, BeneficiaryType, ExpenseType } from "../tax-calculator";

export interface SimulationInput {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  expenseType?: ExpenseType;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
}

export interface SimulationData extends SimulationInput {
  result: TaxResult;
  eligible: boolean;
}

/**
 * S'assure que le profil existe avant de sauvegarder
 * Crée le profil immédiatement si nécessaire (ne dépend pas du trigger)
 */
async function ensureProfileExists(userId: string): Promise<boolean> {
  const supabase = createClient();

  // D'abord, vérifier si le profil existe
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (profile) {
    console.log("[Profile] Found existing profile for user:", userId);
    return true;
  }

  // Le profil n'existe pas, le créer immédiatement
  console.log("[Profile] Profile not found, creating for:", userId);

  // Récupérer les infos de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("[Profile] No user found in auth");
    return false;
  }

  // Créer le profil avec upsert (ignore si déjà existant)
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || null,
    }, {
      onConflict: 'id'
    });

  if (upsertError) {
    console.error("[Profile] Error creating profile:", upsertError.code, upsertError.message);

    // Si erreur de permission, attendre que le trigger le crée
    if (upsertError.code === '42501') {
      console.log("[Profile] Permission denied, waiting for trigger...");
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: retryProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();
        if (retryProfile) {
          console.log("[Profile] Profile created by trigger");
          return true;
        }
      }
    }
    return false;
  }

  console.log("[Profile] Successfully created profile for:", userId);
  return true;
}

/**
 * Sauvegarde ou met à jour une simulation fiscale pour l'utilisateur connecté
 * Si l'utilisateur a déjà une simulation, elle est mise à jour
 * Sinon, une nouvelle simulation est créée
 */
export async function saveSimulation(
  userId: string,
  data: SimulationData
): Promise<{ data: TaxSimulation | null; error: Error | null }> {
  const supabase = createClient();

  console.log("[SaveSimulation] Starting save for user:", userId);
  console.log("[SaveSimulation] Input data:", {
    monthlySent: data.monthlySent,
    gain: data.result?.gain,
    eligible: data.eligible
  });

  // Vérifier que les données sont valides
  if (!data || !data.result) {
    console.error("[SaveSimulation] Invalid data - missing result:", data);
    return { data: null, error: new Error("Données de simulation invalides") };
  }

  // S'assurer que le profil existe
  const profileExists = await ensureProfileExists(userId);
  if (!profileExists) {
    console.error("[SaveSimulation] Profile creation failed for:", userId);
    return { data: null, error: new Error("Impossible de créer le profil utilisateur") };
  }

  // Vérifier si l'utilisateur a déjà une simulation
  const { data: existingSimulations } = await supabase
    .from("tax_simulations")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const existingId = existingSimulations?.[0]?.id;
  console.log("[SaveSimulation] Existing simulation:", existingId || "none");

  const simulationData = {
    user_id: userId,
    monthly_sent: data.monthlySent || 0,
    annual_deduction: data.result.annualDeduction || 0,
    beneficiary_type: data.beneficiaryType || "parents",
    is_married: data.isMarried ?? false,
    children_count: data.childrenCount || 0,
    annual_income: data.annualIncome || 0,
    tax_gain: data.result.gain || 0,
    tmi: data.result.tmi || 0,
    tax_before: data.result.taxBefore || 0,
    tax_after: data.result.taxAfter || 0,
    fiscal_parts: data.result.parts || 1,
    is_eligible: data.eligible ?? true,
    updated_at: new Date().toISOString(),
  };

  let result;
  let error;

  if (existingId) {
    // Mettre à jour la simulation existante
    console.log("[SaveSimulation] Updating existing simulation:", existingId);
    const response = await supabase
      .from("tax_simulations")
      .update(simulationData)
      .eq("id", existingId)
      .select()
      .single();
    result = response.data;
    error = response.error;
  } else {
    // Créer une nouvelle simulation
    console.log("[SaveSimulation] Creating new simulation");
    const response = await supabase
      .from("tax_simulations")
      .insert(simulationData)
      .select()
      .single();
    result = response.data;
    error = response.error;
  }

  if (error) {
    console.error("[SaveSimulation] Database error:", error);
    console.error("[SaveSimulation] Error code:", error.code);
    console.error("[SaveSimulation] Error message:", error.message);
    console.error("[SaveSimulation] Error hint:", error.hint);
    return { data: null, error: new Error(error.message) };
  }

  console.log("[SaveSimulation] Successfully saved simulation:", result?.id, "tax_gain:", result?.tax_gain);
  return { data: result as TaxSimulation, error: null };
}

/**
 * Récupère toutes les simulations d'un utilisateur
 */
export async function getUserSimulations(
  userId: string
): Promise<{ data: TaxSimulation[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tax_simulations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching simulations:", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as TaxSimulation[], error: null };
}

/**
 * Récupère une simulation par son ID
 */
export async function getSimulationById(
  simulationId: string
): Promise<{ data: TaxSimulation | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tax_simulations")
    .select("*")
    .eq("id", simulationId)
    .single();

  if (error) {
    console.error("Error fetching simulation:", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as TaxSimulation, error: null };
}

/**
 * Supprime une simulation
 */
export async function deleteSimulation(
  simulationId: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tax_simulations")
    .delete()
    .eq("id", simulationId);

  if (error) {
    console.error("Error deleting simulation:", error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}
