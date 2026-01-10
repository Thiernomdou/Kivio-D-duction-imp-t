import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPendingOrder, completeOrder } from "@/lib/supabase/orders";
import { canBypassPayment, isAdminTestEmail } from "@/lib/admin-config";

/**
 * API pour bypasser le paiement (admin/test uniquement)
 * Crée une commande et la marque immédiatement comme complétée
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
    const { taxYear = new Date().getFullYear(), bypassParam = false } = await request.json();

    // Vérifier si le bypass est autorisé
    const canBypass = canBypassPayment(user.email, bypassParam);

    if (!canBypass) {
      console.log("[AdminBypass] Unauthorized bypass attempt:", user.email);
      return NextResponse.json(
        { error: "Non autorisé. Cette fonctionnalité est réservée aux administrateurs." },
        { status: 403 }
      );
    }

    console.log("[AdminBypass] Bypassing payment for:", user.email, "year:", taxYear);

    // Créer une commande en attente (passer le client serveur pour bypasser les RLS)
    const { data: order, error: orderError } = await createPendingOrder(user.id, taxYear, supabase);

    if (orderError) {
      // Si l'erreur est "déjà payé", c'est OK
      if (orderError.message.includes("déjà payé")) {
        console.log("[AdminBypass] User already has access");
        return NextResponse.json({
          success: true,
          bypassed: true,
          alreadyPaid: true,
          message: "Accès déjà débloqué pour cette année",
        });
      }

      console.error("[AdminBypass] Order creation error:", orderError);
      return NextResponse.json(
        { error: orderError.message },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Erreur lors de la création de la commande" },
        { status: 500 }
      );
    }

    // Marquer immédiatement comme complétée (bypass) - passer le client serveur
    const { data: completedOrder, error: completeError } = await completeOrder(
      order.id,
      `admin_bypass_${Date.now()}`,
      supabase
    );

    if (completeError || !completedOrder) {
      console.error("[AdminBypass] Complete error:", completeError);
      return NextResponse.json(
        { error: "Erreur lors du déblocage" },
        { status: 500 }
      );
    }

    // Logger le bypass pour audit
    console.log("[AdminBypass] SUCCESS - Payment bypassed:", {
      userId: user.id,
      email: user.email,
      orderId: completedOrder.id,
      taxYear,
      isAdmin: isAdminTestEmail(user.email),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      bypassed: true,
      order: completedOrder,
      message: "Accès débloqué avec succès (mode test)",
    });
  } catch (error) {
    console.error("[AdminBypass] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur inattendue" },
      { status: 500 }
    );
  }
}
