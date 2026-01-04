"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  FileCheck,
  Calculator,
  Sparkles,
  RefreshCw,
  Loader2,
  Check,
  AlertTriangle,
  Users,
  Landmark,
  Scale,
} from "lucide-react";
import { formatCurrency, type TaxResult, type IneligibilityReason } from "@/lib/tax-calculator";

interface AuditResultProps {
  result: TaxResult & {
    eligible: boolean;
    ineligibilityReason?: IneligibilityReason;
    ineligibilityMessage?: string;
    legalReference?: string;
  };
  onRestart: () => void;
  onSave: () => void;
  saving?: boolean;
  saveSuccess?: boolean;
  isAuthenticated?: boolean;
}

export default function AuditResult({
  result,
  onRestart,
  onSave,
  saving = false,
  saveSuccess = false,
  isAuthenticated = false,
}: AuditResultProps) {
  const {
    gain,
    tmi,
    eligible,
    parts,
    annualDeduction,
    taxBefore,
    taxAfter,
    ineligibilityReason,
    ineligibilityMessage,
    legalReference,
  } = result;

  // Configuration des messages d'inéligibilité par raison
  const getIneligibilityConfig = (reason: IneligibilityReason | undefined) => {
    switch (reason) {
      case "non_imposable":
        return {
          icon: Calculator,
          iconColor: "text-blue-400",
          iconBg: "bg-blue-500/20",
          title: "Vous n'êtes pas imposable",
          subtitle: "Votre quotient familial vous place sous le seuil d'imposition",
          color: "blue",
        };
      case "beneficiary_not_eligible":
        return {
          icon: Users,
          iconColor: "text-amber-400",
          iconBg: "bg-amber-500/20",
          title: "Bénéficiaire non éligible",
          subtitle: "Ce type de bénéficiaire n'est pas concerné par la déduction",
          color: "amber",
        };
      case "expense_not_eligible":
        return {
          icon: Landmark,
          iconColor: "text-orange-400",
          iconBg: "bg-orange-500/20",
          title: "Dépenses non déductibles",
          subtitle: "Seules les dépenses alimentaires sont éligibles",
          color: "orange",
        };
      default:
        return {
          icon: XCircle,
          iconColor: "text-red-400",
          iconBg: "bg-red-500/20",
          title: "Non éligible à la déduction",
          subtitle: "Votre situation ne permet pas de bénéficier de la déduction",
          color: "red",
        };
    }
  };

  // Not eligible flow
  if (!eligible) {
    const config = getIneligibilityConfig(ineligibilityReason);
    const IconComponent = config.icon;

    return (
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        {/* Background with glows */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#5682F2]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl mx-auto"
        >
          <div
            className="rounded-3xl p-8 sm:p-12 text-center"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${config.iconBg} flex items-center justify-center`}
            >
              <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {config.title}
            </h2>
            <p className="text-white/50 mb-6">{config.subtitle}</p>

            {/* Message principal */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <p className="text-white/80">
                  {ineligibilityMessage || "Votre situation ne permet pas de bénéficier de cette déduction fiscale."}
                </p>
              </div>
            </div>

            {/* Référence légale */}
            {legalReference && (
              <div className="p-5 rounded-2xl bg-[#5682F2]/10 border border-[#5682F2]/30 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-[#5682F2] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#5682F2] mb-1">Base légale</p>
                    <p className="text-sm text-white/60">{legalReference}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton recommencer */}
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Recommencer la simulation
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // Eligible flow - Success
  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      {/* Background with glows */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#5682F2]/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        <div
          className="rounded-3xl p-8 sm:p-12"
          style={{
            background: "linear-gradient(180deg, rgba(34,197,94,0.1) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(34,197,94,0.3)",
            boxShadow: "0 0 60px -15px rgba(34,197,94,0.3)"
          }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
            style={{ border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Simulation terminée
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
            >
              Voici ce que vous récupérez
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-white/50"
            >
              avec vos envois d&apos;argent à votre famille
            </motion.p>
          </div>

          {/* Main Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <div
              className="text-6xl sm:text-7xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatCurrency(gain)}
            </div>
            <p className="text-white/50">
              d&apos;économie d&apos;impôt potentielle par an
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "TMI", value: `${tmi}%` },
              { label: "Parts", value: parts.toString() },
              { label: "Avant", value: formatCurrency(taxBefore) },
              { label: "Après", value: formatCurrency(taxAfter) },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Eligibility Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3 mb-8"
          >
            {[
              {
                icon: CheckCircle2,
                text: "Éligibilité confirmée (Articles 205-208 du Code civil)",
              },
              {
                icon: Calculator,
                text: `Quotient familial pris en compte (${parts} parts)`,
              },
              {
                icon: FileCheck,
                text: "Prêt pour uploader vos justificatifs",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <item.icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/80 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {saveSuccess ? (
              <div className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-semibold rounded-xl">
                <Check className="w-5 h-5" />
                Dossier sauvegardé avec succès
              </div>
            ) : (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: saving ? "none" : "0 10px 40px -10px rgba(34,197,94,0.5)"
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    {isAuthenticated
                      ? "Sauvegarder mon dossier"
                      : "Créer un compte et sauvegarder"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Restart Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6"
          >
            <button
              onClick={onRestart}
              className="text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Recommencer la simulation
            </button>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-6 mt-8"
        >
          <div className="flex items-center gap-2 text-white/30">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Données sécurisées</span>
          </div>
          <div className="flex items-center gap-2 text-white/30">
            <Scale className="w-4 h-4" />
            <span className="text-xs">Barème fiscal 2024</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
