"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Users,
  ClipboardList,
  Check,
  AlertCircle,
  Loader2,
  X,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";

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
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 bg-[#0D0D0D] ${
        completed
          ? "border-emerald-500/30"
          : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
              completed ? "bg-emerald-500/10" : "bg-blue-500/10"
            }`}
          >
            {completed ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            ) : (
              <div className={completed ? "text-emerald-400" : "text-blue-400"}>
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
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            OK
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// Composant Dropzone pour l'upload des reçus
function ReceiptUploader() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { setDocumentUploaded, setAnalysisStatus } = useDashboard();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);

      for (const file of acceptedFiles) {
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

          // Mark as uploaded (without OCR analysis for now)
          setUploadedFiles((prev) => [...prev, uploadData.filePath]);
          setDocumentUploaded("receipts");

          toast.success("Reçu uploadé !", {
            description: file.name,
          });

          setAnalysisStatus("idle");
        } catch (error) {
          console.error("[ReceiptUploader] Error:", error);
          toast.error("Erreur lors de l'upload", {
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
    <div className="space-y-3 sm:space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center cursor-pointer ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/10 active:border-white/20 active:bg-white/5"
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
              className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                isDragActive ? "text-blue-400" : "text-gray-600"
              }`}
            />
            <p className="text-xs sm:text-sm text-gray-500">
              {isDragActive
                ? "Déposez ici..."
                : "Glissez vos reçus ici ou cliquez"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-700 mt-1">Formats acceptés : PDF, PNG, JPG</p>
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

// Composant Dropzone pour l'upload du lien de parenté
function ParentalLinkUploader() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const { documents, setDocumentUploaded, setAnalysisStatus } = useDashboard();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setUploading(true);
      setAnalysisStatus("uploading");

      try {
        // Upload file to Supabase Storage
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("type", "identity");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || "Erreur lors de l'upload");
        }

        const uploadData = await uploadRes.json();

        // Mark as uploaded (without OCR analysis for now)
        setUploadedPath(uploadData.filePath);
        setDocumentUploaded("parentalLink");

        toast.success("Document uploadé !", {
          description: "Lien de parenté ajouté.",
        });

        setAnalysisStatus("idle");
      } catch (error) {
        console.error("[ParentalLinkUploader] Error:", error);
        toast.error("Erreur lors de l'upload", {
          description: error instanceof Error ? error.message : "Veuillez réessayer",
        });
        setFile(null);
        setAnalysisStatus("error");
      } finally {
        setUploading(false);
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
    multiple: false,
    disabled: documents.parentalLink,
  });

  const removeFile = () => {
    setFile(null);
  };

  if (documents.parentalLink && file) {
    return (
      <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-emerald-300 truncate">
            {file.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center cursor-pointer ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : documents.parentalLink
            ? "border-emerald-500/30 bg-emerald-500/5 cursor-default"
            : "border-white/10 active:border-white/20 active:bg-white/5"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-spin" />
            <p className="text-xs sm:text-sm text-gray-500">Vérification...</p>
          </div>
        ) : documents.parentalLink ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <p className="text-xs sm:text-sm text-emerald-400">Document ajouté</p>
          </div>
        ) : (
          <>
            <Users
              className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                isDragActive ? "text-blue-400" : "text-gray-600"
              }`}
            />
            <p className="text-xs sm:text-sm text-gray-500">
              {isDragActive
                ? "Déposez ici..."
                : "Glissez le document ici ou cliquez"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-700 mt-1">Acte de naissance ou livret de famille</p>
          </>
        )}
      </div>

      {file && !documents.parentalLink && (
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-white truncate">
              {file.name}
            </span>
          </div>
          <button
            onClick={removeFile}
            className="p-1 active:bg-white/10 rounded flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ActionCards() {
  const { documents, setDocumentUploaded, runTaxCalculation, analysisStatus } = useDashboard();
  const [showAttestationForm, setShowAttestationForm] = useState(false);

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

        {/* Carte Lien de Parenté */}
        <ActionCard
          title="Justificatif de parenté"
          description="Prouvez votre lien familial"
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          badge="Obligatoire"
          badgeType="warning"
          completed={documents.parentalLink}
        >
          <ParentalLinkUploader />
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
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 active:bg-emerald-400 text-black text-xs sm:text-sm font-medium"
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

      {/* Bouton Calculer - apparaît quand les deux documents requis sont uploadés */}
      {documents.receipts && documents.parentalLink && (
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-emerald-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Documents prêts
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Reçus + justificatif de parenté uploadés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Reçus</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Parenté</span>
            </div>
          </div>

          <button
            onClick={runTaxCalculation}
            disabled={analysisStatus === "calculating"}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 active:bg-emerald-600 disabled:opacity-50 text-black font-semibold text-sm flex items-center justify-center gap-2"
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

      {/* Message document manquant */}
      {(documents.receipts || documents.parentalLink) && !(documents.receipts && documents.parentalLink) && (
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-orange-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Document manquant
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {documents.receipts && !documents.parentalLink
                  ? "Ajoutez votre justificatif de parenté"
                  : "Ajoutez vos reçus de transfert"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              {documents.receipts ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
              )}
              <span className={`text-sm ${documents.receipts ? "text-emerald-300" : "text-gray-400"}`}>
                Reçus
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
            <div className="flex items-center gap-2">
              {documents.parentalLink ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
              )}
              <span className={`text-sm ${documents.parentalLink ? "text-emerald-300" : "text-gray-400"}`}>
                Parenté
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
