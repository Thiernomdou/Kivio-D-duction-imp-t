"use client";

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
  taptap: "TapTap",
  western_union: "Western",
  virement: "Virement",
  other: "Autre",
};

const statusConfig: Record<
  Transfer["status"],
  { icon: React.ReactNode; label: string; className: string }
> = {
  validated: {
    icon: <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />,
    label: "OK",
    className: "bg-accent-purple/10 text-accent-purple border border-accent-purple/20",
  },
  pending: {
    icon: <Clock className="w-3 h-3 sm:w-4 sm:h-4" />,
    label: "Attente",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  rejected: {
    icon: <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
    label: "Rejeté",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

function EmptyState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-white mb-2">
        Aucun transfert
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-4 sm:mb-6 px-4">
        Importez vos reçus pour calculer votre gain fiscal.
      </p>
      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-purple active:bg-accent-purple/80 text-black font-medium text-sm">
        <Upload className="w-4 h-4" />
        Importer
      </button>
    </div>
  );
}

// Version mobile - cartes
function MobileTransferCard({ transfer }: { transfer: Transfer }) {
  const status = statusConfig[transfer.status];

  return (
    <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
            {methodIcons[transfer.method]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{transfer.beneficiary}</p>
            <p className="text-gray-500 text-xs">{methodNames[transfer.method]}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">
          {format(new Date(transfer.date), "dd MMM", { locale: fr })}
        </span>
        <span className="text-white font-semibold text-sm">
          {formatCurrency(transfer.amountEur)}
        </span>
      </div>
    </div>
  );
}

// Version desktop - ligne tableau
function TransferRow({ transfer }: { transfer: Transfer }) {
  const status = statusConfig[transfer.status];

  return (
    <tr className="border-b border-white/5">
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <span className="text-white text-sm">
          {format(new Date(transfer.date), "dd MMM yyyy", { locale: fr })}
        </span>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <span className="text-white text-sm">{transfer.beneficiary}</span>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
            {methodIcons[transfer.method]}
          </div>
          <span className="text-gray-400 text-sm">
            {methodNames[transfer.method]}
          </span>
        </div>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <span className="text-gray-400 text-sm">
          {transfer.amountOriginal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transfer.currency}
        </span>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <span className="text-white font-medium text-sm">
          {formatCurrency(transfer.amountEur)}
        </span>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </span>
      </td>
    </tr>
  );
}

export default function TransfersTable() {
  const { transfers, loading } = useDashboard();

  const totalEur = transfers.reduce((sum, t) => sum + t.amountEur, 0);
  const validatedCount = transfers.filter((t) => t.status === "validated").length;

  return (
    <div className="rounded-xl sm:rounded-2xl bg-[#0D0D0D] border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Historique
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {transfers.length > 0
                ? `${transfers.length} transfert${transfers.length > 1 ? "s" : ""} • ${validatedCount} validé${validatedCount > 1 ? "s" : ""}`
                : "Vos transferts apparaîtront ici"}
            </p>
          </div>
          {transfers.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] sm:text-sm text-gray-500">Total</p>
              <p className="text-lg sm:text-2xl font-bold gradient-text">
                {formatCurrency(totalEur)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="p-4 sm:p-6 space-y-3">
          {/* Fast skeleton loading */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 skeleton" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded skeleton" />
                  <div className="h-3 w-16 bg-white/10 rounded skeleton" />
                </div>
              </div>
              <div className="h-5 w-20 bg-white/10 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Mobile - cartes empilées */}
          <div className="sm:hidden p-3 space-y-2">
            {transfers.map((transfer) => (
              <MobileTransferCard key={transfer.id} transfer={transfer} />
            ))}
          </div>

          {/* Desktop - tableau */}
          <div className="hidden sm:block overflow-x-auto">
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
                    Devise
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EUR
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <TransferRow key={transfer.id} transfer={transfer} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
