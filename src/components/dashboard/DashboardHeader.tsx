"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Info, Sparkles, Check } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

export default function DashboardHeader() {
  const { simulation, conformityScore, loading } = useDashboard();

  const taxGain = simulation?.tax_gain || 0;
  const tmi = simulation?.tmi || 0;
  const fiscalParts = simulation?.fiscal_parts || 1;

  // Couleur du score selon le niveau
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#f97316";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Carte Potentiel de Récupération */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5682F2]/10 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white/60 text-sm font-medium">Potentiel de récupération</span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span
              className="text-5xl sm:text-6xl font-bold"
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatCurrency(taxGain)}
            </span>
            <span className="text-white/40 text-lg">/an</span>
          </div>

          {simulation ? (
            <>
              <div className="flex items-center gap-4 mt-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/50 text-sm">TMI</span>
                  <span className="text-white font-bold ml-2">{tmi}%</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/50 text-sm">Parts</span>
                  <span className="text-white font-bold ml-2">{fiscalParts}</span>
                </div>
              </div>
              <p className="mt-5 text-sm text-white/50 leading-relaxed">
                Uploadez vos reçus de transferts pour calculer votre déduction exacte.
              </p>
            </>
          ) : loading ? (
            <div className="mt-4 space-y-3">
              <div className="flex gap-4">
                <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
              </div>
              <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/40">
              Complétez une simulation pour voir votre gain potentiel
            </p>
          )}
        </div>
      </motion.div>

      {/* Carte Score de Conformité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] opacity-30"
          style={{ background: getScoreColor(conformityScore) }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-white/60" />
              </div>
              <span className="text-white/60 text-sm font-medium">Score de Conformité</span>
            </div>
            <div className="group relative">
              <Info className="w-4 h-4 text-white/30 cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-4 rounded-2xl bg-[#1a1a1f] border border-white/10 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                Atteignez 100% en uploadant tous les documents requis pour un dossier fiscal complet.
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke={getScoreColor(conformityScore)}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 301.6" }}
                  animate={{
                    strokeDasharray: `${(conformityScore / 100) * 301.6} 301.6`,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    filter: `drop-shadow(0 0 10px ${getScoreColor(conformityScore)}50)`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreTextColor(conformityScore)}`}>
                  {conformityScore}%
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex-1">
              <p className="text-white font-semibold text-lg mb-2">
                {conformityScore < 50 && "Dossier incomplet"}
                {conformityScore >= 50 && conformityScore < 80 && "Dossier en cours"}
                {conformityScore >= 80 && conformityScore < 100 && "Presque complet !"}
                {conformityScore === 100 && "Dossier complet"}
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                {conformityScore < 100
                  ? "Ajoutez les documents manquants pour maximiser vos chances."
                  : "Votre dossier est prêt pour la déclaration fiscale."}
              </p>

              {conformityScore === 100 && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium">Prêt pour la déclaration</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${getScoreColor(conformityScore)} 0%, ${getScoreColor(conformityScore)}cc 100%)`,
                  boxShadow: `0 0 20px ${getScoreColor(conformityScore)}50`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${conformityScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
