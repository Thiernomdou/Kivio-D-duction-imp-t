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
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { isAdminTestEmail, isDevelopment, TESTING_MODE_BYPASS_PAYWALL } from "@/lib/admin-config";
import type { Receipt } from "@/lib/supabase/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  receipts?: Receipt[];
}

// Type pour le récapitulatif par bénéficiaire
interface BeneficiarySum {
  name: string;
  totalAmount: number;
  totalFees: number;
  count: number;
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
  receipts = [],
}: PaywallCardProps) {
  const [downloading, setDownloading] = useState(false);

  // Vérifier si l'utilisateur est un admin/testeur
  const isAdmin = isAdminTestEmail(userEmail);
  // Masquer le paywall en mode test
  const showPaywall = !hasPaid && !TESTING_MODE_BYPASS_PAYWALL;
  const showAdminBypass = (isAdmin || isDevelopment()) && showPaywall;

  // Normaliser un nom (première lettre majuscule, reste minuscule)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculer le récapitulatif par bénéficiaire (grouper par nom normalisé)
  const beneficiarySums: BeneficiarySum[] = receipts.reduce((acc, receipt) => {
    const rawName = receipt.receiver_name || "Bénéficiaire inconnu";
    const name = normalizeName(rawName);
    const existing = acc.find(b => b.name.toLowerCase() === name.toLowerCase());
    const amount = receipt.amount_eur || 0;
    const fees = receipt.fees || 0;

    if (existing) {
      existing.totalAmount += amount;
      existing.totalFees += fees;
      existing.count += 1;
    } else {
      acc.push({
        name,
        totalAmount: amount,
        totalFees: fees,
        count: 1,
      });
    }
    return acc;
  }, [] as BeneficiarySum[]);

  // Trier par montant total décroissant
  beneficiarySums.sort((a, b) => (b.totalAmount + b.totalFees) - (a.totalAmount + a.totalFees));

  // Calculer les totaux depuis les receipts si pas dans le summary
  const totalAmountSent = summary.totalAmountSent ?? receipts.reduce((sum, r) => sum + (r.amount_eur || 0), 0);
  const totalFees = summary.totalFees ?? receipts.reduce((sum, r) => sum + (r.fees || 0), 0);
  const totalDeductible = summary.totalDeductible ?? (totalAmountSent + totalFees);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Envoyer le TMI du dashboard pour garantir la cohérence avec l'affichage
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxYear: new Date().getFullYear(),
          tmiRate: summary.tmiRate, // TMI affiché dans le dashboard
        }),
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
        <Check className="w-5 h-5 text-accent-purple" />
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Analyse terminée
        </h2>
      </div>

      {/* Case 6GU - Montant à déclarer */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
            Case 6GU
          </span>
          <span className="text-xs text-gray-500">Montant à déclarer</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {formatCurrency(case6GU?.amount || totalDeductible)}
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          Reportez ce montant dans la case 6GU de votre déclaration de revenus
          (« Autres pensions alimentaires versées »).
        </p>
      </div>

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
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Total envoyé</span>
            <span className="text-white text-sm">
              {formatCurrency(totalAmountSent)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">
              Frais de transfert
            </span>
            <span className="text-white text-sm">
              +{formatCurrency(totalFees)}
            </span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-400">Total déductible</span>
            <span className="text-accent-purple">
              {formatCurrency(totalDeductible)}
            </span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Votre TMI</span>
            <span className="text-white text-sm font-medium">
              {summary.tmiRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Économie d'impôt</span>
            <span className="text-green-400 text-sm font-semibold">
              {formatCurrency((summary.taxReduction ?? summary.estimatedTaxReduction) || (totalDeductible * summary.tmiRate / 100))}
            </span>
          </div>
        </div>
      </div>

      {/* Détail par bénéficiaire - TOUJOURS VISIBLE */}
      {beneficiarySums.length > 0 && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-accent-purple/30">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Détail par bénéficiaire
              </h3>
              <p className="text-xs text-gray-500">
                Ce que vous avez envoyé à chaque personne
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {beneficiarySums.map((beneficiary, index) => {
              const totalWithFees = beneficiary.totalAmount + beneficiary.totalFees;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {beneficiary.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {beneficiary.count} envoi{beneficiary.count > 1 ? "s" : ""}
                      {beneficiary.totalFees > 0 && ` • +${formatCurrency(beneficiary.totalFees)} de frais`}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-accent-purple font-semibold text-sm">
                      {formatCurrency(totalWithFees)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
            <p className="text-xs text-accent-purple/80">
              <strong>Pour votre déclaration :</strong> Reportez le montant total par bénéficiaire dans le détail de la case 6GU. Le fisc demande de préciser à qui vous avez versé la pension alimentaire.
            </p>
          </div>
        </div>
      )}

      {/* Si non payé ET paywall actif: PAYWALL */}
      {showPaywall && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-2">Pour obtenir :</p>
          </div>

          {/* Liste des fonctionnalités verrouillées */}
          <div className="space-y-3 mb-6">
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
            className="w-full py-4 px-6 rounded-xl bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black font-semibold text-base flex items-center justify-center gap-2"
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

      {/* Bouton télécharger PDF - toujours visible en mode test ou si payé */}
      {(hasPaid || TESTING_MODE_BYPASS_PAYWALL) && (
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full py-3 px-4 rounded-xl bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black font-semibold text-sm flex items-center justify-center gap-2"
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
      )}
    </div>
  );
}
