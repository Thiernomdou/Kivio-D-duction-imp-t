"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpRight,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  CreditCard,
  Building2,
} from "lucide-react";
import { useDashboard, type Transfer } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

// Icônes par méthode de transfert
const methodIcons: Record<Transfer["method"], React.ReactNode> = {
  wave: <Smartphone className="w-4 h-4" />,
  taptap: <Smartphone className="w-4 h-4" />,
  western_union: <Building2 className="w-4 h-4" />,
  virement: <CreditCard className="w-4 h-4" />,
  other: <ArrowUpRight className="w-4 h-4" />,
};

const methodNames: Record<Transfer["method"], string> = {
  wave: "Wave",
  taptap: "TapTap Send",
  western_union: "Western Union",
  virement: "Virement",
  other: "Autre",
};

const statusConfig: Record<
  Transfer["status"],
  { icon: React.ReactNode; label: string; className: string }
> = {
  validated: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Validé",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: "En attente",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    label: "Rejeté",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        Aucun transfert détecté
      </h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
        Importez votre premier reçu pour commencer le calcul réel de votre gain
        fiscal.
      </p>
      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors">
        <Upload className="w-4 h-4" />
        Importer un reçu
      </button>
    </motion.div>
  );
}

function TransferRow({ transfer, index }: { transfer: Transfer; index: number }) {
  const status = statusConfig[transfer.status];

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors"
    >
      {/* Date */}
      <td className="py-4 px-4">
        <span className="text-white">
          {format(new Date(transfer.date), "dd MMM yyyy", { locale: fr })}
        </span>
      </td>

      {/* Bénéficiaire */}
      <td className="py-4 px-4">
        <span className="text-white">{transfer.beneficiary}</span>
      </td>

      {/* Méthode */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
            {methodIcons[transfer.method]}
          </div>
          <span className="text-gray-400 text-sm">
            {methodNames[transfer.method]}
          </span>
        </div>
      </td>

      {/* Montant Original */}
      <td className="py-4 px-4">
        <span className="text-gray-400">
          {transfer.amountOriginal.toLocaleString("fr-FR")} {transfer.currency}
        </span>
      </td>

      {/* Montant EUR */}
      <td className="py-4 px-4">
        <span className="text-white font-medium">
          {formatCurrency(transfer.amountEur)}
        </span>
      </td>

      {/* Statut */}
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </span>
      </td>
    </motion.tr>
  );
}

export default function TransfersTable() {
  const { transfers, loading } = useDashboard();

  // Calculer le total
  const totalEur = transfers.reduce((sum, t) => sum + t.amountEur, 0);
  const validatedCount = transfers.filter((t) => t.status === "validated").length;

  return (
    <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 overflow-hidden">
      {/* Header du tableau */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Historique des Transferts
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {transfers.length > 0
                ? `${transfers.length} transfert${transfers.length > 1 ? "s" : ""} • ${validatedCount} validé${validatedCount > 1 ? "s" : ""}`
                : "Vos transferts apparaîtront ici"}
            </p>
          </div>
          {transfers.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total déductible</p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(totalEur)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu du tableau */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Chargement...</p>
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bénéficiaire
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant Devise
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant (€) BCE
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <TransferRow
                  key={transfer.id}
                  transfer={transfer}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
