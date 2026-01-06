"use client";

import { motion } from "framer-motion";
import { FileText, Users, Target, Info, TrendingUp, Sparkles, Upload, Check, AlertCircle } from "lucide-react";
import ActionCards from "@/components/dashboard/ActionCards";
import TransfersTable from "@/components/dashboard/TransfersTable";
import RecoveryProgressBar, { type Receipt } from "@/components/dashboard/RecoveryProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { simulation, syncing, loading, conformityScore, estimatedRecovery, fiscalProfile, transfers, documents } = useDashboard();

  // Debug: afficher les données chargées
  console.log("[Dashboard Page] estimatedRecovery:", estimatedRecovery, "profile:", fiscalProfile?.estimated_recovery, "simulation:", simulation?.tax_gain, "loading:", loading);

  // Convertir les transferts en format Receipt pour le composant RecoveryProgressBar
  const receipts: Receipt[] = transfers.map(t => {
    const date = new Date(t.date);
    return {
      month: date.getMonth() + 1, // 1-12
      amount_eur: t.amountEur || 0,
      fees_eur: 0, // Les frais seront ajoutés quand disponibles
    };
  });

  // TMI de l'utilisateur (par défaut 30% si non défini)
  const userTMI = fiscalProfile?.tmi || simulation?.tmi || 30;

  // Obtenir le prénom de l'utilisateur
  const getFirstName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ")[0];
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Utilisateur";
  };

  // S'assurer que taxGain est toujours un nombre valide (jamais NaN)
  const taxGain = typeof estimatedRecovery === 'number' && !isNaN(estimatedRecovery) ? estimatedRecovery : 0;

  // Couleur du score selon le niveau
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#eab308";
    return "#f97316";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "rgba(16, 185, 129, 0.1)";
    if (score >= 50) return "rgba(234, 179, 8, 0.1)";
    return "rgba(249, 115, 22, 0.1)";
  };

  return (
    <div>
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Bienvenue {getFirstName()}
          </h1>
          {syncing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Synchronisation...</span>
            </div>
          )}
        </div>

        {/* Deux cartes côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte Potentiel de récupération */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#0D0D0D] border border-emerald-500/30"
            style={{
              boxShadow: "0 0 60px rgba(16, 185, 129, 0.15)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[80px]" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Votre récupération d&apos;impôt</h3>
                  <p className="text-gray-500 text-sm">Sur votre prochaine déclaration</p>
                </div>
              </div>

              {/* Montant */}
              <div className="mb-5">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-5xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {loading ? "..." : formatCurrency(taxGain)}
                  </span>
                </div>
              </div>

              {/* Message d'incitation */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Uploadez vos reçus chaque mois et voyez votre réduction évoluer en temps réel.
                <span className="text-gray-500"> Ou uploadez tout d&apos;un coup — votre économie s&apos;affiche instantanément.</span>
              </p>

              {/* Statut des documents requis */}
              <div className="flex flex-wrap gap-2">
                {/* Reçus de transfert */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  documents.receipts
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  {documents.receipts ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className={`text-xs ${documents.receipts ? "text-emerald-300" : "text-gray-400"}`}>
                    Reçus de transfert
                  </span>
                </div>

                {/* Justificatif de parenté */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  documents.parentalLink
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-orange-500/10 border-orange-500/30"
                }`}>
                  {documents.parentalLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  )}
                  <span className={`text-xs ${documents.parentalLink ? "text-emerald-300" : "text-orange-300"}`}>
                    Justificatif de parenté
                  </span>
                </div>
              </div>

              {/* Message si le lien de parenté manque */}
              {!documents.parentalLink && (
                <p className="text-orange-400/80 text-xs mt-3 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Le justificatif de parenté permet de vérifier le nom du bénéficiaire et valider votre dossier fiscal.</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Carte Score de Conformité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-[#0D0D0D] border border-white/10"
            style={{
              boxShadow: `0 0 60px ${getScoreBgColor(conformityScore)}`,
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] opacity-50"
              style={{ background: getScoreColor(conformityScore) }}
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Score de Conformité</h3>
                    <p className="text-gray-500 text-sm">Complétude de votre dossier</p>
                  </div>
                </div>
                <div className="group relative">
                  <Info className="w-5 h-5 text-gray-600 cursor-help" />
                  <div className="absolute right-0 top-8 w-64 p-4 rounded-xl bg-[#0D0D0D] border border-white/10 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                    Atteignez 100% en uploadant tous les documents requis pour un dossier fiscal complet.
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="10"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={getScoreColor(conformityScore)}
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 352" }}
                      animate={{
                        strokeDasharray: `${(conformityScore / 100) * 352} 352`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        filter: `drop-shadow(0 0 12px ${getScoreColor(conformityScore)}60)`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreTextColor(conformityScore)}`}>
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
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {conformityScore < 100
                      ? "Ajoutez les documents manquants pour maximiser vos chances."
                      : "Votre dossier est prêt pour la déclaration fiscale."}
                  </p>

                  {conformityScore === 100 ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Prêt pour la déclaration</span>
                    </div>
                  ) : (
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: getScoreColor(conformityScore),
                          boxShadow: `0 0 20px ${getScoreColor(conformityScore)}50`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${conformityScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barre de progression des reçus par mois */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl p-6 bg-[#0D0D0D] border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Suivi mensuel</h3>
              <p className="text-gray-500 text-xs">Vos reçus uploadés par mois</p>
            </div>
          </div>
          <RecoveryProgressBar receipts={receipts} tmi={userTMI} />
        </motion.div>
      </motion.div>

      {/* Actions Prioritaires */}
      <ActionCards />

      {/* Tableau des Transferts */}
      <TransfersTable />
    </div>
  );
}
