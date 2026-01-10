import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPendingOrder, DOSSIER_PRICE } from "@/lib/supabase/orders";

// Stripe (à décommenter quand Stripe est configuré)
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// });

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
    const { taxYear = new Date().getFullYear() } = await request.json();

    console.log("[Checkout] Creating checkout session for user:", user.id, "year:", taxYear);

    // Créer une commande en attente (passer le client serveur pour bypasser les RLS)
    const { data: order, error: orderError } = await createPendingOrder(user.id, taxYear, supabase);

    if (orderError || !order) {
      console.error("[Checkout] Order creation error:", orderError);
      return NextResponse.json(
        { error: orderError?.message || "Erreur lors de la création de la commande" },
        { status: 400 }
      );
    }

    // URLs de redirection
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/dashboard?payment=success&order=${order.id}`;
    const cancelUrl = `${baseUrl}/dashboard?payment=cancelled`;

    // TODO: Intégration Stripe
    // Quand Stripe est configuré, décommenter le code ci-dessous:
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Dossier Fiscal Kivio ${taxYear}`,
              description: "Dossier fiscal complet avec justificatifs pour la case 6GU",
            },
            unit_amount: DOSSIER_PRICE * 100, // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
        taxYear: taxYear.toString(),
      },
    });

    // Mettre à jour la commande avec le session ID Stripe
    await updateOrderWithStripe(order.id, {
      sessionId: session.id,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      orderId: order.id,
    });
    */

    // Mode développement: simuler le checkout
    // En production, remplacer par l'intégration Stripe ci-dessus
    console.log("[Checkout] DEV MODE - Simulating checkout for order:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      // En dev, on redirige vers une page de simulation
      checkoutUrl: `${baseUrl}/checkout/dev?order=${order.id}`,
      devMode: true,
      message: "Mode développement - Stripe non configuré",
    });
  } catch (error) {
    console.error("[Checkout] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue lors du checkout" },
      { status: 500 }
    );
  }
}
