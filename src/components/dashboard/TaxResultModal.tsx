"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Receipt as ReceiptIcon, Calculator, Plus, ArrowRight } from "lucide-react";
import type { Receipt } from "@/lib/supabase/types";
import type { TaxCalculationSummary } from "@/contexts/DashboardContext";
import type { Profile } from "@/lib/supabase/types";

interface TaxResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMoreReceipts: () => void;
  onViewTotal: () => void;
  receipts: Receipt[];
  summary: TaxCalculationSummary;
  fiscalProfile: Profile | null;
}

export default function TaxResultModal({
  isOpen,
  onClose,
  onAddMoreReceipts,
  onViewTotal,
  receipts,
  summary,
  fiscalProfile,
}: TaxResultModalProps) {
  // Format date to French locale
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date inconnue";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency in EUR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get user situation text
  const getSituationText = () => {
    const parts = [];
    if (fiscalProfile?.is_married) {
      parts.push("Marié(e)");
    } else {
      parts.push("Célibataire");
    }
    if (fiscalProfile?.annual_income) {
      parts.push(`Revenus : ${formatCurrency(fiscalProfile.annual_income)}/an`);
    }
    parts.push(`TMI : ${summary.tmiRate}%`);
    return parts.join(" | ");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with checkmark */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-accent-purple" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Analyse terminée
                </h2>
              </div>

              {/* Section: Receipts analyzed */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Reçus analysés : {receipts.length}
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {receipts.map((receipt) => {
                    const amountEur = receipt.amount_eur || 0;
                    const fees = receipt.fees || 0;
                    const total = amountEur + fees;

                    return (
                      <div
                        key={receipt.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ReceiptIcon className="w-4 h-4 text-accent-purple" />
                          <span className="text-white font-medium">
                            {receipt.provider || "Transfert"} - {formatDate(receipt.transfer_date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Destinataire : {receipt.receiver_name || "Non spécifié"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Montant : {formatCurrency(amountEur)}
                          {fees > 0 && ` + ${formatCurrency(fees)} frais`}
                          {fees > 0 && ` = ${formatCurrency(total)}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section: Total deductible */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total déductible</span>
                  <span className="text-xl font-bold text-white">
                    {summary.totalDeductible !== undefined
                      ? formatCurrency(summary.totalDeductible)
                      : "***"}
                  </span>
                </div>
              </div>

              {/* Section: User situation */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <p className="text-sm text-gray-400">
                  Votre situation : <span className="text-white">{getSituationText()}</span>
                </p>
              </div>

              {/* Section: Tax deduction - highlighted */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 border border-accent-purple/30 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-accent-purple" />
                  <span className="text-accent-purple font-semibold">
                    {summary.taxReduction !== undefined
                      ? "Votre déduction fiscale"
                      : "Déduction fiscale estimée"}
                  </span>
                </div>
                <p className="text-4xl font-bold gradient-text">
                  {summary.taxReduction !== undefined
                    ? formatCurrency(summary.taxReduction)
                    : `~${formatCurrency(summary.estimatedTaxReduction || 0)}`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onAddMoreReceipts}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter d&apos;autres reçus
                </button>
                <button
                  onClick={onViewTotal}
                  className="flex-1 py-3 px-4 rounded-xl bg-accent-purple hover:bg-accent-purple/80 transition-colors text-black font-semibold text-sm flex items-center justify-center gap-2"
                >
                  Voir mon total
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
