"use client";

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

  // Convertir les transferts en format Receipt pour le composant RecoveryProgressBar
  const receipts: Receipt[] = transfers.map(t => {
    const date = new Date(t.date);
    return {
      month: date.getMonth() + 1,
      amount_eur: t.amountEur || 0,
      fees_eur: 0,
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

  // S'assurer que taxGain est toujours un nombre valide
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

  // Calcul du stroke pour le cercle SVG
  const circumference = 2 * Math.PI * 56;
  const strokeDasharray = `${(conformityScore / 100) * circumference} ${circumference}`;

  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-white">
            Bienvenue {getFirstName()}
          </h1>
          {syncing && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs text-emerald-400">Sync...</span>
            </div>
          )}
        </div>

        {/* Deux cartes - empilées sur mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Carte Potentiel de récupération */}
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-emerald-500/30"
          >
            {/* Glow effect - hidden on mobile */}
            <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">Votre récupération d&apos;impôt</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Sur votre prochaine déclaration</p>
                </div>
              </div>

              {/* Montant */}
              <div className="mb-4 sm:mb-5">
                <span
                  className="text-4xl sm:text-5xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {loading ? "..." : formatCurrency(taxGain)}
                </span>
              </div>

              {/* Message d'incitation */}
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                Uploadez vos reçus à chaque transfert et voyez votre réduction évoluer.
              </p>

              {/* Statut des documents requis */}
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${
                  documents.receipts
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  {documents.receipts ? (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                  )}
                  <span className={`text-[10px] sm:text-xs ${documents.receipts ? "text-emerald-300" : "text-gray-400"}`}>
                    Reçus
                  </span>
                </div>

                <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${
                  documents.parentalLink
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-orange-500/10 border-orange-500/30"
                }`}>
                  {documents.parentalLink ? (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                  )}
                  <span className={`text-[10px] sm:text-xs ${documents.parentalLink ? "text-emerald-300" : "text-orange-300"}`}>
                    Parenté
                  </span>
                </div>
              </div>

              {/* Message si le lien de parenté manque */}
              {!documents.parentalLink && (
                <p className="text-orange-400/80 text-[10px] sm:text-xs mt-2 sm:mt-3 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Le justificatif de parenté valide votre dossier fiscal.</span>
                </p>
              )}
            </div>
          </div>

          {/* Carte Score de Conformité */}
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10"
          >
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Score de Conformité</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">Complétude du dossier</p>
                  </div>
                </div>
              </div>

              {/* Score Display - Layout adapté mobile */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Circular Progress - plus petit sur mobile */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                  <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                      fill="none"
                      className="sm:hidden"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke={getScoreColor(conformityScore)}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(conformityScore / 100) * 264} 264`}
                      className="sm:hidden"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="10"
                      fill="none"
                      className="hidden sm:block"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={getScoreColor(conformityScore)}
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={strokeDasharray}
                      className="hidden sm:block"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl sm:text-4xl font-bold ${getScoreTextColor(conformityScore)}`}>
                      {conformityScore}%
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
                    {conformityScore < 50 && "Incomplet"}
                    {conformityScore >= 50 && conformityScore < 80 && "En cours"}
                    {conformityScore >= 80 && conformityScore < 100 && "Presque !"}
                    {conformityScore === 100 && "Complet"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-2 sm:mb-4">
                    {conformityScore < 100
                      ? "Ajoutez les documents manquants."
                      : "Prêt pour la déclaration."}
                  </p>

                  {conformityScore === 100 ? (
                    <div className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                      <span className="text-xs sm:text-sm font-medium text-emerald-400">Prêt</span>
                    </div>
                  ) : (
                    <div className="w-full h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${conformityScore}%`,
                          background: getScoreColor(conformityScore),
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de progression des reçus par mois */}
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-[#0D0D0D] border border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base">Suivi mensuel</h3>
              <p className="text-gray-500 text-[10px] sm:text-xs">Vos reçus à chaque fois que vous envoyez de l&apos;argent</p>
            </div>
          </div>
          <RecoveryProgressBar receipts={receipts} tmi={userTMI} />
        </div>
      </div>

      {/* Actions Prioritaires */}
      <ActionCards />

      {/* Tableau des Transferts */}
      <TransfersTable />
    </div>
  );
}
