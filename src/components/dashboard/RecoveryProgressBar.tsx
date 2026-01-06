"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/tax-calculator";

export interface Receipt {
  month: number; // 1-12
  amount_eur: number;
  fees_eur: number;
}

interface RecoveryProgressBarProps {
  receipts: Receipt[];
  tmi: number; // Tranche marginale (11, 30, 41, 45)
}

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
];

export default function RecoveryProgressBar({ receipts, tmi }: RecoveryProgressBarProps) {
  // Calculer les montants par mois
  const monthlyData = MONTHS.map((name, index) => {
    const monthReceipts = receipts.filter(r => r.month === index + 1);
    const totalAmount = monthReceipts.reduce((sum, r) => sum + r.amount_eur + r.fees_eur, 0);
    const recoverable = Math.round(totalAmount * (tmi / 100));
    const hasReceipts = monthReceipts.length > 0;
    const receiptCount = monthReceipts.length;

    return {
      name,
      month: index + 1,
      totalAmount,
      recoverable,
      hasReceipts,
      receiptCount,
    };
  });

  // Total cumulé récupérable
  const totalRecoverable = monthlyData.reduce((sum, m) => sum + m.recoverable, 0);
  const totalAmount = monthlyData.reduce((sum, m) => sum + m.totalAmount, 0);

  // Trouver le max pour normaliser les barres
  const maxRecoverable = Math.max(...monthlyData.map(m => m.recoverable), 1);

  // Nombre de mois avec des reçus
  const monthsWithReceipts = monthlyData.filter(m => m.hasReceipts).length;

  return (
    <div className="space-y-4">
      {/* Total cumulé */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total récupérable</p>
          <motion.p
            key={totalRecoverable}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-emerald-400"
          >
            {formatCurrency(totalRecoverable)}
          </motion.p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">
            {monthsWithReceipts}/12 mois documentés
          </p>
          <p className="text-gray-600 text-xs">
            TMI: {tmi}%
          </p>
        </div>
      </div>

      {/* Barres de progression par mois */}
      <div className="grid grid-cols-12 gap-1 h-24">
        {monthlyData.map((month, index) => (
          <motion.div
            key={month.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center group relative"
          >
            {/* Barre */}
            <div className="flex-1 w-full flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: month.hasReceipts
                    ? `${Math.max(15, (month.recoverable / maxRecoverable) * 100)}%`
                    : "8px"
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                className={`w-full rounded-t-sm ${
                  month.hasReceipts
                    ? month.receiptCount > 1
                      ? "bg-emerald-400" // Vert vif pour plusieurs reçus
                      : "bg-emerald-500/70" // Vert pour un seul reçu
                    : "bg-white/10" // Gris pour pas de reçu
                }`}
                style={{
                  boxShadow: month.hasReceipts
                    ? "0 0 10px rgba(16, 185, 129, 0.3)"
                    : "none"
                }}
              />
            </div>

            {/* Label du mois */}
            <span className={`text-[10px] mt-1 ${
              month.hasReceipts ? "text-emerald-400" : "text-gray-600"
            }`}>
              {month.name}
            </span>

            {/* Tooltip au hover */}
            {month.hasReceipts && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-[#0D0D0D] border border-emerald-500/30 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="text-xs text-white font-medium">
                    {formatCurrency(month.recoverable)}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {month.receiptCount} reçu{month.receiptCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Message d'incitation */}
      {monthsWithReceipts < 12 && (
        <p className="text-xs text-gray-500 text-center">
          {monthsWithReceipts === 0
            ? "Uploadez vos reçus pour voir votre économie s'afficher"
            : `Ajoutez les reçus des ${12 - monthsWithReceipts} mois restants`
          }
        </p>
      )}
    </div>
  );
}
