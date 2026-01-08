"use client";

import { ArrowRight, TrendingUp, Receipt, Wallet } from "lucide-react";

interface HeroProps {
  onStartAudit: () => void;
}

export default function Hero({ onStartAudit }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12 bg-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="animate-fadeIn">
            {/* Badge */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                  En moyenne <span className="text-white font-bold">450 €</span> récupérés
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-4">
              <span className="block text-white">Vous envoyez de l&apos;argent</span>
              <span className="block text-white">à vos parents ?</span>
              <span className="block gradient-text">C&apos;est déductible.</span>
            </h1>

            {/* Pain Point */}
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 sm:mb-8">
              <span className="text-white/60">Vous perdez </span>
              <span className="text-emerald-400 font-bold">450€/an</span>
              <span className="text-white/60"> en ne le déclarant pas.</span>
            </p>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
              <span className="text-white/80 font-medium">Vos transferts + vos frais</span> = déductibles de vos impôts.{" "}
              <span className="text-emerald-400 font-medium">Kivio compile tout en un dossier prêt à déclarer.</span>
            </p>

            {/* CTA Button */}
            <div className="space-y-3">
              <button
                onClick={onStartAudit}
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base rounded-xl transition-colors w-full sm:w-auto"
              >
                Estimer mon gain en 30 secondes
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-white/30">Gratuit, sans inscription</p>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-white/40">
              {["100% légal", "Taux BCE officiel", "Art. 205-208 Code civil"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Simple Dashboard Preview - Hidden on mobile for performance */}
          <div className="hidden lg:block relative">
            <div className="relative w-full max-w-[500px] mx-auto">
              {/* Simple Dashboard Card */}
              <div className="rounded-2xl overflow-hidden bg-[#111] border border-white/10">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1.5 bg-[#1a1a1a] rounded text-xs text-white/40">kivio.fr</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-[#0a0a0a]">
                  {/* Total */}
                  <div className="mb-6">
                    <p className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Économie totale</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">450</span>
                      <span className="text-3xl font-bold text-emerald-400">€</span>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-24 mb-6 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                    <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,70 C100,50 200,30 300,15 L400,10 L400,80 L0,80 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M0,70 C100,50 200,30 300,15 L400,10"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Reçus", value: "24", icon: Receipt },
                      { label: "Envoyé", value: "3 600€", icon: Wallet },
                      { label: "TMI", value: "30%", icon: TrendingUp },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <stat.icon className="w-4 h-4 text-emerald-400/60" />
                          <p className="text-[10px] text-white/40 font-medium uppercase">{stat.label}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
