"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Euro,
  Users,
  Heart,
  Baby,
  Wallet,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Landmark,
  Lock,
  Shield,
} from "lucide-react";
import {
  calculateTaxGain,
  checkFullEligibility,
  formatCurrency,
  type BeneficiaryType,
  type ExpenseType,
  type TaxResult,
  type IneligibilityReason,
} from "@/lib/tax-calculator";
import { useTheme } from "@/contexts/ThemeContext";
import BackgroundEffect from "./BackgroundEffect";

interface AuditFormData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  expenseType: ExpenseType;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
}

export interface AuditResultData extends TaxResult {
  eligible: boolean;
  ineligibilityReason?: IneligibilityReason;
  ineligibilityMessage?: string;
  legalReference?: string;
}

interface SmartAuditProps {
  onComplete: (result: AuditResultData, data?: AuditFormData) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface AuditData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType | null;
  expenseType: ExpenseType | null;
  isMarried: boolean | null;
  childrenCount: number;
  monthlyIncome: number; // Salaire mensuel net
}

// Gradient text style
const gradientStyle = {
  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function SmartAudit({ onComplete }: SmartAuditProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<AuditData>({
    monthlySent: 200,
    beneficiaryType: null,
    expenseType: null,
    isMarried: null,
    childrenCount: 0,
    monthlyIncome: 2500, // Salaire mensuel net par défaut
  });

  // Calculer le revenu annuel à partir du mensuel
  const annualIncome = data.monthlyIncome * 12;

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.monthlySent >= 50;
      case 2:
        return data.beneficiaryType !== null;
      case 3:
        return data.expenseType !== null;
      case 4:
        return data.isMarried !== null;
      case 5:
        return true;
      case 6:
        return data.monthlyIncome > 0;
      default:
        return false;
    }
  };

  const goToStep = (newStep: Step) => {
    setStep(newStep);
  };

  const handleNext = () => {
    // Sortie anticipée si bénéficiaire non éligible (frères/sœurs)
    if (step === 2 && data.beneficiaryType === "siblings") {
      const result = calculateTaxGain(
        data.monthlySent,
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType,
        "alimentary",
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType || "alimentary",
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: annualIncome,
      };
      onComplete({
        ...result,
        eligible: false,
        ineligibilityReason: eligibility.reason,
        ineligibilityMessage: eligibility.message,
        legalReference: eligibility.legalReference,
      }, formData);
      return;
    }

    // Sortie anticipée si dépenses d'investissement
    if (step === 3 && data.expenseType === "investment") {
      const result = calculateTaxGain(
        data.monthlySent,
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType!,
        data.expenseType,
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: annualIncome,
      };
      onComplete({
        ...result,
        eligible: false,
        ineligibilityReason: eligibility.reason,
        ineligibilityMessage: eligibility.message,
        legalReference: eligibility.legalReference,
      }, formData);
      return;
    }

    if (step < 6) {
      goToStep((step + 1) as Step);
    } else {
      // Vérification complète à la fin (inclut TMI = 0%)
      const result = calculateTaxGain(
        data.monthlySent,
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType!,
        data.expenseType!,
        annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType!,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: annualIncome,
      };
      onComplete({
        ...result,
        eligible: eligibility.eligible,
        ineligibilityReason: eligibility.reason,
        ineligibilityMessage: eligibility.message,
        legalReference: eligibility.legalReference,
      }, formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      goToStep((step - 1) as Step);
    }
  };

  // Update slider background
  useEffect(() => {
    const slider = document.getElementById("amount-slider") as HTMLInputElement;
    if (slider) {
      const value = ((data.monthlySent - 50) / (2000 - 50)) * 100;
      slider.style.setProperty("--value", `${value}%`);
    }
  }, [data.monthlySent]);

  const stepColors = ["#a855f7", "#ec4899", "#f59e0b", "#a855f7", "#ec4899", "#a855f7"];
  const currentColor = stepColors[step - 1];

  return (
    <section
      id="smart-audit"
      className="relative min-h-screen flex items-center justify-center py-12 sm:py-20 px-4"
    >
      {/* Fond style Finary */}
      <BackgroundEffect />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border mb-3 sm:mb-4 ${isLight ? 'bg-white/80 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <Sparkles className="w-4 h-4 text-accent-purple" />
            <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-white/60'}`}>Simulation personnalisée</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Estimez votre <span style={gradientStyle}>économie fiscale</span>
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className={`flex justify-between text-sm mb-2 sm:mb-3 ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
            <span className="flex items-center gap-2">
              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-white'}`}>
                {step}
              </span>
              <span className="text-xs sm:text-sm">Étape {step} sur {totalSteps}</span>
            </span>
            <span className="text-accent-purple font-medium text-xs sm:text-sm">{Math.round(progress)}%</span>
          </div>
          <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #5682F2 0%, ${currentColor} 100%)`,
              }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-2 sm:mt-3">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  s <= step ? "bg-accent-purple" : (isLight ? "bg-gray-200" : "bg-white/10")
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div
          className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-10 min-h-[400px] sm:min-h-[450px] flex flex-col overflow-hidden border ${isLight ? 'bg-white/80 border-gray-200 shadow-lg' : 'bg-white/[0.03] border-white/10'}`}
        >
          <div className="flex-1 flex flex-col relative z-10">
            {/* Step 1: Monthly Amount */}
            {step === 1 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #5682F220 0%, #5682F210 100%)",
                      border: "1px solid #5682F230"
                    }}
                  >
                    <Euro className="w-5 h-5 sm:w-7 sm:h-7 text-[#5682F2]" />
                  </div>
                  <h3 className={`text-lg sm:text-2xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Montant envoyé par mois ?
                  </h3>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  {/* Saisie directe du montant */}
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={data.monthlySent || ""}
                      onChange={(e) =>
                        setData({ ...data, monthlySent: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      placeholder="200"
                      className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-3xl sm:text-4xl font-bold text-center rounded-xl sm:rounded-2xl focus:outline-none ${
                        isLight
                          ? 'bg-gray-50 border border-gray-200 focus:border-accent-purple/50 text-gray-900 placeholder-gray-300'
                          : 'bg-white/5 border border-white/10 focus:border-accent-purple/50 text-white placeholder-white/20'
                      }`}
                    />
                    <span className={`absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-medium ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                      €/mois
                    </span>
                  </div>

                  {/* Raccourcis montants rapides */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {[100, 200, 300, 500, 800].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setData({ ...data, monthlySent: amount })}
                        className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
                          data.monthlySent === amount
                            ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
                            : isLight
                              ? "bg-gray-100 text-gray-600 border border-gray-200 active:bg-gray-200"
                              : "bg-white/5 text-white/50 border border-white/10 active:bg-white/10"
                        }`}
                      >
                        {amount} €
                      </button>
                    ))}
                  </div>

                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-accent-purple/10 border border-accent-purple/20 text-center`}>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                      Soit{" "}
                      <span className="text-accent-purple font-bold text-base sm:text-lg">
                        {formatCurrency(data.monthlySent * 12)}
                      </span>{" "}
                      par an en déduction potentielle
                    </p>
                  </div>

                  {/* Message confidentialité */}
                  <div className={`flex items-center justify-center gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs">Vos données restent privées et ne sont jamais partagées</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Beneficiary Type */}
            {step === 2 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf620 0%, #8b5cf610 100%)",
                      border: "1px solid #8b5cf630"
                    }}
                  >
                    <Users className="w-5 h-5 sm:w-7 sm:h-7 text-[#8b5cf6]" />
                  </div>
                  <h3 className={`text-lg sm:text-2xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Qui est le bénéficiaire ?
                  </h3>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {[
                    {
                      type: "parents" as BeneficiaryType,
                      label: "Parents / Grands-parents",
                      icon: Users,
                      desc: "Ascendants directs",
                      color: "#a855f7",
                    },
                    {
                      type: "children" as BeneficiaryType,
                      label: "Enfants",
                      icon: Baby,
                      desc: "Descendants directs",
                      color: "#5682F2",
                    },
                    {
                      type: "siblings" as BeneficiaryType,
                      label: "Frères / Sœurs / Oncles",
                      icon: Heart,
                      desc: "Collatéraux",
                      color: "#f59e0b",
                    },
                  ].map(({ type, label, icon: Icon, desc, color }) => (
                    <button
                      key={type}
                      onClick={() => setData({ ...data, beneficiaryType: type })}
                      className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border text-left ${
                        data.beneficiaryType === type
                          ? (isLight ? "border-gray-300 bg-gray-50" : "border-white/30 bg-white/10")
                          : (isLight ? "border-gray-200 bg-white active:bg-gray-50" : "border-white/5 bg-white/[0.02] active:bg-white/[0.05]")
                      }`}
                    >
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                          border: `1px solid ${color}30`
                        }}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`font-semibold block mb-0.5 text-sm sm:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {label}
                        </span>
                        <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-white/40'}`}>{desc}</span>
                      </div>
                      {data.beneficiaryType === type && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent-purple flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {data.beneficiaryType === "siblings" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className={`text-xs sm:text-sm ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>
                        Les versements aux frères, sœurs, oncles ou tantes ne sont pas déductibles fiscalement (Articles 205-208 du Code civil).
                      </p>
                    </div>
                  </div>
                )}

                {/* Message confidentialité */}
                <div className={`mt-4 flex items-center justify-center gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">Information confidentielle pour le calcul uniquement</span>
                </div>
              </div>
            )}

            {/* Step 3: Expense Type */}
            {step === 3 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)",
                      border: "1px solid #f59e0b30"
                    }}
                  >
                    <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-[#f59e0b]" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-white">
                    Nature des envois ?
                  </h3>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {[
                    {
                      type: "alimentary" as ExpenseType,
                      label: "Besoins vitaux",
                      icon: ShoppingBag,
                      desc: "Nourriture, logement, santé, vêtements",
                      color: "#a855f7",
                    },
                    {
                      type: "investment" as ExpenseType,
                      label: "Investissement / Immobilier",
                      icon: Landmark,
                      desc: "Achat immobilier, épargne, placement",
                      color: "#f59e0b",
                    },
                  ].map(({ type, label, icon: Icon, desc, color }) => (
                    <button
                      key={type}
                      onClick={() => setData({ ...data, expenseType: type })}
                      className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border text-left ${
                        data.expenseType === type
                          ? "border-white/30 bg-white/10"
                          : "border-white/5 bg-white/[0.02] active:bg-white/[0.05]"
                      }`}
                    >
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                          border: `1px solid ${color}30`
                        }}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-white block mb-0.5 text-sm sm:text-base">
                          {label}
                        </span>
                        <span className="text-xs sm:text-sm text-white/40">{desc}</span>
                      </div>
                      {data.expenseType === type && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent-purple flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {data.expenseType === "investment" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-amber-200">
                        Les sommes destinées à l&apos;investissement, l&apos;épargne ou l&apos;immobilier ne sont pas déductibles. Seules les dépenses alimentaires sont éligibles.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Marital Status */}
            {step === 4 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                      border: "1px solid #a855f730"
                    }}
                  >
                    <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-[#a855f7]" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-white">
                    Situation familiale ?
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { value: false, label: "Célibataire", emoji: "👤" },
                    { value: true, label: "Marié(e) / Pacsé(e)", emoji: "💑" },
                  ].map(({ value, label, emoji }) => (
                    <button
                      key={String(value)}
                      onClick={() => setData({ ...data, isMarried: value })}
                      className={`p-5 sm:p-8 rounded-xl sm:rounded-2xl border ${
                        data.isMarried === value
                          ? "border-white/30 bg-white/10"
                          : "border-white/5 bg-white/[0.02] active:bg-white/[0.05]"
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl block mb-2 sm:mb-4">{emoji}</span>
                      <span
                        className={`font-semibold text-sm sm:text-lg ${
                          data.isMarried === value ? "text-white" : "text-white/70"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                <p className={`text-xs sm:text-sm text-center mt-4 sm:mt-6 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                  Cette information permet de calculer votre quotient familial
                </p>

                {/* Message confidentialité */}
                <div className={`mt-3 flex items-center justify-center gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">Aucune donnée partagée avec des tiers</span>
                </div>
              </div>
            )}

            {/* Step 5: Children Count */}
            {step === 5 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                      border: "1px solid #a855f730"
                    }}
                  >
                    <Baby className="w-5 h-5 sm:w-7 sm:h-7 text-accent-purple" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-white">
                    Nombre d&apos;enfants à charge ?
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        childrenCount: Math.max(0, data.childrenCount - 1),
                      })
                    }
                    disabled={data.childrenCount === 0}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 active:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-2xl sm:text-3xl font-bold text-white"
                  >
                    -
                  </button>

                  <div className="text-center min-w-[100px] sm:min-w-[120px]">
                    <span
                      className="text-6xl sm:text-7xl font-bold"
                      style={gradientStyle}
                    >
                      {data.childrenCount}
                    </span>
                    <span className="text-white/40 block mt-2 text-sm">
                      {data.childrenCount <= 1 ? "enfant" : "enfants"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        childrenCount: Math.min(10, data.childrenCount + 1),
                      })
                    }
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 active:bg-white/10 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white"
                  >
                    +
                  </button>
                </div>

                <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs sm:text-sm text-white/60">
                    Parts fiscales:{" "}
                    <span className="text-accent-purple font-bold text-base sm:text-lg">
                      {(data.isMarried ? 2 : 1) +
                        (data.childrenCount === 1
                          ? 0.5
                          : data.childrenCount === 2
                          ? 1
                          : data.childrenCount > 2
                          ? 1 + (data.childrenCount - 2)
                          : 0)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Monthly Income */}
            {step === 6 && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                      border: "1px solid #a855f730"
                    }}
                  >
                    <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-accent-purple" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-2xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {data.isMarried
                        ? "Revenu mensuel du foyer ?"
                        : "Votre revenu mensuel ?"}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
                      💡 Salaire <span className="font-semibold">avant impôt</span> (brut ou net imposable)
                    </p>
                  </div>
                </div>

                {data.isMarried && (
                  <div className={`mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-[#5682F2]/10 border-[#5682F2]/30'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">👫</span>
                      <div>
                        <p className={`text-sm font-semibold ${isLight ? 'text-blue-700' : 'text-[#5682F2]'}`}>
                          Additionnez vos deux salaires
                        </p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-blue-600' : 'text-[#5682F2]/80'}`}>
                          Votre salaire + celui de votre conjoint(e) = revenu du foyer
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={data.monthlyIncome || ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          monthlyIncome: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder={data.isMarried ? "5000" : "2500"}
                      className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-2xl sm:text-3xl font-bold text-center rounded-xl sm:rounded-2xl focus:outline-none ${
                        isLight
                          ? 'bg-gray-50 border border-gray-200 focus:border-accent-purple/50 text-gray-900 placeholder-gray-300'
                          : 'bg-white/5 border border-white/10 focus:border-accent-purple/50 text-white placeholder-white/20'
                      }`}
                    />
                    <span className={`absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-medium ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                      €/mois
                    </span>
                  </div>

                  {/* Quick Select - Monthly amounts */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {(data.isMarried
                      ? [4000, 5000, 7000, 10000]
                      : [1500, 2000, 2500, 3500]
                    ).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setData({ ...data, monthlyIncome: amount })}
                        className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
                          data.monthlyIncome === amount
                            ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
                            : isLight
                              ? "bg-gray-100 text-gray-600 border border-gray-200 active:bg-gray-200"
                              : "bg-white/5 text-white/50 border border-white/10 active:bg-white/10"
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Show calculated annual income */}
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-accent-purple/10 border border-accent-purple/20 text-center`}>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                      Soit{" "}
                      <span className="text-accent-purple font-bold text-base sm:text-lg">
                        {formatCurrency(annualIncome)}
                      </span>{" "}
                      par an (revenu imposable)
                    </p>
                  </div>

                  {/* Message confidentialité */}
                  <div className={`flex items-center justify-center gap-2 ${isLight ? 'text-gray-400' : 'text-white/30'}`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs">Données 100% confidentielles - Calcul instantané</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={`flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t relative z-10 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg sm:rounded-xl text-sm ${isLight ? 'text-gray-500 active:text-gray-700 active:bg-gray-100' : 'text-white/50 active:text-white active:bg-white/5'}`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Retour
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-1 sm:gap-2 px-5 sm:px-8 py-3 sm:py-3.5 text-white font-semibold rounded-xl sm:rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{
                background: canProceed()
                  ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                  : (isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"),
              }}
            >
              {step === 6 ? "Calculer mon gain" : "Continuer"}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
