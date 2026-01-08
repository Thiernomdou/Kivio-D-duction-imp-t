"use client";

import { FileText, Download, Eye, Calendar, Upload, FolderOpen, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

export default function DocumentsPage() {
  const { profile } = useAuth();
  const { fiscalProfile, estimatedRecovery } = useDashboard();

  const displayProfile = fiscalProfile || profile;
  const hasSimulation = displayProfile?.monthly_amount && displayProfile.monthly_amount > 0;

  // Documents fictifs pour la démo
  const documents = hasSimulation
    ? [
        {
          id: 1,
          name: "Attestation fiscale 2024",
          type: "PDF",
          date: new Date().toLocaleDateString("fr-FR"),
          size: "245 Ko",
          status: "ready",
        },
        {
          id: 2,
          name: "Récapitulatif des transferts",
          type: "PDF",
          date: new Date().toLocaleDateString("fr-FR"),
          size: "128 Ko",
          status: "ready",
        },
        {
          id: 3,
          name: "Justificatifs de versements",
          type: "ZIP",
          date: new Date().toLocaleDateString("fr-FR"),
          size: "1.2 Mo",
          status: "pending",
        },
      ]
    : [];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
          Documents
        </h1>
        <p className="text-xs sm:text-base text-gray-500">
          Vos justificatifs et attestations fiscales
        </p>
      </div>

      {hasSimulation ? (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-[#0D0D0D] border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">Documents</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{documents.length}</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-[#0D0D0D] border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase">Année</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">2024</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-emerald-400/70 uppercase">Économie</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                {formatCurrency(estimatedRecovery)}
              </p>
            </div>
          </div>

          {/* Liste des documents */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0D0D0D] border border-white/10 overflow-hidden">
            <div className="p-3 sm:p-5 border-b border-white/10">
              <h2 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                Mes documents
              </h2>
            </div>

            <div className="divide-y divide-white/5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 sm:p-4 active:bg-white/5"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                        doc.status === "ready"
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-amber-500/10 border border-amber-500/30"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          doc.status === "ready" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm sm:text-base truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {doc.type} • {doc.size} • {doc.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {doc.status === "ready" ? (
                      <>
                        <button className="p-2 rounded-lg bg-white/5 text-gray-400 active:bg-white/10 active:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 active:bg-emerald-500/20">
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-dashed border-white/20 text-center">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-white font-medium mb-1">
              Ajouter un justificatif
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
              Glissez un fichier ou cliquez pour sélectionner
            </p>
            <button className="px-4 py-2 rounded-lg sm:rounded-xl bg-white/5 text-white text-sm font-medium border border-white/10 active:bg-white/10">
              Parcourir
            </button>
          </div>
        </>
      ) : (
        /* État vide */
        <div className="rounded-xl sm:rounded-2xl p-6 sm:p-10 bg-[#0D0D0D] border border-white/10 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
            Aucun document disponible
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-sm mx-auto">
            Effectuez une simulation fiscale pour générer vos premiers documents et attestations.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-medium text-sm active:bg-emerald-400"
          >
            Faire une simulation
          </a>
        </div>
      )}
    </div>
  );
}
