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
} from "lucide-react";
import {
  calculateTaxGain,
  checkEligibility,
  formatCurrency,
  type BeneficiaryType,
  type TaxResult,
} from "@/lib/tax-calculator";

interface AuditFormData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
}

interface SmartAuditProps {
  onComplete: (result: TaxResult & { eligible: boolean }, data?: AuditFormData) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface AuditData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType | null;
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

export default function SmartAudit({ onComplete }: SmartAuditProps) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<AuditData>({
    monthlySent: 200,
    beneficiaryType: null,
    isMarried: null,
    childrenCount: 0,
    annualIncome: 35000,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return data.monthlySent >= 50;
      case 2:
        return data.beneficiaryType !== null;
      case 3:
        return data.isMarried !== null;
      case 4:
        return true;
      case 5:
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
    if (step === 2 && data.beneficiaryType === "siblings") {
      const result = calculateTaxGain(
        data.monthlySent,
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: data.annualIncome,
      };
      onComplete({ ...result, eligible: false }, formData);
      return;
    }

    if (step < 5) {
      goToStep((step + 1) as Step);
    } else {
      const result = calculateTaxGain(
        data.monthlySent,
        data.annualIncome,
        data.isMarried || false,
        data.childrenCount
      );
      const formData: AuditFormData = {
        monthlySent: data.monthlySent,
        beneficiaryType: data.beneficiaryType!,
        isMarried: data.isMarried || false,
        childrenCount: data.childrenCount,
        annualIncome: data.annualIncome,
      };
      onComplete({ ...result, eligible: true }, formData);
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

  return (
    <section
      id="smart-audit"
      className="relative min-h-screen flex items-center justify-center py-20 px-4"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Smart<span className="gradient-text">Audit</span>
          </h2>
          <p className="text-zinc-400">Simulation personnalisée en 5 étapes</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Étape {step} sur {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="glass rounded-2xl p-6 sm:p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {/* Step 1: Monthly Amount */}
              {step === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Euro className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Montant envoyé par mois ?
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-5xl sm:text-6xl font-bold gradient-text">
                        {formatCurrency(data.monthlySent)}
                      </span>
                      <span className="text-zinc-400 block mt-2">par mois</span>
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
                      className="w-full"
                    />

                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>50€</span>
                      <span>2 000€</span>
                    </div>

                    <p className="text-sm text-zinc-500 text-center">
                      Soit{" "}
                      <span className="text-primary-400 font-semibold">
                        {formatCurrency(data.monthlySent * 12)}
                      </span>{" "}
                      par an en déduction potentielle
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Beneficiary Type */}
              {step === 2 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-400" />
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
                      },
                      {
                        type: "children" as BeneficiaryType,
                        label: "Enfants",
                        icon: Baby,
                        desc: "Descendants directs",
                      },
                      {
                        type: "siblings" as BeneficiaryType,
                        label: "Frères / Sœurs / Oncles",
                        icon: Heart,
                        desc: "Collatéraux",
                      },
                    ].map(({ type, label, icon: Icon, desc }) => (
                      <button
                        key={type}
                        onClick={() => setData({ ...data, beneficiaryType: type })}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          data.beneficiaryType === type
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-600 hover:border-dark-500 bg-dark-700/50"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            data.beneficiaryType === type
                              ? "bg-primary-500/20"
                              : "bg-dark-600"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              data.beneficiaryType === type
                                ? "text-primary-400"
                                : "text-zinc-400"
                            }`}
                          />
                        </div>
                        <div>
                          <span
                            className={`font-medium block ${
                              data.beneficiaryType === type
                                ? "text-white"
                                : "text-zinc-300"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-sm text-zinc-500">{desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {data.beneficiaryType === "siblings" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                          {checkEligibility("siblings").message}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Marital Status */}
              {step === 3 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Situation familiale ?
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: false, label: "Célibataire" },
                      { value: true, label: "Marié ou Pacsé" },
                    ].map(({ value, label }) => (
                      <button
                        key={String(value)}
                        onClick={() => setData({ ...data, isMarried: value })}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          data.isMarried === value
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-600 hover:border-dark-500 bg-dark-700/50"
                        }`}
                      >
                        <span
                          className={`font-medium text-lg ${
                            data.isMarried === value ? "text-white" : "text-zinc-300"
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-zinc-500 text-center mt-6">
                    Cette information permet de calculer votre quotient familial
                  </p>
                </div>
              )}

              {/* Step 4: Children Count */}
              {step === 4 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Baby className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Nombre d&apos;enfants à charge ?
                    </h3>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() =>
                        setData({
                          ...data,
                          childrenCount: Math.max(0, data.childrenCount - 1),
                        })
                      }
                      disabled={data.childrenCount === 0}
                      className="w-14 h-14 rounded-xl bg-dark-600 hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      -
                    </button>

                    <div className="text-center min-w-[100px]">
                      <span className="text-5xl font-bold gradient-text">
                        {data.childrenCount}
                      </span>
                      <span className="text-zinc-400 block mt-1">
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
                      className="w-14 h-14 rounded-xl bg-dark-600 hover:bg-dark-500 flex items-center justify-center text-2xl font-bold text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm text-zinc-500 text-center mt-6">
                    Parts fiscales:{" "}
                    <span className="text-primary-400 font-semibold">
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
              )}

              {/* Step 5: Annual Income */}
              {step === 5 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {data.isMarried
                        ? "Revenu net annuel total du foyer ?"
                        : "Revenu net annuel ?"}
                    </h3>
                  </div>

                  {data.isMarried && (
                    <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                      <p className="text-sm text-primary-200 text-center">
                        Additionnez vos deux revenus pour un calcul de tranche exact.
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
                        className="w-full px-6 py-4 text-3xl font-bold text-center bg-dark-700 border-2 border-dark-600 rounded-xl focus:border-primary-500 focus:outline-none text-white placeholder-zinc-600 transition-colors"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
                        €
                      </span>
                    </div>

                    <p className="text-sm text-zinc-500 text-center">
                      {data.isMarried
                        ? "Revenus nets imposables cumulés du couple"
                        : "Revenu net imposable (avant déductions)"}
                    </p>

                    {/* Quick Select */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {(data.isMarried
                        ? [50000, 70000, 100000, 150000]
                        : [25000, 35000, 50000, 75000]
                      ).map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setData({ ...data, annualIncome: amount })}
                          className={`px-4 py-2 rounded-lg text-sm transition-all ${
                            data.annualIncome === amount
                              ? "bg-primary-500/20 text-primary-400 border border-primary-500/50"
                              : "bg-dark-600 text-zinc-400 hover:bg-dark-500"
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-600">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
            >
              {step === 5 ? "Calculer mon gain" : "Continuer"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
