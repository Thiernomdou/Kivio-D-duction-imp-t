"use client";

import { FileText, Target, TrendingUp, Sparkles, Upload, Check, AlertCircle } from "lucide-react";
import ActionCards from "@/components/dashboard/ActionCards";
import RecoveryProgressBar, { type Receipt } from "@/components/dashboard/RecoveryProgressBar";
import DocumentAnalysisResult from "@/components/dashboard/DocumentAnalysisResult";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { formatCurrency } from "@/lib/tax-calculator";

// Gradient text style (same as SmartAudit)
const gradientStyle = {
  background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

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
    <div className="relative">
      {/* Background effects - same style as SmartAudit */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#5682F2]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            Bonjour <span style={gradientStyle}>{getFirstName()}</span>
            {syncing && (
              <span className="inline-block ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </h1>
          <p className="text-white/40 text-sm sm:text-base">
            Uploadez votre reçu à chaque envoi et visualisez en temps réel ce que vous déduisez
          </p>
        </div>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Recovery Amount Card */}
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden bg-white/[0.03] border border-white/10">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #10B98120 0%, #10B98110 100%)",
                    border: "1px solid #10B98130"
                  }}
                >
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    Récupération d&apos;impôt
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Prochaine déclaration</p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mb-4">
                <span className="text-4xl sm:text-5xl font-bold" style={gradientStyle}>
                  {loading ? "..." : formatCurrency(taxGain)}
                </span>
              </div>

              {/* Document Status */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                  documents.receipts
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10"
                }`}>
                  {documents.receipts ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className={documents.receipts ? "text-emerald-300" : "text-gray-400"}>
                    Reçus
                  </span>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
                  documents.parentalLink
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-orange-500/10 border-orange-500/30"
                }`}>
                  {documents.parentalLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  )}
                  <span className={documents.parentalLink ? "text-emerald-300" : "text-orange-300"}>
                    Parenté
                  </span>
                </div>
              </div>

              {/* Progress info */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-white/60">
                  Ajoutez vos reçus et justificatifs pour{" "}
                  <span className="text-emerald-400 font-semibold">calculer votre réduction</span>
                </p>
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-4 sm:gap-6 h-full">
              {/* Circular Progress */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    fill="none"
                    className="sm:hidden"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke={getScoreColor(conformityScore)}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(conformityScore / 100) * 264} 264`}
                    className="sm:hidden"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="none"
                    className="hidden sm:block"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={getScoreColor(conformityScore)}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(conformityScore / 100) * 301} 301`}
                    className="hidden sm:block"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl sm:text-3xl font-bold ${getScoreTextColor(conformityScore)}`}>
                    {conformityScore}%
                  </span>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  <h3 className="text-white font-semibold text-base sm:text-lg">Conformité</h3>
                </div>

                <p className="text-white font-medium mb-1">
                  {conformityScore < 50 && "Incomplet"}
                  {conformityScore >= 50 && conformityScore < 80 && "En cours"}
                  {conformityScore >= 80 && conformityScore < 100 && "Presque !"}
                  {conformityScore === 100 && "Complet"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  {conformityScore < 100
                    ? "Ajoutez les documents manquants."
                    : "Prêt pour la déclaration."}
                </p>

                {conformityScore === 100 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Prêt</span>
                  </div>
                ) : (
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
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

        {/* Actions Prioritaires */}
        <ActionCards />

        {/* Monthly Progress */}
        <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #10B98120 0%, #10B98110 100%)",
                border: "1px solid #10B98130"
              }}
            >
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Suivi mensuel</h3>
              <p className="text-gray-500 text-sm">Vos reçus de l&apos;année en cours</p>
            </div>
          </div>
          <RecoveryProgressBar receipts={receipts} tmi={userTMI} />
        </div>

        {/* Résultats de l'analyse documentaire */}
        <DocumentAnalysisResult />
      </div>
    </div>
  );
}
