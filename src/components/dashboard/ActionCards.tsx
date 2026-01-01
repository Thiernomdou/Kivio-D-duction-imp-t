"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
    warning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-6 transition-all ${
        completed
          ? "bg-dark-800/50 border-green-500/30"
          : "bg-dark-800 border-dark-600 hover:border-dark-500"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              completed ? "bg-green-500/20" : "bg-primary-500/20"
            }`}
          >
            {completed ? (
              <Check className="w-6 h-6 text-green-400" />
            ) : (
              <div className={completed ? "text-green-400" : "text-primary-400"}>
                {icon}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        {badge && !completed && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColors[badgeType]}`}
          >
            {badge}
          </span>
        )}
        {completed && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            Complété
          </span>
        )}
      </div>
      {children}
    </motion.div>
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

        // Simuler l'analyse OCR (à remplacer par l'appel API réel)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simuler la détection d'un transfert
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

        toast.success("Reçu analysé avec succès !", {
          description: `Nous avons détecté un envoi de ${mockTransfer.amountEur}€. Gain fiscal ajouté.`,
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary-500 bg-primary-500/10"
            : "border-dark-500 hover:border-dark-400 hover:bg-dark-700/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <p className="text-sm text-zinc-400">Analyse en cours...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`w-8 h-8 mx-auto mb-2 ${
                isDragActive ? "text-primary-400" : "text-zinc-500"
              }`}
            />
            <p className="text-sm text-zinc-400">
              {isDragActive
                ? "Déposez les fichiers ici..."
                : "Glissez vos reçus ici ou cliquez pour sélectionner"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">PDF, PNG, JPG acceptés</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-dark-700"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-white truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-dark-600 rounded"
              >
                <X className="w-4 h-4 text-zinc-500" />
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
    // Simuler l'upload
    setDocumentUploaded("parentalLink");
    toast.success("Document ajouté !", {
      description: "Lien de parenté vérifié avec succès.",
    });
  };

  const handleAttestationSubmit = () => {
    setDocumentUploaded("needAttestation");
    setShowAttestationForm(false);
    toast.success("Attestation générée !", {
      description: "La déclaration de ressources a été créée.",
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-400" />
        Actions Prioritaires
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Import des Reçus */}
        <ActionCard
          title="Import des Reçus"
          description="Scannez vos transferts (Wave, TapTap, Western, Virement)"
          icon={<Upload className="w-6 h-6" />}
          badge="Besoin de preuves"
          badgeType="warning"
          completed={documents.receipts}
        >
          <ReceiptUploader />
        </ActionCard>

        {/* Carte Lien de Parenté */}
        <ActionCard
          title="Lien de Parenté"
          description="Uploadez votre acte de naissance ou livret de famille"
          icon={<Users className="w-6 h-6" />}
          badge="Requis"
          badgeType="info"
          completed={documents.parentalLink}
        >
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Indispensable pour prouver l&apos;obligation alimentaire au fisc.
            </p>
            <button
              onClick={handleParentalLinkUpload}
              disabled={documents.parentalLink}
              className="w-full py-3 px-4 rounded-xl bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {documents.parentalLink ? "Document ajouté" : "Ajouter le document"}
            </button>
          </div>
        </ActionCard>

        {/* Carte Attestation de Besoin */}
        <ActionCard
          title="Attestation de Besoin"
          description="Générez la déclaration de ressources de vos parents"
          icon={<ClipboardList className="w-6 h-6" />}
          badge="Recommandé"
          badgeType="info"
          completed={documents.needAttestation}
        >
          {showAttestationForm ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  Revenus mensuels du bénéficiaire
                </label>
                <input
                  type="number"
                  placeholder="Ex: 150"
                  className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-white text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAttestationForm(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-dark-600 hover:bg-dark-500 text-zinc-400 text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAttestationSubmit}
                  className="flex-1 py-2 px-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm transition-colors"
                >
                  Générer
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAttestationForm(true)}
              disabled={documents.needAttestation}
              className="w-full py-3 px-4 rounded-xl bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-5 h-5" />
              {documents.needAttestation ? "Attestation générée" : "Remplir le formulaire"}
            </button>
          )}
        </ActionCard>
      </div>
    </div>
  );
}
