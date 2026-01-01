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
} from "lucide-react";
import { formatCurrency, type TaxResult } from "@/lib/tax-calculator";

interface AuditResultProps {
  result: TaxResult & { eligible: boolean };
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
  const { gain, tmi, eligible, parts, annualDeduction, taxBefore, taxAfter } =
    result;

  // Not eligible flow
  if (!eligible) {
    return (
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl p-8 sm:p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-amber-400" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Non éligible à la déduction
            </h2>

            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Les versements aux frères, sœurs, oncles ou tantes ne sont pas
              déductibles fiscalement selon le Code civil français.
            </p>

            <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-600 mb-8">
              <p className="text-sm text-zinc-400">
                Seuls les versements aux{" "}
                <span className="text-white font-medium">
                  ascendants (parents, grands-parents)
                </span>{" "}
                et{" "}
                <span className="text-white font-medium">
                  descendants (enfants)
                </span>{" "}
                dans le besoin sont déductibles (Articles 205-208 du Code civil).
              </p>
            </div>

            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-600 hover:bg-dark-500 text-white font-semibold rounded-xl transition-colors"
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        <div className="glass rounded-2xl p-8 sm:p-12 glow-green">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-primary-400" />
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Audit réussi
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
            >
              Votre gain fiscal estimé
            </motion.h2>
          </div>

          {/* Main Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-6xl sm:text-7xl font-bold gradient-text mb-2">
              {formatCurrency(gain)}
            </div>
            <p className="text-zinc-400">
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
                className="p-4 rounded-xl bg-dark-700/50 text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
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
                text: "Éligibilité confirmée (Articles 205-208)",
              },
              {
                icon: Calculator,
                text: "Prise en compte de votre Quotient Familial",
              },
              {
                icon: FileCheck,
                text: "OCR prêt pour vos reçus",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20"
              >
                <item.icon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-white font-medium">{item.text}</span>
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
              <div className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-500/20 border-2 border-primary-500 text-primary-400 font-semibold rounded-xl">
                <Check className="w-5 h-5" />
                Dossier sauvegardé avec succès
              </div>
            ) : (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 glow-green hover:glow-green-strong"
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
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
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
          <div className="flex items-center gap-2 text-zinc-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600">
            <span className="text-xs">Taux BCE Officiels</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
