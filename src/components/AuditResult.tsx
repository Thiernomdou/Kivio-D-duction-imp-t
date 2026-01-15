"use client";

import { useRouter } from "next/navigation";
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
  LayoutDashboard,
} from "lucide-react";
import { formatCurrency, type TaxResult, type IneligibilityReason } from "@/lib/tax-calculator";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundEffect from "./BackgroundEffect";

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
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
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
      <section className="relative min-h-screen flex items-center justify-center py-12 sm:py-20 px-4">
        {/* Fond style Finary */}
        <BackgroundEffect />

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border ${isLight ? 'bg-white/80 border-gray-200 shadow-lg' : 'bg-white/[0.03] border-white/10'}`}>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl ${config.iconBg} flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${config.iconColor}`} />
            </div>

            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {config.title}
            </h2>
            <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>{config.subtitle}</p>

            {/* Message principal */}
            <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border mb-4 sm:mb-6 text-left ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm sm:text-base ${isLight ? 'text-gray-700' : 'text-white/80'}`}>
                  {ineligibilityMessage || "Votre situation ne permet pas de bénéficier de cette déduction fiscale."}
                </p>
              </div>
            </div>

            {/* Référence légale */}
            {legalReference && (
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#5682F2]/10 border border-[#5682F2]/30 mb-6 sm:mb-8 text-left">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#5682F2] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#5682F2] mb-1">Base légale</p>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-white/60'}`}>{legalReference}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton recommencer */}
            <button
              onClick={onRestart}
              className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 font-semibold rounded-xl text-sm sm:text-base border ${isLight ? 'bg-gray-100 active:bg-gray-200 border-gray-200 text-gray-900' : 'bg-white/10 active:bg-white/15 border-white/10 text-white'}`}
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Recommencer la simulation
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Eligible flow - Success
  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 sm:py-20 px-4">
      {/* Fond style Finary */}
      <BackgroundEffect />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <div
          className={`rounded-2xl sm:rounded-3xl p-6 sm:p-12 ${isLight ? 'shadow-lg' : ''}`}
          style={{
            background: isLight
              ? "linear-gradient(180deg, rgba(168,85,247,0.08) 0%, rgba(255,255,255,0.95) 100%)"
              : "linear-gradient(180deg, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          {/* Success Icon */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-accent-purple/20 flex items-center justify-center"
            style={{ border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent-purple" />
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent-purple/20 border border-accent-purple/30 text-accent-purple text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Simulation terminée
            </div>

            <h2 className={`text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Voici ce que vous <span className="gradient-text">récupérez</span>
            </h2>
            <p className={`text-sm sm:text-base ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
              avec vos envois d&apos;argent à votre famille
            </p>
          </div>

          {/* Main Result */}
          <div className="text-center mb-6 sm:mb-8">
            <div
              className="text-5xl sm:text-7xl font-bold mb-1 sm:mb-2"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatCurrency(gain)}
            </div>
            <p className={`text-sm sm:text-base ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
              d&apos;<span className="gradient-text">économie d&apos;impôt</span> potentielle par an
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: "TMI", value: `${tmi}%` },
              { label: "Parts", value: parts.toString() },
              { label: "Avant", value: formatCurrency(taxBefore) },
              { label: "Après", value: formatCurrency(taxAfter) },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border text-center ${isLight ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}
              >
                <div className={`text-lg sm:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{stat.value}</div>
                <div className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-white/40'}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Eligibility Checklist */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
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
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-accent-purple/10 border border-accent-purple/20"
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-purple flex-shrink-0" />
                <span className={`text-xs sm:text-sm font-medium ${isLight ? 'text-gray-700' : 'text-white/80'}`}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {saveSuccess ? (
              isAuthenticated ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 text-white font-semibold rounded-xl text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Voir mon tableau de bord
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-accent-purple/20 border border-accent-purple/50 text-accent-purple font-semibold rounded-xl text-sm sm:text-base">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  Dossier sauvegardé avec succès
                </div>
              )
            ) : (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                style={{
                  background: saving ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    {isAuthenticated
                      ? "Sauvegarder mon dossier"
                      : "Créer un compte et sauvegarder"}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Restart Link */}
          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={onRestart}
              className={`text-xs sm:text-sm ${isLight ? 'text-gray-400 active:text-gray-600' : 'text-white/40 active:text-white/70'}`}
            >
              Recommencer la simulation
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className={`flex items-center gap-1.5 sm:gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Données sécurisées</span>
          </div>
          <div className={`flex items-center gap-1.5 sm:gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
            <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Barème fiscal 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}
