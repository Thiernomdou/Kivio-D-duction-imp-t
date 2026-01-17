"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  ClipboardList,
  Check,
  AlertCircle,
  Loader2,
  X,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import TaxResultModal from "./TaxResultModal";
import { formatCurrency } from "@/lib/tax-calculator";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: "warning" | "success" | "info";
  completed?: boolean;
  children: React.ReactNode;
}

function ActionCard({
  title,
  description,
  icon,
  badge,
  badgeType = "warning",
  completed,
  children,
}: ActionCardProps) {
  const badgeColors = {
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    success: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 bg-[#0D0D0D] ${
        completed
          ? "border-accent-purple/30"
          : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
              completed ? "bg-accent-purple/10" : "bg-blue-500/10"
            }`}
          >
            {completed ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            ) : (
              <div className={completed ? "text-accent-purple" : "text-blue-400"}>
                {icon}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{description}</p>
          </div>
        </div>
        {badge && !completed && (
          <span
            className={`hidden sm:inline-flex px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border flex-shrink-0 ${badgeColors[badgeType]}`}
          >
            {badge}
          </span>
        )}
        {completed && (
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-accent-purple/10 text-accent-purple border border-accent-purple/20 flex-shrink-0">
            OK
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// Composant Dropzone pour l'upload des reçus - optimisé mobile
function ReceiptUploader() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { setDocumentUploaded, setAnalysisStatus, addReceipt } = useDashboard();

  const processFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setAnalysisStatus("uploading");

      try {
        // Upload file to Supabase Storage
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

        // Analyze the receipt with OCR
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

        // Add the analyzed receipt to the context
        if (analyzeData.receipt) {
          addReceipt(analyzeData.receipt);
        }

        setUploadedFiles((prev) => [...prev, uploadData.filePath]);
        setDocumentUploaded("receipts");

        toast.success("Reçu analysé !", {
          description: `${file.name} - ${analyzeData.receipt?.provider || "Transfert"}: ${formatCurrency(analyzeData.conversion?.amountEur || 0)}`,
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
    },
    [setDocumentUploaded, setAnalysisStatus, addReceipt]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);

      for (const file of acceptedFiles) {
        await processFile(file);
      }
    },
    [processFile]
  );

  // Gestion manuelle pour mobile (input natif)
  const handleMobileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = event.target.files;
      if (!inputFiles || inputFiles.length === 0) return;

      const fileArray = Array.from(inputFiles);
      setFiles((prev) => [...prev, ...fileArray]);

      for (const file of fileArray) {
        await processFile(file);
      }

      // Reset input pour permettre de re-sélectionner le même fichier
      event.target.value = "";
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".heic", ".heif", ".webp"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
    noClick: true, // On gère le clic manuellement pour mobile
    noKeyboard: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10"
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-spin" />
            <p className="text-xs sm:text-sm text-gray-500">Analyse...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 ${
                isDragActive ? "text-blue-400" : "text-gray-600"
              }`}
            />
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              {isDragActive
                ? "Déposez ici..."
                : "Importez vos reçus de transfert"}
            </p>

            {/* Boutons d'upload - optimisés mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Bouton photo (mobile) */}
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleMobileUpload}
                  className="hidden"
                />
                <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-accent-purple text-white text-xs sm:text-sm font-medium active:bg-accent-purple/80 w-full">
                  📷 Prendre en photo
                </span>
              </label>

              {/* Bouton galerie/fichiers */}
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  onChange={handleMobileUpload}
                  className="hidden"
                />
                <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/10 text-white text-xs sm:text-sm font-medium active:bg-white/20 border border-white/10 w-full">
                  📁 Choisir un fichier
                </span>
              </label>
            </div>

            <p className="text-[10px] sm:text-xs text-gray-700 mt-3">PDF, PNG, JPG, HEIC</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white truncate">
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 active:bg-white/10 rounded flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActionCards() {
  const {
    documents,
    setDocumentUploaded,
    runTaxCalculation,
    analysisStatus,
    showTaxResultModal,
    closeTaxResultModal,
    receipts,
    taxCalculationSummary,
    fiscalProfile,
  } = useDashboard();
  const [showAttestationForm, setShowAttestationForm] = useState(false);

  // Handlers for the modal buttons
  const handleAddMoreReceipts = () => {
    closeTaxResultModal();
    // The upload zone is already visible, user can add more receipts
  };

  const handleViewTotal = () => {
    closeTaxResultModal();
    // Optionally scroll to summary section or redirect
  };

  const handleAttestationSubmit = () => {
    setDocumentUploaded("needAttestation");
    setShowAttestationForm(false);
    toast.success("Attestation générée !", {
      description: "Déclaration de ressources créée.",
    });
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)",
            border: "1px solid #f59e0b30"
          }}
        >
          <AlertCircle className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Actions Prioritaires</h2>
          <p className="text-gray-500 text-sm">Documents requis pour votre dossier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Message d'avertissement */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-amber-500/10 border border-amber-500/30">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-amber-400 mb-2">
                Important
              </p>
              <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
                Les transferts déclarés doivent concerner uniquement vos parents (père, mère) ou vos enfants à charge.
              </p>
              <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed mt-2">
                En uploadant vos reçus, vous attestez que les bénéficiaires sont bien vos ascendants ou descendants directs.
              </p>
              <p className="text-xs sm:text-sm text-amber-200/60 leading-relaxed mt-2">
                En cas de contrôle fiscal, vous devrez fournir un justificatif de lien de parenté (livret de famille, acte de naissance) avec le justificatif que nous avons fourni.
              </p>
            </div>
          </div>
        </div>

        {/* Carte Import des Reçus */}
        <ActionCard
          title="Reçus de transfert"
          description="Uploadez tous vos envois"
          icon={<Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
          badge="Obligatoire"
          badgeType="warning"
          completed={documents.receipts}
        >
          <ReceiptUploader />
        </ActionCard>

        {/* Carte Attestation de Besoin */}
        <ActionCard
          title="Attestation de Besoin"
          description="Déclaration de ressources"
          icon={<ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />}
          badge="Recommandé"
          badgeType="info"
          completed={documents.needAttestation}
        >
          {showAttestationForm ? (
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs text-gray-600 mb-1">
                  Revenus mensuels du bénéficiaire
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Ex: 150"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAttestationForm(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 active:bg-white/10 text-gray-400 text-xs sm:text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAttestationSubmit}
                  className="flex-1 py-2 px-3 rounded-lg bg-accent-purple active:bg-accent-purple/80 text-black text-xs sm:text-sm font-medium"
                >
                  Générer
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAttestationForm(true)}
              disabled={documents.needAttestation}
              className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 active:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              {documents.needAttestation ? "Généré" : "Remplir"}
            </button>
          )}
        </ActionCard>
      </div>

      {/* Bouton Calculer - apparaît quand les reçus sont uploadés */}
      {documents.receipts && (
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-accent-purple/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent-purple/10 flex items-center justify-center">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Reçus uploadés
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Prêt pour le calcul de votre réduction
              </p>
            </div>
          </div>

          <button
            onClick={runTaxCalculation}
            disabled={analysisStatus === "calculating"}
            className="w-full py-3 px-4 rounded-xl bg-accent-purple active:bg-accent-purple/80 disabled:opacity-50 text-black font-semibold text-sm flex items-center justify-center gap-2"
          >
            {analysisStatus === "calculating" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calculer ma réduction d&apos;impôt
              </>
            )}
          </button>
        </div>
      )}

      {/* Tax Result Modal */}
      {taxCalculationSummary && (
        <TaxResultModal
          isOpen={showTaxResultModal}
          onClose={closeTaxResultModal}
          onAddMoreReceipts={handleAddMoreReceipts}
          onViewTotal={handleViewTotal}
          receipts={receipts}
          summary={taxCalculationSummary}
          fiscalProfile={fiscalProfile}
        />
      )}
    </div>
  );
}
