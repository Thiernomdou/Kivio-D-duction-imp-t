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
  FolderCheck,
  BookOpen,
  Shield,
  Sparkles,
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

// Composant Dropzone pour l'upload
function ReceiptUploader() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { addTransfer, setDocumentUploaded } = useDashboard();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);

      for (const file of acceptedFiles) {
        setUploading(true);

        // Simuler l'analyse OCR
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockTransfer = {
          date: new Date().toISOString(),
          beneficiary: "Parent",
          method: "wave" as const,
          amountOriginal: Math.floor(Math.random() * 200) + 50,
          currency: "EUR",
          amountEur: Math.floor(Math.random() * 200) + 50,
          status: "validated" as const,
        };

        addTransfer(mockTransfer);
        setDocumentUploaded("receipts");

        toast.success("Reçu analysé !", {
          description: `Envoi de ${mockTransfer.amountEur}€ détecté.`,
        });

        setUploading(false);
      }
    },
    [addTransfer, setDocumentUploaded]
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
                : "Glissez vos reçus ou touchez"}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-700 mt-1">PDF, PNG, JPG</p>
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
  const { documents, setDocumentUploaded } = useDashboard();
  const [showAttestationForm, setShowAttestationForm] = useState(false);

  const handleParentalLinkUpload = () => {
    setDocumentUploaded("parentalLink");
    toast.success("Document ajouté !", {
      description: "Lien de parenté vérifié.",
    });
  };

  const handleAttestationSubmit = () => {
    setDocumentUploaded("needAttestation");
    setShowAttestationForm(false);
    toast.success("Attestation générée !", {
      description: "Déclaration de ressources créée.",
    });
  };

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
        Actions Prioritaires
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Carte Import des Reçus */}
        <ActionCard
          title="Import des Reçus"
          description="Scannez vos transferts"
          icon={<Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
          badge="Besoin de preuves"
          badgeType="warning"
          completed={documents.receipts}
        >
          <ReceiptUploader />
        </ActionCard>

        {/* Carte Lien de Parenté */}
        <ActionCard
          title="Lien de Parenté"
          description="Acte de naissance ou livret"
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          badge="Requis"
          badgeType="info"
          completed={documents.parentalLink}
        >
          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs text-gray-600">
              Prouve l&apos;obligation alimentaire au fisc.
            </p>
            <button
              onClick={handleParentalLinkUpload}
              disabled={documents.parentalLink}
              className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 active:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              {documents.parentalLink ? "Ajouté" : "Ajouter"}
            </button>
          </div>
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

      {/* Section Kivio génère */}
      <div className="mt-4 sm:mt-8 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-blue-500/20">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <h3 className="text-sm sm:text-lg font-semibold text-white">Kivio génère :</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
            <FolderCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-medium text-xs sm:text-sm">Montant à déclarer</p>
              <p className="text-[10px] sm:text-sm text-gray-500">Case <span className="text-blue-400 font-semibold">6GU</span></p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-medium text-xs sm:text-sm">Guide complet</p>
              <p className="text-[10px] sm:text-sm text-gray-500">Où et comment déclarer</p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-medium text-xs sm:text-sm">Dossier justificatif</p>
              <p className="text-[10px] sm:text-sm text-gray-500">À conserver 3 ans</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
