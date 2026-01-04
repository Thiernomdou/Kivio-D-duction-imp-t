"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  annualIncome: number;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// Gradient text style
const gradientStyle = {
  background: "linear-gradient(135deg, #5682F2 0%, #22c55e 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function SmartAudit({ onComplete }: SmartAuditProps) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<AuditData>({
    monthlySent: 200,
    beneficiaryType: null,
    expenseType: null,
    isMarried: null,
    childrenCount: 0,
    annualIncome: 35000,
  });

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
        return data.annualIncome > 0;
      default:
        return false;
    }
  };

  const goToStep = (newStep: Step) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleNext = () => {
    // Sortie anticipée si bénéficiaire non éligible (frères/sœurs)
    if (step === 2 && data.beneficiaryType === "siblings") {
      const result = calculateTaxGain(
        data.monthlySent,
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType,
        "alimentary",
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType || "alimentary",
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: data.annualIncome,
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
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType!,
        data.expenseType,
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: data.annualIncome,
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
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const eligibility = checkFullEligibility(
        data.beneficiaryType!,
        data.expenseType!,
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        expenseType: data.expenseType!,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: data.annualIncome,
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

  const stepColors = ["#5682F2", "#8b5cf6", "#f59e0b", "#a855f7", "#22c55e", "#22c55e"];
  const currentColor = stepColors[step - 1];

  return (
    <section
      id="smart-audit"
      className="relative min-h-screen flex items-center justify-center py-20 px-4"
    >
      {/* Background with glows */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#5682F2]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-white/60 text-sm">Simulation personnalisée</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Estimez votre <span style={gradientStyle}>économie fiscale</span>
          </h2>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/40 mb-3">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">
                {step}
              </span>
              Étape {step} sur {totalSteps}
            </span>
            <span className="text-emerald-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, #5682F2 0%, ${currentColor} 100%)`,
                boxShadow: `0 0 20px ${currentColor}50`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-emerald-400" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Container */}
        <motion.div
          className="relative rounded-3xl p-8 sm:p-10 min-h-[450px] flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-30 transition-all duration-500"
            style={{ background: currentColor }}
          />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col relative z-10"
            >
              {/* Step 1: Monthly Amount */}
              {step === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #5682F220 0%, #5682F210 100%)",
                        border: "1px solid #5682F230"
                      }}
                    >
                      <Euro className="w-7 h-7 text-[#5682F2]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Montant envoyé par mois ?
                    </h3>
                  </div>

                  <div className="space-y-8">
                    <div className="text-center">
                      <span
                        className="text-6xl sm:text-7xl font-bold"
                        style={gradientStyle}
                      >
                        {formatCurrency(data.monthlySent)}
                      </span>
                      <span className="text-white/40 block mt-2">par mois</span>
                    </div>

                    <input
                      id="amount-slider"
                      type="range"
                      min="50"
                      max="2000"
                      step="10"
                      value={data.monthlySent}
                      onChange={(e) =>
                        setData({ ...data, monthlySent: parseInt(e.target.value) })
                      }
                      className="w-full accent-emerald-500"
                    />

                    <div className="flex justify-between text-sm text-white/30 font-medium">
                      <span>50 €</span>
                      <span>2 000 €</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-sm text-white/60">
                        Soit{" "}
                        <span className="text-emerald-400 font-bold text-lg">
                          {formatCurrency(data.monthlySent * 12)}
                        </span>{" "}
                        par an en déduction potentielle
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Beneficiary Type */}
              {step === 2 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #8b5cf620 0%, #8b5cf610 100%)",
                        border: "1px solid #8b5cf630"
                      }}
                    >
                      <Users className="w-7 h-7 text-[#8b5cf6]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Qui est le bénéficiaire ?
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    {[
                      {
                        type: "parents" as BeneficiaryType,
                        label: "Parents / Grands-parents",
                        icon: Users,
                        desc: "Ascendants directs",
                        color: "#22c55e",
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
                        className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left ${
                          data.beneficiaryType === type
                            ? "border-white/30 bg-white/10"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            data.beneficiaryType === type ? "scale-110" : "group-hover:scale-105"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                            border: `1px solid ${color}30`
                          }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color }}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-white block mb-1">
                            {label}
                          </span>
                          <span className="text-sm text-white/40">{desc}</span>
                        </div>
                        {data.beneficiaryType === type && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {data.beneficiaryType === "siblings" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                          Les versements aux frères, sœurs, oncles ou tantes ne sont pas déductibles fiscalement (Articles 205-208 du Code civil).
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Expense Type */}
              {step === 3 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)",
                        border: "1px solid #f59e0b30"
                      }}
                    >
                      <ShoppingBag className="w-7 h-7 text-[#f59e0b]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Nature des envois ?
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    {[
                      {
                        type: "alimentary" as ExpenseType,
                        label: "Besoins vitaux",
                        icon: ShoppingBag,
                        desc: "Nourriture, logement, santé, vêtements",
                        color: "#22c55e",
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
                        className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left ${
                          data.expenseType === type
                            ? "border-white/30 bg-white/10"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            data.expenseType === type ? "scale-110" : "group-hover:scale-105"
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                            border: `1px solid ${color}30`
                          }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color }}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-white block mb-1">
                            {label}
                          </span>
                          <span className="text-sm text-white/40">{desc}</span>
                        </div>
                        {data.expenseType === type && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {data.expenseType === "investment" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                          Les sommes destinées à l&apos;investissement, l&apos;épargne ou l&apos;immobilier ne sont pas déductibles. Seules les dépenses alimentaires sont éligibles.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 4: Marital Status */}
              {step === 4 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #a855f720 0%, #a855f710 100%)",
                        border: "1px solid #a855f730"
                      }}
                    >
                      <Heart className="w-7 h-7 text-[#a855f7]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Situation familiale ?
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: false, label: "Célibataire", emoji: "👤" },
                      { value: true, label: "Marié(e) / Pacsé(e)", emoji: "💑" },
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={String(value)}
                        onClick={() => setData({ ...data, isMarried: value })}
                        className={`group p-8 rounded-2xl border transition-all duration-300 ${
                          data.isMarried === value
                            ? "border-white/30 bg-white/10"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <span className="text-4xl block mb-4">{emoji}</span>
                        <span
                          className={`font-semibold text-lg ${
                            data.isMarried === value ? "text-white" : "text-white/70"
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-white/30 text-center mt-6">
                    Cette information permet de calculer votre quotient familial
                  </p>
                </div>
              )}

              {/* Step 5: Children Count */}
              {step === 5 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #22c55e20 0%, #22c55e10 100%)",
                        border: "1px solid #22c55e30"
                      }}
                    >
                      <Baby className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Nombre d&apos;enfants à charge ?
                    </h3>
                  </div>

                  <div className="flex items-center justify-center gap-8">
                    <button
                      onClick={() =>
                        setData({
                          ...data,
                          childrenCount: Math.max(0, data.childrenCount - 1),
                        })
                      }
                      disabled={data.childrenCount === 0}
                      className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-3xl font-bold text-white transition-all"
                    >
                      -
                    </button>

                    <div className="text-center min-w-[120px]">
                      <span
                        className="text-7xl font-bold"
                        style={gradientStyle}
                      >
                        {data.childrenCount}
                      </span>
                      <span className="text-white/40 block mt-2">
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
                      className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-3xl font-bold text-white transition-all"
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-sm text-white/60">
                      Parts fiscales:{" "}
                      <span className="text-emerald-400 font-bold text-lg">
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

              {/* Step 6: Annual Income */}
              {step === 6 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #22c55e20 0%, #22c55e10 100%)",
                        border: "1px solid #22c55e30"
                      }}
                    >
                      <Wallet className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {data.isMarried
                        ? "Revenu net annuel du foyer ?"
                        : "Revenu net annuel ?"}
                    </h3>
                  </div>

                  {data.isMarried && (
                    <div className="mb-6 p-4 rounded-2xl bg-[#5682F2]/10 border border-[#5682F2]/30">
                      <p className="text-sm text-[#5682F2] text-center">
                        Additionnez vos deux revenus pour un calcul précis.
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="number"
                        value={data.annualIncome || ""}
                        onChange={(e) =>
                          setData({
                            ...data,
                            annualIncome: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={data.isMarried ? "70000" : "35000"}
                        className="w-full px-6 py-5 text-3xl font-bold text-center bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-white/20 transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 text-2xl font-medium">
                        €
                      </span>
                    </div>

                    <p className="text-sm text-white/30 text-center">
                      {data.isMarried
                        ? "Revenus nets imposables cumulés du couple"
                        : "Revenu net imposable (avant déductions)"}
                    </p>

                    {/* Quick Select */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {(data.isMarried
                        ? [50000, 70000, 100000, 150000]
                        : [25000, 35000, 50000, 75000]
                      ).map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setData({ ...data, annualIncome: amount })}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            data.annualIncome === amount
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10 relative z-10">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xl hover:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: canProceed()
                  ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                  : "rgba(255,255,255,0.1)",
                boxShadow: canProceed() ? "0 10px 40px -10px rgba(34,197,94,0.5)" : "none"
              }}
            >
              {step === 6 ? "Calculer mon gain" : "Continuer"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
