import { createClient } from "./client";
import { createServerSupabaseClient } from "./server";
import type { Order, InsertOrder, UpdateOrder } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Prix du dossier fiscal complet
export const DOSSIER_PRICE = 49; // EUR
export const DOSSIER_CURRENCY = "EUR";

// Helper pour obtenir le bon client selon l'environnement
function getSupabaseClient(serverClient?: SupabaseClient): SupabaseClient {
  if (serverClient) return serverClient;
  // Si on est côté serveur (pas de window), utiliser le client serveur
  if (typeof window === "undefined") {
    return createServerSupabaseClient();
  }
  return createClient();
}

/**
 * Vérifie si l'utilisateur a payé pour une année fiscale donnée
 * @param userId - ID de l'utilisateur
 * @param taxYear - Année fiscale (par défaut: année en cours)
 * @param supabaseClient - Client Supabase optionnel (pour usage serveur)
 */
export async function hasUserPaidForYear(
  userId: string,
  taxYear: number = new Date().getFullYear(),
  supabaseClient?: SupabaseClient
): Promise<{ hasPaid: boolean; order: Order | null; error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("tax_year", taxYear)
    .eq("status", "completed")
    .maybeSingle();

  if (error) {
    console.error("[Orders] Error checking payment status:", error);
    return { hasPaid: false, order: null, error: new Error(error.message) };
  }

  return {
    hasPaid: !!data,
    order: data as Order | null,
    error: null,
  };
}

/**
 * Crée une nouvelle commande en attente de paiement
 */
export async function createPendingOrder(
  userId: string,
  taxYear: number = new Date().getFullYear(),
  supabaseClient?: SupabaseClient
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  // Vérifier s'il n'y a pas déjà une commande complétée pour cette année
  const { hasPaid } = await hasUserPaidForYear(userId, taxYear, supabase);
  if (hasPaid) {
    return { data: null, error: new Error("Vous avez déjà payé pour cette année fiscale") };
  }

  // Supprimer les anciennes commandes en attente pour cette année
  await supabase
    .from("orders")
    .delete()
    .eq("user_id", userId)
    .eq("tax_year", taxYear)
    .eq("status", "pending");

  const orderData: InsertOrder = {
    user_id: userId,
    tax_year: taxYear,
    amount: DOSSIER_PRICE,
    currency: DOSSIER_CURRENCY,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("[Orders] Error creating order:", error);
    return { data: null, error: new Error(error.message) };
  }

  console.log("[Orders] Created pending order:", data?.id);
  return { data: data as Order, error: null };
}

/**
 * Met à jour le statut d'une commande avec les infos Stripe
 */
export async function updateOrderWithStripe(
  orderId: string,
  stripeData: {
    sessionId?: string;
    paymentIntentId?: string;
    status: Order["status"];
  },
  supabaseClient?: SupabaseClient
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  const updateData: UpdateOrder = {
    status: stripeData.status,
  };

  if (stripeData.sessionId) {
    updateData.stripe_session_id = stripeData.sessionId;
  }
  if (stripeData.paymentIntentId) {
    updateData.stripe_payment_intent_id = stripeData.paymentIntentId;
  }
  if (stripeData.status === "completed") {
    updateData.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("[Orders] Error updating order:", error);
    return { data: null, error: new Error(error.message) };
  }

  console.log("[Orders] Updated order:", orderId, "status:", stripeData.status);
  return { data: data as Order, error: null };
}

/**
 * Marque une commande comme complétée (après paiement confirmé)
 */
export async function completeOrder(
  orderId: string,
  stripePaymentIntentId: string,
  supabaseClient?: SupabaseClient
): Promise<{ data: Order | null; error: Error | null }> {
  return updateOrderWithStripe(orderId, {
    paymentIntentId: stripePaymentIntentId,
    status: "completed",
  }, supabaseClient);
}

/**
 * Récupère la commande d'un utilisateur pour une année fiscale
 */
export async function getUserOrderForYear(
  userId: string,
  taxYear: number = new Date().getFullYear(),
  supabaseClient?: SupabaseClient
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("tax_year", taxYear)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Orders] Error fetching order:", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as Order | null, error: null };
}

/**
 * Met à jour le chemin du PDF généré
 */
export async function updateOrderPdfPath(
  orderId: string,
  pdfPath: string,
  supabaseClient?: SupabaseClient
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  const { error } = await supabase
    .from("orders")
    .update({
      pdf_generated: true,
      pdf_path: pdfPath,
    })
    .eq("id", orderId);

  if (error) {
    console.error("[Orders] Error updating PDF path:", error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

/**
 * Récupère une commande par son session ID Stripe
 */
export async function getOrderByStripeSession(
  sessionId: string,
  supabaseClient?: SupabaseClient
): Promise<{ data: Order | null; error: Error | null }> {
  const supabase = getSupabaseClient(supabaseClient);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("[Orders] Error fetching order by session:", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as Order | null, error: null };
}
