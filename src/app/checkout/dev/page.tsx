"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Gradient text style
const gradientStyle = {
  background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function CheckoutDevContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulatePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement");
      }

      setSuccess(true);
      toast.success("Paiement simulé avec succès !");

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push("/dashboard?payment=success");
      }, 2000);
    } catch (error) {
      console.error("[DevCheckout] Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du paiement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard?payment=cancelled");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Paiement confirmé !
          </h1>
          <p className="text-gray-400 mb-6">
            Redirection vers votre tableau de bord...
          </p>
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Warning banner */}
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">
                Mode Développement
              </p>
              <p className="text-xs text-amber-300/70 mt-1">
                Cette page simule le processus de paiement Stripe. En
                production, vous serez redirigé vers Stripe Checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Checkout card */}
        <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/10">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">
              Dossier Fiscal Kivio
            </h1>
            <p className="text-gray-400 text-sm">
              Année fiscale {new Date().getFullYear()}
            </p>
          </div>

          {/* Price */}
          <div className="text-center py-6 border-y border-white/10">
            <p className="text-5xl font-bold" style={gradientStyle}>
              49€
            </p>
            <p className="text-gray-500 text-sm mt-2">Paiement unique</p>
          </div>

          {/* Features */}
          <div className="py-6 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Montant exact à déclarer (case 6GU)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Détail de tous vos transferts
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Dossier fiscal complet (PDF)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Justificatif à conserver 3 ans
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSimulatePayment}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black font-semibold text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Simuler le paiement
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-medium text-sm"
            >
              Annuler
            </button>
          </div>

          {/* Order ID */}
          {orderId && (
            <p className="text-center text-xs text-gray-600 mt-4">
              Commande: {orderId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutDevPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <CheckoutDevContent />
    </Suspense>
  );
}
