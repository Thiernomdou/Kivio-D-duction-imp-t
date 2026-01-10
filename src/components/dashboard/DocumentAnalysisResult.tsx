"use client";

import {
  Check,
  AlertTriangle,
  Users,
  FileText,
  Euro,
  ArrowRight,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface RelationCardProps {
  relation: string;
  label: string;
  count: number;
}

function RelationCard({ relation, label, count }: RelationCardProps) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/5">
      <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
      <p className="text-sm text-white">{label}</p>
      <p className="text-xs text-gray-500">{count} reçu{count > 1 ? "s" : ""}</p>
    </div>
  );
}

export default function DocumentAnalysisResult() {
  const {
    taxCalculationSummary,
    identityDocument,
  } = useDashboard();

  // Only show results if calculation is complete
  if (!taxCalculationSummary) {
    return null;
  }

  const {
    totalReceipts,
    totalAmountSent,
    totalFees,
    totalDeductible,
    taxReduction,
    tmiRate,
    matchedRelations,
    pendingReviewCount,
  } = taxCalculationSummary;

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
        <Check className="w-5 h-5 text-emerald-400" />
        Analyse terminée
      </h2>

      {/* Parenté Verification Card */}
      {matchedRelations.length > 0 && (
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-emerald-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Vérification de Parenté
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Liens familiaux vérifiés
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {matchedRelations.map((rel) => (
              <RelationCard
                key={rel.relation}
                relation={rel.relation}
                label={rel.label}
                count={rel.count}
              />
            ))}
          </div>

          {identityDocument && (
            <div className="mt-4 p-3 rounded-xl bg-white/5 text-xs text-gray-400">
              <p>
                Document: {identityDocument.document_type === "livret_famille"
                  ? "Livret de famille"
                  : identityDocument.document_type === "extrait_naissance"
                  ? "Extrait de naissance"
                  : "Acte de naissance"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Card */}
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
            <span className="text-white text-sm">{totalReceipts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Total envoyé</span>
            <span className="text-white text-sm">{formatCurrency(totalAmountSent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Frais de transfert</span>
            <span className="text-white text-sm">+{formatCurrency(totalFees)}</span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-400">Total déductible</span>
            <span className="text-emerald-400">{formatCurrency(totalDeductible)}</span>
          </div>
        </div>
      </div>

      {/* Tax Reduction Card */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          <h3 className="font-semibold text-white text-sm sm:text-base">
            Votre Réduction d&apos;Impôt
          </h3>
        </div>

        <div className="text-center py-4">
          <p className="text-4xl sm:text-5xl font-bold text-emerald-400">
            {formatCurrency(taxReduction)}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            TMI {tmiRate}% × {formatCurrency(totalDeductible)} déductible
          </p>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
              Case 6GU
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Reportez <span className="text-white font-medium">{formatCurrency(totalDeductible)}</span> dans
            la case 6GU de votre déclaration de revenus (pension alimentaire versée à un ascendant).
          </p>
        </div>
      </div>

      {/* Pending Review Warning */}
      {pendingReviewCount > 0 && (
        <div className="rounded-xl sm:rounded-2xl p-4 bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-300 font-medium">
                {pendingReviewCount} reçu{pendingReviewCount > 1 ? "s" : ""} nécessite{pendingReviewCount > 1 ? "nt" : ""} une vérification manuelle
              </p>
              <p className="text-xs text-orange-400/70 mt-1">
                Le nom du bénéficiaire ne correspond pas exactement aux membres de votre famille.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Dossier Button */}
      <button
        className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 active:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2"
      >
        Générer mon dossier fiscal
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
