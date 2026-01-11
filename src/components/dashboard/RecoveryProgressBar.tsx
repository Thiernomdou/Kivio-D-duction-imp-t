"use client";

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

const MONTHS_SHORT = [
  "J", "F", "M", "A", "M", "J",
  "J", "A", "S", "O", "N", "D"
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
      shortName: MONTHS_SHORT[index],
      month: index + 1,
      totalAmount,
      recoverable,
      hasReceipts,
      receiptCount,
    };
  });

  // Total cumulé récupérable
  const totalRecoverable = monthlyData.reduce((sum, m) => sum + m.recoverable, 0);

  // Trouver le max pour normaliser les barres
  const maxRecoverable = Math.max(...monthlyData.map(m => m.recoverable), 1);

  // Nombre de mois avec des reçus
  const monthsWithReceipts = monthlyData.filter(m => m.hasReceipts).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Total cumulé */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs sm:text-sm">Total récupérable</p>
          <p className="text-2xl sm:text-3xl font-bold gradient-text">
            {formatCurrency(totalRecoverable)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] sm:text-xs">
            {monthsWithReceipts}/12 mois
          </p>
          <p className="text-gray-600 text-[10px] sm:text-xs">
            TMI: {tmi}%
          </p>
        </div>
      </div>

      {/* Barres de progression par mois */}
      <div className="grid grid-cols-12 gap-0.5 sm:gap-1 h-16 sm:h-24">
        {monthlyData.map((month) => {
          const heightPercent = month.hasReceipts
            ? Math.max(15, (month.recoverable / maxRecoverable) * 100)
            : 8;

          return (
            <div
              key={month.name}
              className="flex flex-col items-center group relative"
            >
              {/* Barre */}
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t-sm ${
                    month.hasReceipts
                      ? month.receiptCount > 1
                        ? "bg-accent-purple"
                        : "bg-accent-purple/70"
                      : "bg-white/10"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Label du mois - court sur mobile */}
              <span className={`text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 ${
                month.hasReceipts ? "text-accent-purple" : "text-gray-600"
              }`}>
                <span className="sm:hidden">{month.shortName}</span>
                <span className="hidden sm:inline">{month.name}</span>
              </span>

              {/* Tooltip au hover - seulement desktop */}
              {month.hasReceipts && (
                <div className="hidden sm:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-[#0D0D0D] border border-accent-purple/30 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <p className="text-xs text-white font-medium">
                      {formatCurrency(month.recoverable)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {month.receiptCount} reçu{month.receiptCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message d'incitation */}
      {monthsWithReceipts < 12 && (
        <p className="text-[10px] sm:text-xs text-gray-500 text-center">
          {monthsWithReceipts === 0
            ? "Uploadez vos reçus pour voir votre économie"
            : `${12 - monthsWithReceipts} mois restants`
          }
        </p>
      )}
    </div>
  );
}
