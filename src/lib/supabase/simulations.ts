import { createClient } from "./client";
import type { InsertTaxSimulation, TaxSimulation } from "./types";
import type { TaxResult, BeneficiaryType } from "../tax-calculator";

export interface SimulationInput {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
}

export interface SimulationData extends SimulationInput {
  result: TaxResult;
  eligible: boolean;
}

/**
 * Sauvegarde une simulation fiscale pour l'utilisateur connecté
 */
export async function saveSimulation(
  userId: string,
  data: SimulationData
): Promise<{ data: TaxSimulation | null; error: Error | null }> {
  const supabase = createClient();

  const simulation: InsertTaxSimulation = {
    user_id: userId,
    monthly_sent: data.monthlySent,
    annual_deduction: data.result.annualDeduction,
    beneficiary_type: data.beneficiaryType,
    is_married: data.isMarried,
    children_count: data.childrenCount,
    annual_income: data.annualIncome,
    tax_gain: data.result.gain,
    tmi: data.result.tmi,
    tax_before: data.result.taxBefore,
    tax_after: data.result.taxAfter,
    fiscal_parts: data.result.parts,
    is_eligible: data.eligible,
  };

  const { data: result, error } = await supabase
    .from("tax_simulations")
    .insert(simulation)
    .select()
    .single();

  if (error) {
    console.error("Error saving simulation:", error);
    return { data: null, error: new Error(error.message) };
  }

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
