"use client";

import { useState } from "react";
import {
  Check,
  Lock,
  FileText,
  Download,
  Loader2,
  Shield,
  ArrowRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { isAdminTestEmail, isDevelopment } from "@/lib/admin-config";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PaywallSummary {
  receiptsCount: number;
  estimatedTaxReduction?: number;
  taxReduction?: number;
  tmiRate: number;
  totalAmountSent?: number;
  totalFees?: number;
  totalDeductible?: number;
}

interface Case6GU {
  amount: number;
  instruction: string;
}

interface PaywallCardProps {
  hasPaid: boolean;
  summary: PaywallSummary;
  case6GU?: Case6GU | null;
  pdfPath?: string | null;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
  userEmail?: string | null;
  onAdminBypass?: () => void;
  bypassLoading?: boolean;
}

export default function PaywallCard({
  hasPaid,
  summary,
  case6GU,
  pdfPath,
  onCheckout,
  checkoutLoading = false,
  userEmail,
  onAdminBypass,
  bypassLoading = false,
}: PaywallCardProps) {
  const [downloading, setDownloading] = useState(false);

  // Vérifier si l'utilisateur est un admin/testeur
  const isAdmin = isAdminTestEmail(userEmail);
  const showAdminBypass = (isAdmin || isDevelopment()) && !hasPaid;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYear: new Date().getFullYear() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération du PDF");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = `Kivio_Dossier_Fiscal_${new Date().getFullYear()}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          fileName = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF téléchargé !", {
        description: fileName,
      });
    } catch (error) {
      console.error("[PaywallCard] PDF download error:", error);
      toast.error("Erreur lors du téléchargement", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header - Analyse terminée */}
      <div className="flex items-center gap-2">
        <Check className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Analyse terminée
        </h2>
      </div>

      {/* Case 6GU - visible uniquement si payé */}
      {hasPaid && case6GU && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
              Case 6GU
            </span>
            <span className="text-xs text-gray-500">Montant à déclarer</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {formatCurrency(case6GU.amount)}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Reportez ce montant dans la case 6GU de votre déclaration de revenus
            (« Autres pensions alimentaires versées »).
          </p>
        </div>
      )}

      {/* Si non payé: PAYWALL */}
      {!hasPaid && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-2">Pour obtenir :</p>
          </div>

          {/* Liste des fonctionnalités verrouillées */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-300">
                Le montant exact à déclarer
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-300">
                Le détail de vos transferts
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-300">
                Votre dossier fiscal complet (PDF)
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-300">
                Le justificatif à conserver 3 ans
              </span>
            </div>
          </div>

          {/* Bouton de paiement */}
          <button
            onClick={onCheckout}
            disabled={checkoutLoading}
            className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black font-semibold text-base flex items-center justify-center gap-2"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection...
              </>
            ) : (
              <>
                Débloquer mon dossier - 49€
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Garanties */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Satisfait ou remboursé</span>
            </div>
          </div>

          {/* Bouton Admin/Dev - visible uniquement pour les testeurs */}
          {showAdminBypass && onAdminBypass && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={onAdminBypass}
                disabled={bypassLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-amber-400 font-medium text-sm flex items-center justify-center gap-2"
              >
                {bypassLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Déblocage...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    [DEV] Débloquer sans payer
                  </>
                )}
              </button>
              <p className="text-center text-xs text-amber-500/60 mt-2">
                Mode test - {isAdmin ? "Compte admin" : "Dev mode"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Si payé: Récapitulatif complet + téléchargement PDF */}
      {hasPaid && (
        <>
          {/* Récapitulatif des reçus */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Récapitulatif des Reçus
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Reçus validés</span>
                <span className="text-white text-sm">
                  {summary.receiptsCount}
                </span>
              </div>
              {summary.totalAmountSent !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total envoyé</span>
                  <span className="text-white text-sm">
                    {formatCurrency(summary.totalAmountSent)}
                  </span>
                </div>
              )}
              {summary.totalFees !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">
                    Frais de transfert
                  </span>
                  <span className="text-white text-sm">
                    +{formatCurrency(summary.totalFees)}
                  </span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2" />
              {summary.totalDeductible !== undefined && (
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-400">Total déductible</span>
                  <span className="text-emerald-400">
                    {formatCurrency(summary.totalDeductible)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bouton télécharger PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Télécharger mon dossier fiscal (PDF)
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
