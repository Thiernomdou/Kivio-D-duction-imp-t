"use client";

import { useState } from "react";
import {
  Check,
  Lock,
  FileText,
  Euro,
  Download,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Gradient text style
const gradientStyle = {
  background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

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
}

export default function PaywallCard({
  hasPaid,
  summary,
  case6GU,
  pdfPath,
  onCheckout,
  checkoutLoading = false,
}: PaywallCardProps) {
  const [downloading, setDownloading] = useState(false);

  // Montant de la réduction (exact si payé, estimé sinon)
  const taxReduction = hasPaid
    ? summary.taxReduction || 0
    : summary.estimatedTaxReduction || 0;

  const handleDownloadPDF = async () => {
    if (!pdfPath) {
      toast.error("Le PDF n'est pas encore disponible");
      return;
    }

    setDownloading(true);
    try {
      // TODO: Implement PDF download
      toast.success("Téléchargement du PDF...");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
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

      {/* Nombre de reçus validés */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Reçus validés
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Prêts pour votre déclaration
              </p>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {summary.receiptsCount}
          </span>
        </div>
      </div>

      {/* Réduction d'impôt estimée / exacte */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          <h3 className="font-semibold text-white text-sm sm:text-base">
            {hasPaid ? "Votre Réduction d'Impôt" : "Réduction d'Impôt Estimée"}
          </h3>
        </div>

        <div className="text-center py-4">
          <p className="text-4xl sm:text-5xl font-bold" style={gradientStyle}>
            {hasPaid ? "" : "~"}
            {formatCurrency(taxReduction)}
          </p>
          {hasPaid && summary.totalDeductible && (
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              TMI {summary.tmiRate}% x {formatCurrency(summary.totalDeductible)} déductible
            </p>
          )}
        </div>

        {/* Case 6GU - visible uniquement si payé */}
        {hasPaid && case6GU && (
          <div className="mt-4 p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
                Case 6GU
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Reportez{" "}
              <span className="text-white font-medium">
                {formatCurrency(case6GU.amount)}
              </span>{" "}
              dans la case 6GU de votre déclaration de revenus.
            </p>
          </div>
        )}
      </div>

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
            disabled={downloading || !pdfPath}
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
