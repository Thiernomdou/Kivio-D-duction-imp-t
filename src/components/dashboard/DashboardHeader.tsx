"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Info } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

export default function DashboardHeader() {
  const { simulation, conformityScore } = useDashboard();

  const taxGain = simulation?.tax_gain || 0;

  // Couleur du score selon le niveau
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-400";
    if (score >= 50) return "from-yellow-500 to-yellow-400";
    return "from-orange-500 to-orange-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Carte Potentiel de Récupération */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-dark-800 border border-primary-500/30 p-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Potentiel de récupération</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-white">
              {formatCurrency(taxGain)}
            </span>
            <span className="text-zinc-400 text-sm">/an</span>
          </div>

          {simulation && (
            <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
              <span>TMI: <span className="text-white font-medium">{simulation.tmi}%</span></span>
              <span>Parts: <span className="text-white font-medium">{simulation.fiscal_parts}</span></span>
            </div>
          )}

          {!simulation && (
            <p className="mt-4 text-sm text-zinc-500">
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
        className="rounded-2xl bg-dark-800 border border-dark-600 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Score de Conformité du Dossier</span>
          </div>
          <div className="group relative">
            <Info className="w-4 h-4 text-zinc-500 cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-3 rounded-lg bg-dark-700 border border-dark-600 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Atteignez 100% en uploadant tous les documents requis pour un dossier fiscal complet.
            </div>
          </div>
        </div>

        {/* Score circulaire */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              {/* Cercle de fond */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-dark-600"
              />
              {/* Cercle de progression */}
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{
                  strokeDasharray: `${(conformityScore / 100) * 251.2} 251.2`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={conformityScore >= 80 ? "#22c55e" : conformityScore >= 50 ? "#eab308" : "#f97316"} />
                  <stop offset="100%" stopColor={conformityScore >= 80 ? "#4ade80" : conformityScore >= 50 ? "#facc15" : "#fb923c"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(conformityScore)}`}>
                {conformityScore}%
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-white font-medium mb-2">
              {conformityScore < 50 && "Dossier incomplet"}
              {conformityScore >= 50 && conformityScore < 80 && "Dossier en cours"}
              {conformityScore >= 80 && conformityScore < 100 && "Presque complet !"}
              {conformityScore === 100 && "Dossier complet"}
            </p>
            <p className="text-sm text-zinc-500">
              {conformityScore < 100
                ? "Ajoutez les documents manquants pour maximiser vos chances de validation."
                : "Votre dossier est prêt pour la déclaration fiscale."}
            </p>
          </div>
        </div>

        {/* Barre de progression linéaire */}
        <div className="mt-4">
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getScoreBarColor(conformityScore)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${conformityScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
