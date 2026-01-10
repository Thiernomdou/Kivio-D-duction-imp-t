import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { completeOrder, getUserOrderForYear } from "@/lib/supabase/orders";

/**
 * API pour confirmer un paiement (mode développement)
 * En production, cette logique sera dans le webhook Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Vérifier l'authentification
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
    const { orderId, taxYear = new Date().getFullYear() } = await request.json();

    console.log("[Checkout/Confirm] Confirming payment for order:", orderId);

    // Si orderId est fourni, utiliser directement
    // Sinon, récupérer la dernière commande pending de l'utilisateur
    let orderToConfirm = orderId;

    if (!orderToConfirm) {
      const { data: pendingOrder } = await getUserOrderForYear(user.id, taxYear, supabase);
      if (pendingOrder && pendingOrder.status === "pending") {
        orderToConfirm = pendingOrder.id;
      }
    }

    if (!orderToConfirm) {
      return NextResponse.json(
        { error: "Aucune commande en attente trouvée" },
        { status: 400 }
      );
    }

    // Marquer la commande comme complétée (passer le client serveur)
    const { data: completedOrder, error: completeError } = await completeOrder(
      orderToConfirm,
      `dev_${Date.now()}`, // Simule un payment intent ID
      supabase
    );

    if (completeError || !completedOrder) {
      console.error("[Checkout/Confirm] Error completing order:", completeError);
      return NextResponse.json(
        { error: completeError?.message || "Erreur lors de la confirmation" },
        { status: 500 }
      );
    }

    console.log("[Checkout/Confirm] Order confirmed:", completedOrder.id);

    return NextResponse.json({
      success: true,
      order: completedOrder,
      message: "Paiement confirmé avec succès",
    });
  } catch (error) {
    console.error("[Checkout/Confirm] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors de la confirmation" },
      { status: 500 }
    );
  }
}
