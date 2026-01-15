"use client";

import { useState, memo, useCallback } from "react";
import { FileText, Download, Eye, Calendar, FolderOpen, AlertCircle, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/tax-calculator";
import { generateFiscalPDF } from "@/lib/pdf-generator";
import { createClient } from "@/lib/supabase/client";

export default function DocumentsPage() {
  const { user, profile } = useAuth();
  const { fiscalProfile, hasPaid, pdfPath, receipts, taxCalculationSummary } = useDashboard();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [downloading, setDownloading] = useState<number | null>(null);

  const displayProfile = fiscalProfile || profile;
  const currentYear = new Date().getFullYear();

  // Type pour les années fiscales
  type FiscalYear = {
    year: number;
    status: "ready" | "locked";
    receiptsCount: number;
    totalDeductible: number;
    taxReduction: number;
    pdfPath: string | null;
  };

  // Générer la liste des années fiscales disponibles
  const fiscalYears: FiscalYear[] = [];

  // Année en cours si l'utilisateur a payé
  if (hasPaid && receipts.length > 0) {
    fiscalYears.push({
      year: currentYear,
      status: "ready",
      receiptsCount: receipts.length,
      totalDeductible: taxCalculationSummary?.totalDeductible || 0,
      taxReduction: taxCalculationSummary?.taxReduction || taxCalculationSummary?.estimatedTaxReduction || 0,
      pdfPath: pdfPath,
    });
  } else if (receipts.length > 0) {
    // L'utilisateur a des reçus mais n'a pas payé
    fiscalYears.push({
      year: currentYear,
      status: "locked",
      receiptsCount: receipts.length,
      totalDeductible: taxCalculationSummary?.totalDeductible || 0,
      taxReduction: taxCalculationSummary?.estimatedTaxReduction || 0,
      pdfPath: null,
    });
  }

  // Télécharger le PDF
  const handleDownload = async (yearData: FiscalYear) => {
    if (!user || yearData.status !== "ready") return;

    setDownloading(yearData.year);

    try {
      // Si on a un chemin PDF stocké, télécharger depuis Supabase Storage
      if (yearData.pdfPath) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("documents")
          .download(yearData.pdfPath);

        if (error) throw error;

        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Kivio_Dossier_Fiscal_${yearData.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Générer le PDF à la volée
        const pdfData = {
          userName: displayProfile?.full_name || user.email?.split("@")[0] || "Utilisateur",
          taxYear: yearData.year,
          generatedDate: new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          totalDeductible: yearData.totalDeductible,
          taxReduction: yearData.taxReduction,
          tmiRate: taxCalculationSummary?.tmiRate || fiscalProfile?.tmi || 30,
          receipts: receipts,
          profile: fiscalProfile,
          isMarried: fiscalProfile?.is_married || false,
          annualIncome: fiscalProfile?.annual_income || 0,
        };

        const pdfBuffer = await generateFiscalPDF(pdfData);
        const blob = new Blob([pdfBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Kivio_Dossier_Fiscal_${yearData.year}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setDownloading(null);
    }
  };

  // Prévisualiser le PDF (ouvre dans un nouvel onglet)
  const handlePreview = async (yearData: FiscalYear) => {
    if (!user || yearData.status !== "ready") return;

    setDownloading(yearData.year);

    try {
      const pdfData = {
        userName: displayProfile?.full_name || user.email?.split("@")[0] || "Utilisateur",
        taxYear: yearData.year,
        generatedDate: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        totalDeductible: yearData.totalDeductible,
        taxReduction: yearData.taxReduction,
        tmiRate: taxCalculationSummary?.tmiRate || fiscalProfile?.tmi || 30,
        receipts: receipts,
        profile: fiscalProfile,
        isMarried: fiscalProfile?.is_married || false,
        annualIncome: fiscalProfile?.annual_income || 0,
      };

      const pdfBuffer = await generateFiscalPDF(pdfData);
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erreur lors de la prévisualisation:", error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* En-tête */}
      <div>
        <h1 className={`text-xl sm:text-3xl font-bold mb-1 sm:mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
          Mes documents fiscaux
        </h1>
        <p className={`text-xs sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
          Téléchargez vos dossiers fiscaux par année
        </p>
      </div>

      {fiscalYears.length > 0 ? (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 ${isLight ? 'bg-white border border-gray-200' : 'bg-[#0D0D0D] border border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-accent-purple" />
                <span className={`text-[10px] sm:text-xs uppercase ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Dossiers</span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {fiscalYears.filter(y => y.status === "ready").length}
              </p>
            </div>
            <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 ${isLight ? 'bg-white border border-gray-200' : 'bg-[#0D0D0D] border border-white/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className={`text-[10px] sm:text-xs uppercase ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Année</span>
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentYear}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-accent-purple/10 border border-accent-purple/30">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-accent-purple" />
                <span className="text-[10px] sm:text-xs text-accent-purple/70 uppercase">Total économisé</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-accent-purple">
                {formatCurrency(fiscalYears.reduce((sum, y) => sum + (y.status === "ready" ? y.taxReduction : 0), 0))}
              </p>
            </div>
          </div>

          {/* Liste des dossiers par année */}
          <div className={`rounded-xl sm:rounded-2xl overflow-hidden ${isLight ? 'bg-white border border-gray-200' : 'bg-[#0D0D0D] border border-white/10'}`}>
            <div className={`p-3 sm:p-5 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
              <h2 className={`text-sm sm:text-lg font-semibold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-purple" />
                Dossiers fiscaux
              </h2>
            </div>

            <div className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/5'}`}>
              {fiscalYears.map((yearData) => (
                <div
                  key={yearData.year}
                  className={`flex items-center justify-between p-4 sm:p-5 ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'} transition-colors`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Icône */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        yearData.status === "ready"
                          ? "bg-gradient-to-br from-accent-purple to-accent-pink"
                          : isLight
                            ? "bg-gray-100 border border-gray-200"
                            : "bg-white/5 border border-white/10"
                      }`}
                    >
                      {yearData.status === "ready" ? (
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <Lock className={`w-5 h-5 sm:w-6 sm:h-6 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold text-base sm:text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          Dossier fiscal {yearData.year}
                        </p>
                        {yearData.status === "ready" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] sm:text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Disponible
                          </span>
                        )}
                        {yearData.status === "locked" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] sm:text-xs font-medium">
                            <Lock className="w-3 h-3" />
                            Paiement requis
                          </span>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                        {yearData.receiptsCount} reçu{yearData.receiptsCount > 1 ? "s" : ""} • {formatCurrency(yearData.totalDeductible)} déductible
                      </p>
                      {yearData.status === "ready" && (
                        <p className="text-xs sm:text-sm text-accent-purple font-medium mt-1">
                          Économie : {formatCurrency(yearData.taxReduction)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {yearData.status === "ready" ? (
                      <>
                        <button
                          onClick={() => handlePreview(yearData)}
                          disabled={downloading === yearData.year}
                          className={`p-2.5 rounded-xl transition-colors ${
                            isLight
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          } disabled:opacity-50`}
                          title="Prévisualiser"
                        >
                          {downloading === yearData.year ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(yearData)}
                          disabled={downloading === yearData.year}
                          className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors disabled:opacity-50"
                          title="Télécharger"
                        >
                          {downloading === yearData.year ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </>
                    ) : (
                      <a
                        href="/dashboard"
                        className="px-4 py-2 rounded-xl bg-accent-purple text-white text-sm font-medium hover:bg-accent-purple/80 transition-colors"
                      >
                        Débloquer
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info sur les documents */}
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 ${isLight ? 'bg-purple-50 border border-purple-100' : 'bg-accent-purple/5 border border-accent-purple/20'}`}>
            <div className="flex gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm sm:text-base font-semibold mb-2 ${isLight ? 'text-purple-900' : 'text-accent-purple'}`}>
                  À propos de vos dossiers
                </p>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-purple-700' : 'text-accent-purple/80'}`}>
                  Chaque dossier fiscal contient le récapitulatif de vos transferts, le montant à déclarer en case 6GU,
                  les instructions de déclaration et une attestation sur l&apos;honneur. Conservez ces documents pendant 3 ans.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* État vide */
        <div className={`rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center ${isLight ? 'bg-white border border-gray-200' : 'bg-[#0D0D0D] border border-white/10'}`}>
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
            <AlertCircle className={`w-7 h-7 sm:w-8 sm:h-8 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Aucun document disponible
          </h3>
          <p className={`text-xs sm:text-sm mb-4 sm:mb-6 max-w-sm mx-auto ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
            Uploadez vos reçus de transfert et calculez votre déduction pour générer votre premier dossier fiscal.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-purple text-white font-medium text-sm hover:bg-accent-purple/80 transition-colors"
          >
            Commencer
          </a>
        </div>
      )}
    </div>
  );
}
