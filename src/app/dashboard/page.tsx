"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useSearchParams } from "next/navigation";
import { TrendingUp, Upload, ArrowRight, RefreshCw, AlertTriangle, FileText, Loader2, X, Receipt as ReceiptIcon, Calculator, CheckCircle, Sparkles, Camera, Image as ImageIcon } from "lucide-react";
import DocumentAnalysisResult from "@/components/dashboard/DocumentAnalysisResult";
import { useDashboard } from "@/contexts/DashboardContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/lib/tax-calculator";
import Link from "next/link";
import { toast } from "sonner";

// Gradient text style (violet/rose theme)
const gradientStyle = {
  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// Composant barre d'économie d'impôt animée
function TaxSavingsBar({ amount, receiptsCount }: { amount: number; receiptsCount: number }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Max visuel de 500€ pour l'effet de la barre
  const maxVisualAmount = 500;
  const progressPercent = Math.min(100, (amount / maxVisualAmount) * 100);

  // Animation au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // Intensité de couleur (0.5 à 1) basée sur la progression
  const colorIntensity = 0.5 + (animatedProgress / 100) * 0.5;

  return (
    <div className="mb-6 sm:mb-8 relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden bg-[#0D0D0D] border border-accent-purple/40">
      {/* Glow effect dynamique qui suit la barre */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at ${animatedProgress}% 50%, rgba(168, 85, 247, ${0.2 * colorIntensity}) 0%, transparent 60%)`,
          opacity: animatedProgress > 0 ? 1 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-700"
            style={{
              background: `linear-gradient(135deg, rgba(168, 85, 247, ${0.25 * colorIntensity}) 0%, rgba(236, 72, 153, ${0.1 * colorIntensity}) 100%)`,
              border: `1px solid rgba(168, 85, 247, ${0.4 * colorIntensity})`,
              boxShadow: animatedProgress > 30 ? `0 0 ${15 + animatedProgress / 4}px rgba(168, 85, 247, ${0.25 * colorIntensity})` : 'none',
            }}
          >
            <Sparkles
              className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-500"
              style={{ color: `rgba(168, 85, 247, ${colorIntensity})` }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">
              <span className="gradient-text">Votre économie d&apos;impôt</span>
            </h3>
            <p className="text-xs text-gray-500">
              {receiptsCount} reçu{receiptsCount > 1 ? "s" : ""} validé{receiptsCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Barre de progression avec montant */}
        <div className="relative">
          <div className="w-full h-10 sm:h-12 bg-white/5 rounded-xl overflow-hidden relative">
            {/* Barre animée */}
            <div
              className="h-full rounded-xl transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${Math.max(8, animatedProgress)}%`,
                background: `linear-gradient(90deg,
                  rgba(168, 85, 247, ${0.7 * colorIntensity}) 0%,
                  rgba(236, 72, 153, ${colorIntensity}) 40%,
                  rgba(168, 85, 247, ${colorIntensity}) 100%)`,
                boxShadow: animatedProgress > 0
                  ? `0 0 ${8 + animatedProgress / 4}px rgba(168, 85, 247, ${0.5 * colorIntensity}),
                     0 0 ${15 + animatedProgress / 3}px rgba(168, 85, 247, ${0.3 * colorIntensity}),
                     inset 0 1px 0 rgba(255,255,255,0.2)`
                  : 'none',
              }}
            >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: animatedProgress > 0 ? 'shimmer 2.5s ease-in-out infinite' : 'none',
                }}
              />
            </div>

            {/* Montant affiché sur la barre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-lg sm:text-xl font-bold text-white drop-shadow-lg"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(168, 85, 247, 0.5)',
                }}
              >
                {formatCurrency(amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Style pour l'animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { simulation, loading, fiscalProfile, transfers, documents, taxCalculationSummary, setDocumentUploaded, setAnalysisStatus, runTaxCalculation, analysisStatus, refreshData, hasPaid } = useDashboard();
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  const isLight = theme === "light";

  // État pour l'upload
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Gérer le retour de paiement
  useEffect(() => {
    const payment = searchParams.get("payment");

    if (payment === "success") {
      setPaymentSuccess(true);
      toast.success("Paiement confirmé !", {
        description: "Votre dossier fiscal est maintenant accessible.",
      });
      // Rafraîchir les données pour récupérer le statut de paiement
      refreshData();
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/dashboard");
    } else if (payment === "cancelled") {
      toast.info("Paiement annulé", {
        description: "Vous pouvez réessayer quand vous le souhaitez.",
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, refreshData]);

  // TMI de l'utilisateur (par défaut 30% si non défini)
  const userTMI = fiscalProfile?.tmi || simulation?.tmi || 30;

  // Montant mensuel envoyé (depuis le questionnaire)
  const monthlyAmount = fiscalProfile?.monthly_amount || simulation?.monthly_sent || 0;

  // Revenus annuels
  const annualIncome = fiscalProfile?.annual_income || simulation?.annual_income || 0;

  // Situation maritale
  const isMarried = fiscalProfile?.is_married || simulation?.is_married || false;

  // Calcul de la récupération potentielle (basée sur le questionnaire)
  const potentialRecovery = monthlyAmount * 12 * (userTMI / 100);

  // Nombre de reçus uploadés
  const uploadedReceiptsCount = transfers.length;

  // Montant total envoyé via les reçus
  const totalAmountFromReceipts = taxCalculationSummary?.totalAmountSent || transfers.reduce((sum, t) => sum + (t.amountEur || 0), 0);

  // Récupération réelle calculée sur les reçus
  const realRecoveryFromReceipts = totalAmountFromReceipts * (userTMI / 100);

  // Gestion de l'upload des reçus
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);

      for (const file of acceptedFiles) {
        setUploading(true);
        setAnalysisStatus("uploading");

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "receipt");

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const error = await uploadRes.json();
            throw new Error(error.error || "Erreur lors de l'upload");
          }

          const uploadData = await uploadRes.json();

          // Analyser le reçu avec OCR
          setAnalysisStatus("analyzing");
          const analyzeRes = await fetch("/api/analyze-receipt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filePath: uploadData.filePath,
              fileName: uploadData.fileName,
              fileSize: uploadData.fileSize,
              mimeType: uploadData.mimeType,
            }),
          });

          if (!analyzeRes.ok) {
            const error = await analyzeRes.json();
            throw new Error(error.error || "Erreur lors de l'analyse");
          }

          const analyzeData = await analyzeRes.json();

          setDocumentUploaded("receipts");
          toast.success("Reçu analysé !", {
            description: `${file.name} - ${analyzeData.receipt?.provider || "Transfert"}: ${analyzeData.conversion?.amountEur?.toFixed(2) || 0}€`,
          });
          setAnalysisStatus("idle");
        } catch (error) {
          console.error("[ReceiptUploader] Error:", error);
          toast.error("Erreur lors de l'analyse", {
            description: error instanceof Error ? error.message : "Veuillez réessayer",
          });
          setAnalysisStatus("error");
        } finally {
          setUploading(false);
        }
      }
    },
    [setDocumentUploaded, setAnalysisStatus]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[120px]" />
      </div>

      {/* Notification "Dossier fiscal débloqué" en haut */}
      {(paymentSuccess || hasPaid) && taxCalculationSummary && (
        <div className="mb-4 py-3 px-4 bg-gradient-to-r from-accent-purple/20 via-accent-pink/10 to-accent-purple/20 border-b border-accent-purple/30">
          <div className="flex items-center justify-center gap-2 text-center">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent-purple flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium text-accent-purple">
              Dossier fiscal débloqué
            </p>
            <span className="text-xs sm:text-sm text-accent-purple/70">
              — Accès complet à votre dossier fiscal
            </span>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Message de mise en garde - Important */}
        <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-amber-400 mb-2">
                Important
              </p>
              <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
                Les transferts déclarés doivent concerner uniquement vos parents (père, mère) ou vos enfants à charge. En uploadant vos reçus, vous attestez que les bénéficiaires sont bien vos ascendants ou descendants directs.
              </p>
              <p className="text-xs sm:text-sm text-amber-200/60 leading-relaxed mt-2">
                En cas de contrôle fiscal, vous devrez fournir un justificatif de lien de parenté (livret de famille, acte de naissance) avec le justificatif que nous avons fourni.
              </p>
            </div>
          </div>
        </div>

        {/* Barre d'économie d'impôt - sous les bannières */}
        {(paymentSuccess || hasPaid) && taxCalculationSummary && (
          <TaxSavingsBar
            amount={taxCalculationSummary.taxReduction || taxCalculationSummary.estimatedTaxReduction || 0}
            receiptsCount={taxCalculationSummary.receiptsCount}
          />
        )}

        {/* Barre de progression de déduction - visible après upload de reçus */}
        {uploadedReceiptsCount > 0 && (
          <div className="mb-6 sm:mb-8 relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden bg-white/[0.03] border border-accent-purple/30">
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-accent-purple/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                      border: "1px solid #a855f730"
                    }}
                  >
                    <ReceiptIcon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Votre déduction {new Date().getFullYear()}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {uploadedReceiptsCount} reçu{uploadedReceiptsCount > 1 ? "s" : ""} uploadé{uploadedReceiptsCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-bold" style={gradientStyle}>
                    {formatCurrency(realRecoveryFromReceipts)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">de réduction d&apos;impôt</p>
                </div>
              </div>

              {/* Progress bar : réel vs potentiel */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Justifié : {formatCurrency(realRecoveryFromReceipts)}</span>
                  <span>Potentiel : {formatCurrency(potentialRecovery)}</span>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: potentialRecovery > 0 ? `${Math.min(100, (realRecoveryFromReceipts / potentialRecovery) * 100)}%` : "0%",
                      background: "linear-gradient(90deg, #a855f7 0%, #ec4899 100%)",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  {potentialRecovery > 0
                    ? `${Math.round((realRecoveryFromReceipts / potentialRecovery) * 100)}% de votre potentiel justifié`
                    : "Complétez le questionnaire pour voir votre potentiel"
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* CARD GAUCHE : Récupération potentielle (basée sur le questionnaire) */}
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden bg-white/[0.03] border border-white/10">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-purple/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                    border: "1px solid #a855f730"
                  }}
                >
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    <span className="gradient-text">Récupération d&apos;impôt potentielle</span>
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Basée sur votre situation</p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold" style={gradientStyle}>
                  {loading ? "..." : formatCurrency(potentialRecovery)}
                </span>
              </div>

              {/* Détails de la situation fiscale */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Argent envoyé</span>
                  <span className="text-white font-medium">{formatCurrency(monthlyAmount * 12)}/an</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Revenus déclarés</span>
                  <span className="text-white font-medium">{formatCurrency(annualIncome)}/an</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Situation</span>
                  <span className="text-white font-medium">{isMarried ? "Marié(e)" : "Célibataire"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">TMI</span>
                  <span className="text-accent-purple font-semibold">{userTMI}%</span>
                </div>
              </div>

              {/* Bouton Modifier ma situation - redirige vers le questionnaire */}
              <Link
                href="/?audit=true"
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white font-medium text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Modifier ma situation
              </Link>
            </div>
          </div>

          {/* CARD DROITE : Upload des reçus directement */}
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                  border: "1px solid #a855f730"
                }}
              >
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  Uploadez vos reçus
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">À chaque envoi, visualisez votre déduction en temps réel</p>
              </div>
            </div>

            {/* Info sur les frais */}
            <div className="mb-4 p-3 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
              <p className="text-xs text-accent-purple/80">
                On intègre les frais que vous avez payés lors de l&apos;envoi pour vous les déduire de votre impôt.
              </p>
            </div>

            {/* Zone de drop - Desktop */}
            <div className="hidden sm:block">
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-accent-purple bg-accent-purple/10"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                    <p className="text-sm text-gray-400">Upload en cours...</p>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={`w-10 h-10 mx-auto mb-3 ${
                        isDragActive ? "text-accent-purple" : "text-gray-500"
                      }`}
                    />
                    <p className="text-sm text-white font-medium mb-1">
                      {isDragActive ? "Déposez vos fichiers ici" : "Glissez un ou plusieurs reçus"}
                    </p>
                    <p className="text-xs text-gray-500">ou cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-600 mt-2">PDF, PNG, JPG • Un ou plusieurs fichiers</p>
                  </>
                )}
              </div>
            </div>

            {/* Zone d'upload - Mobile (boutons explicites) */}
            <div className="sm:hidden space-y-3">
              {uploading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                  <p className="text-sm text-gray-400">Upload en cours...</p>
                </div>
              ) : (
                <>
                  {/* Bouton pour prendre une photo */}
                  <label className="flex items-center justify-center gap-3 w-full py-4 px-4 rounded-xl bg-accent-purple text-white font-semibold text-sm cursor-pointer active:bg-accent-purple/80 touch-manipulation">
                    <Camera className="w-5 h-5" />
                    Prendre une photo du reçu
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          onDrop(Array.from(files));
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Bouton pour choisir depuis la galerie */}
                  <label className="flex items-center justify-center gap-3 w-full py-4 px-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm cursor-pointer active:bg-white/20 touch-manipulation">
                    <ImageIcon className="w-5 h-5" />
                    Choisir depuis la galerie
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          onDrop(Array.from(files));
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-gray-500 text-center">PDF, PNG, JPG acceptés</p>
                </>
              )}
            </div>

            {/* Liste des fichiers uploadés */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-accent-purple flex-shrink-0" />
                      <span className="text-sm text-white truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 hover:bg-white/10 rounded flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}

                {/* Bouton Calculer ma déduction */}
                <button
                  onClick={runTaxCalculation}
                  disabled={analysisStatus === "calculating"}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {analysisStatus === "calculating" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculer ma déduction pour {files.length > 1 ? "ces envois" : "cet envoi"}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Lien vers la page documents pour voir tous les reçus */}
            {uploadedReceiptsCount > 0 && (
              <Link
                href="/dashboard/documents"
                className="mt-4 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors flex items-center justify-center gap-1"
              >
                Voir tous mes reçus ({uploadedReceiptsCount})
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Résultats de l'analyse documentaire */}
        <DocumentAnalysisResult />
      </div>
    </div>
  );
}
