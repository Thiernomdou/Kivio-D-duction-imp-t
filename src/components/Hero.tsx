"use client";

import { ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface HeroProps {
  onStartAudit: () => void;
}

export default function Hero({ onStartAudit }: HeroProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden pt-20 pb-8 sm:pb-12 ${isLight ? 'bg-slate-50' : 'bg-black'}`}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-3">
            <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>Vous envoyez de l&apos;argent</span>
            <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>à vos parents ?</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold mb-6">
            <span className={isLight ? 'text-gray-600' : 'text-white/70'}>Récupérez jusqu&apos;à </span>
            <span className="gradient-text font-bold">450€</span>
            <span className={isLight ? 'text-gray-600' : 'text-white/70'}> sur vos impôts.</span>
          </p>

          <div className="relative mb-5">
            <FinaryMockupMobile isLight={isLight} />
          </div>

          {/* Steps - Mobile */}
          <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm mb-5 ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-[10px] font-bold flex items-center justify-center">1</span>
              Uploadez vos reçus
            </span>
            <span className="text-accent-purple">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-[10px] font-bold flex items-center justify-center">2</span>
              On calcule
            </span>
            <span className="text-accent-purple">•</span>
            <span className="text-accent-purple font-medium">Frais inclus</span>
          </div>

          <button
            onClick={onStartAudit}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-purple active:bg-accent-purple/80 text-white font-semibold text-sm rounded-xl mb-3"
          >
            Calculer ma réduction
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className={`text-xs mb-5 text-center ${isLight ? 'text-gray-500' : 'text-white/30'}`}>Gratuit • Sans inscription • 30 secondes</p>

          <div className={`flex flex-wrap justify-center gap-3 text-xs ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
            {["100% légal", "Taux BCE officiel", "Art. 205-208"].map((text) => (
              <span key={text} className="flex items-center gap-1">
                <svg className="w-3 h-3 text-accent-purple" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-4">
              <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>Vous envoyez de l&apos;argent</span>
              <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>à vos parents ?</span>
            </h1>

            <p className="text-3xl font-semibold mb-8">
              <span className={isLight ? 'text-gray-600' : 'text-white/70'}>Récupérez jusqu&apos;à </span>
              <span className="gradient-text font-bold">450€</span>
              <span className={isLight ? 'text-gray-600' : 'text-white/70'}> sur vos impôts.</span>
            </p>

            {/* Steps */}
            <div className={`flex items-center gap-6 mb-8 ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-sm">Uploadez vos reçus</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm">On calcule votre réduction</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-purple" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-accent-purple font-medium">Frais d&apos;envoi inclus</span>
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={onStartAudit}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent-purple hover:bg-accent-purple/80 text-white font-semibold text-base rounded-xl transition-colors"
              >
                Calculer ma réduction
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-white/30'}`}>Gratuit • Sans inscription • 30 secondes</p>
            </div>

            <div className={`mt-8 flex flex-wrap items-center gap-6 text-sm ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
              {["100% légal", "Taux BCE officiel", "Art. 205-208 Code civil"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-accent-purple/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex justify-end items-center">
            <FinaryMockupDesktop isLight={isLight} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Mobile version
function FinaryMockupMobile({ isLight }: { isLight: boolean }) {
  return (
    <div className="relative h-[360px] sm:h-[400px]" style={{ overflow: "visible" }}>
      {/* Desktop app window - même positionnement que desktop */}
      <div
        className="absolute top-0 rounded-xl overflow-hidden"
        style={{
          left: "0",
          right: "0",
          height: "300px",
          background: isLight ? "#ffffff" : "#0a0a0a",
          boxShadow: isLight ? "0 15px 40px -8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)" : "0 15px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
          border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.12)"
        }}
      >
        {/* Window controls */}
        <div className={`flex items-center gap-1.5 px-3 py-2.5 border-b ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-[#0a0a0a]'}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#dea123]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]" />
        </div>

        <div className="flex" style={{ height: "calc(100% - 32px)" }}>
          {/* Sidebar */}
          <div className={`w-16 sm:w-20 p-2 border-r ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-[#0a0a0a]'}`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br from-accent-purple to-accent-pink mb-3" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex items-center gap-1 px-1 py-1 rounded mb-0.5 ${i === 1 ? (isLight ? 'bg-gray-200' : 'bg-white/5') : ''}`}>
                <div className={`w-2 h-2 rounded-sm ${i === 1 ? 'bg-accent-purple' : (isLight ? 'bg-gray-300' : 'bg-white/20')}`} />
              </div>
            ))}
          </div>
          {/* Content */}
          <div className={`flex-1 p-2.5 sm:p-3 ${isLight ? 'bg-white' : 'bg-[#0d0d0d]'}`}>
            <p className={`text-[7px] sm:text-[8px] mb-0.5 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Économie fiscale</p>
            <p className={`text-xl sm:text-2xl font-bold mb-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>450 €</p>
            <p className="text-[7px] sm:text-[8px] text-green-500 mb-3">+12,5%</p>
            {/* Chart */}
            <div className="h-16 sm:h-20 mb-2">
              <svg className="w-full h-full" viewBox="0 0 100 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mobileGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,40 Q12,36 25,31 T50,22 T75,14 T100,6 L100,45 L0,45 Z" fill="url(#mobileGrad)"/>
                <path d="M0,40 Q12,36 25,31 T50,22 T75,14 T100,6" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="flex gap-1 mb-2">
              {["7J", "1M", "1A"].map((p, i) => (
                <span key={p} className={`text-[6px] sm:text-[7px] px-2 py-1 rounded ${i === 0 ? 'bg-accent-purple text-white' : (isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-white/40')}`}>{p}</span>
              ))}
            </div>
            <div className="flex gap-1.5">
              {["Wave", "Tap Tap"].map((name) => (
                <div key={name} className={`flex-1 flex items-center gap-1.5 p-2 rounded-lg ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-white/5 border border-white/5'}`}>
                  <div className="w-3.5 h-3.5 rounded bg-accent-purple/30" />
                  <span className={`text-[7px] ${isLight ? 'text-gray-700' : 'text-white'}`}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* iPhone - foreground left - blanc en mode clair */}
      <div
        className="absolute bottom-0 z-10"
        style={{
          left: "0",
          width: "125px",
          filter: isLight ? "drop-shadow(0 15px 30px rgba(0,0,0,0.2))" : "drop-shadow(0 15px 30px rgba(0,0,0,0.5))"
        }}
      >
        <div
          className="rounded-[24px] p-[2px]"
          style={{ background: isLight ? "linear-gradient(145deg, #e0e0e0 0%, #c0c0c0 50%, #d0d0d0 100%)" : "linear-gradient(145deg, #4a4a4a 0%, #1a1a1a 50%, #3a3a3a 100%)" }}
        >
          <div
            className={`rounded-[22px] overflow-hidden ${isLight ? 'bg-white' : 'bg-black'}`}
            style={{ aspectRatio: "125/270" }}
          >
            {/* Dynamic Island */}
            <div className={`h-8 flex justify-center pt-2 relative ${isLight ? 'bg-white' : 'bg-black'}`}>
              <span className={`absolute left-3 top-1.5 text-[8px] font-semibold ${isLight ? 'text-black' : 'text-white'}`}>9:41</span>
              <div className={`w-16 h-5 rounded-full ${isLight ? 'bg-black' : 'bg-black border border-[#333]'}`} />
              <div className={`absolute right-3 top-2 w-3.5 h-2 rounded-sm ${isLight ? 'bg-black' : 'bg-white'}`} />
            </div>
            {/* Content */}
            <div className={`px-2.5 pb-3 ${isLight ? 'bg-white' : 'bg-black'}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold">K</span>
                </div>
                <div>
                  <span className={`text-[8px] font-semibold ${isLight ? 'text-black' : 'text-white'} block`}>Scanner reçu</span>
                  <span className={`text-[6px] ${isLight ? 'text-gray-500' : 'text-white/40'}`}>Wave</span>
                </div>
              </div>
              {/* Amount */}
              <div className={`rounded-xl p-2 mb-2 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-[#111] border border-white/5'}`}>
                <p className={`text-[6px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Montant du transfert</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold gradient-text">150</span>
                  <span className={`text-[9px] ml-0.5 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>EUR</span>
                </div>
                <div className={`flex justify-between mt-1.5 pt-1.5 ${isLight ? 'border-t border-gray-200' : 'border-t border-white/5'}`}>
                  <span className={`text-[6px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Solde</span>
                  <span className={`text-[7px] ${isLight ? 'text-black' : 'text-white'}`}>500 €</span>
                </div>
              </div>
              {/* Percent buttons */}
              <div className="flex gap-0.5 mb-2">
                {["25%", "50%", "75%", "100%"].map((p, i) => (
                  <div key={p} className={`flex-1 py-1 rounded text-center text-[6px] ${i === 1 ? 'bg-accent-purple text-white' : isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-white/50'}`}>{p}</div>
                ))}
              </div>
              {/* Numpad */}
              <div className="grid grid-cols-3">
                {[1,2,3,4,5,6,7,8,9].map((n) => (
                  <div key={n} className={`py-1.5 text-center text-sm ${isLight ? 'text-gray-700' : 'text-white/70'}`}>{n}</div>
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <div className={`w-16 h-0.5 rounded-full ${isLight ? 'bg-black/20' : 'bg-white/20'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop version - exactement comme Finary
function FinaryMockupDesktop({ isLight }: { isLight: boolean }) {
  return (
    <div className="relative" style={{ width: "700px", height: "520px", overflow: "visible" }}>
      {/* Desktop app window */}
      <div
        className="absolute top-0 rounded-2xl overflow-hidden"
        style={{
          left: "0",
          width: "620px",
          height: "460px",
          background: isLight ? "#ffffff" : "#0a0a0a",
          boxShadow: isLight ? "0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)" : "0 25px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)",
          border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.15)"
        }}
      >
        {/* Window controls */}
        <div className={`flex items-center gap-2 px-5 py-3.5 border-b ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-[#0a0a0a]'}`}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>
        </div>

        <div className="flex" style={{ height: "calc(100% - 44px)" }}>
          {/* Sidebar */}
          <div className={`w-[170px] p-4 border-r ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-[#0a0a0a]'}`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink" />
              <span className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Kivio</span>
            </div>
            {["Synthèse", "Patrimoine", "Analyse", "Documents"].map((item, i) => (
              <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 ${i === 0 ? (isLight ? 'bg-gray-200' : 'bg-white/5') : ''}`}>
                <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-accent-purple' : (isLight ? 'bg-gray-300' : 'bg-white/20')}`} />
                <span className={`text-xs ${i === 0 ? (isLight ? 'text-gray-900' : 'text-white') : (isLight ? 'text-gray-500' : 'text-white/40')}`}>{item}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className={`flex-1 p-5 ${isLight ? 'bg-white' : 'bg-[#0d0d0d]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Économie fiscale</span>
              <div className="flex gap-1">
                <span className="text-[10px] px-2.5 py-1 rounded bg-accent-purple text-white">Valeur</span>
                <span className={`text-[10px] px-2.5 py-1 rounded ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-white/40'}`}>Perf.</span>
              </div>
            </div>

            <p className={`text-4xl font-bold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>450 €</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-green-500">+45 €</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-500">+12,5%</span>
            </div>

            {/* Chart area */}
            <div className="h-24 mb-3">
              <svg className="w-full h-full" viewBox="0 0 320 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 Q40,55 80,48 T160,35 T240,20 T320,8 L320,70 L0,70 Z" fill="url(#chartGrad)"/>
                <path d="M0,60 Q40,55 80,48 T160,35 T240,20 T320,8" fill="none" stroke="#a855f7" strokeWidth="2"/>
              </svg>
            </div>

            {/* Period buttons */}
            <div className="flex gap-1.5 mb-4">
              {["7J", "1M", "1A", "YTD", "TOUT"].map((p, i) => (
                <span key={p} className={`text-[10px] px-3 py-1.5 rounded ${i === 0 ? 'bg-accent-purple text-white' : (isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-white/40')}`}>{p}</span>
              ))}
            </div>

            {/* Performance cards */}
            <p className={`text-[10px] mb-2 ${isLight ? 'text-gray-500' : 'text-white/40'}`}>Performance</p>
            <div className="flex gap-3">
              {[
                { name: "Wave Transfer", pct: "+18%", amount: "2 450 €", color: "bg-blue-500/20" },
                { name: "Tap Tap Send", pct: "+12%", amount: "1 890 €", color: "bg-accent-purple/20" },
              ].map((item, i) => (
                <div key={i} className={`flex-1 rounded-xl p-3 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-white/[0.02] border border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-lg ${item.color}`} />
                    <span className={`text-xs ${isLight ? 'text-gray-700' : 'text-white'}`}>{item.name}</span>
                  </div>
                  <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.amount}</p>
                  <span className="text-xs text-green-500">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* iPhone - premier plan - blanc en mode clair */}
      <div
        className="absolute bottom-0 z-10"
        style={{
          left: "0",
          width: "170px",
          filter: isLight ? "drop-shadow(0 25px 50px rgba(0,0,0,0.2))" : "drop-shadow(0 25px 50px rgba(0,0,0,0.5))"
        }}
      >
        <div
          className="rounded-[32px] p-[2px]"
          style={{ background: isLight ? "linear-gradient(145deg, #e0e0e0 0%, #c0c0c0 50%, #d0d0d0 100%)" : "linear-gradient(145deg, #4a4a4a 0%, #1a1a1a 50%, #3a3a3a 100%)" }}
        >
          <div
            className={`rounded-[30px] overflow-hidden ${isLight ? 'bg-white' : 'bg-black'}`}
            style={{ aspectRatio: "170/368" }}
          >
            {/* Status bar + Dynamic Island */}
            <div className={`h-10 flex justify-center pt-2 relative ${isLight ? 'bg-white' : 'bg-black'}`}>
              <span className={`absolute left-4 top-1.5 text-[10px] font-semibold ${isLight ? 'text-black' : 'text-white'}`}>9:41</span>
              <div className={`w-20 h-6 rounded-full ${isLight ? 'bg-black' : 'bg-black border border-[#333]'}`} />
              <div className="absolute right-4 top-2 flex items-center gap-1">
                <div className={`w-4 h-2 rounded-sm ${isLight ? 'bg-black' : 'bg-white'}`} />
              </div>
            </div>

            {/* App content */}
            <div className={`px-3 pb-4 ${isLight ? 'bg-white' : 'bg-black'}`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">K</span>
                </div>
                <div>
                  <span className={`text-[11px] font-semibold ${isLight ? 'text-black' : 'text-white'} block`}>Scanner reçu</span>
                  <span className={`text-[8px] ${isLight ? 'text-gray-500' : 'text-white/40'}`}>Wave</span>
                </div>
              </div>

              {/* Amount card */}
              <div className={`rounded-xl p-2.5 mb-2.5 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-[#111] border border-white/5'}`}>
                <p className={`text-[8px] mb-0.5 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Montant du transfert</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold gradient-text">150</span>
                  <span className={`text-sm ml-1 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>EUR</span>
                </div>
                <div className={`flex justify-between items-center mt-2 pt-1.5 ${isLight ? 'border-t border-gray-200' : 'border-t border-white/5'}`}>
                  <span className={`text-[8px] ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Solde</span>
                  <span className={`text-[10px] ${isLight ? 'text-black' : 'text-white'}`}>500 €</span>
                </div>
              </div>

              {/* Percentage buttons */}
              <div className="flex gap-1 mb-3">
                {["25%", "50%", "75%", "100%"].map((p, i) => (
                  <div key={p} className={`flex-1 py-1.5 rounded-md text-center text-[9px] font-medium ${i === 1 ? 'bg-accent-purple text-white' : isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-white/50'}`}>{p}</div>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-y-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((n) => (
                  <div key={n} className={`py-2 text-center text-lg font-light ${isLight ? 'text-gray-700' : 'text-white/70'}`}>{n}</div>
                ))}
              </div>

              {/* Home indicator */}
              <div className="flex justify-center mt-3">
                <div className={`w-24 h-1 rounded-full ${isLight ? 'bg-black/20' : 'bg-white/20'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -right-[2px] top-20 w-[2px] h-8 rounded-r bg-[#3a3a3a]" />
        <div className="absolute -left-[2px] top-14 w-[2px] h-4 rounded-l bg-[#3a3a3a]" />
        <div className="absolute -left-[2px] top-24 w-[2px] h-8 rounded-l bg-[#3a3a3a]" />
      </div>
    </div>
  );
}
