"use client";

import { ArrowRight, TrendingUp, Receipt, Wallet } from "lucide-react";
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
        {/* Mobile Layout - Optimisé pour performance */}
        <div className="lg:hidden">
          {/* Badge */}
          <div className="mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border border-accent-purple/30 ${isLight ? 'bg-accent-purple/5' : 'bg-accent-purple/10'}`}>
              <span className="w-2 h-2 rounded-full bg-accent-purple" />
              <span className="text-xs text-accent-purple font-semibold">
                En moyenne <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>450 €</span> récupérés
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-6">
            <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>Vous envoyez de l&apos;argent</span>
            <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>à vos parents ?</span>
            <span className="block gradient-text">C&apos;est déductible.</span>
          </h1>

          {/* Mockup Simple Mobile */}
          <div className="relative mb-4">
            <SimpleMobileMockup isLight={isLight} />
          </div>

          {/* Bouton CTA juste en dessous des mockups */}
          <button
            onClick={onStartAudit}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-purple active:bg-accent-purple/80 text-white font-semibold text-sm rounded-xl mb-4"
          >
            Estimer mon gain en 30 secondes
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className={`text-xs mb-6 text-center ${isLight ? 'text-gray-500' : 'text-white/30'}`}>Gratuit, sans inscription</p>

          {/* Rest of content */}
          <div>
            <p className="text-base font-semibold mb-4">
              <span className={isLight ? 'text-gray-600' : 'text-white/60'}>Vous perdez </span>
              <span className="text-accent-purple font-bold">450€/an</span>
              <span className={isLight ? 'text-gray-600' : 'text-white/60'}> en ne le déclarant pas.</span>
            </p>

            <p className={`text-sm leading-relaxed mb-5 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
              <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-white/80'}`}>Vos transferts + vos frais</span> = déductibles de vos impôts.{" "}
              <span className="text-accent-purple font-medium">Kivio compile tout en un dossier prêt à déclarer.</span>
            </p>

            <div className={`flex flex-wrap gap-3 text-xs ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
              {["100% légal", "Taux BCE", "Art. 205-208"].map((text) => (
                <span key={text} className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-accent-purple" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mb-6">
              <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-accent-purple/30 ${isLight ? 'bg-accent-purple/5' : 'bg-accent-purple/10'}`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-purple"></span>
                </span>
                <span className="text-sm text-accent-purple font-semibold">
                  En moyenne <span className={`font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>450 €</span> récupérés
                </span>
              </div>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-4">
              <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>Vous envoyez de l&apos;argent</span>
              <span className={`block ${isLight ? 'text-gray-900' : 'text-white'}`}>à vos parents ?</span>
              <span className="block gradient-text">C&apos;est déductible.</span>
            </h1>

            <p className="text-2xl font-semibold mb-8">
              <span className={isLight ? 'text-gray-600' : 'text-white/60'}>Vous perdez </span>
              <span className="text-accent-purple font-bold">450€/an</span>
              <span className={isLight ? 'text-gray-600' : 'text-white/60'}> en ne le déclarant pas.</span>
            </p>

            <p className={`text-lg leading-relaxed mb-8 max-w-lg ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
              <span className={`font-medium ${isLight ? 'text-gray-700' : 'text-white/80'}`}>Vos transferts + vos frais</span> = déductibles de vos impôts.{" "}
              <span className="text-accent-purple font-medium">Kivio compile tout en un dossier prêt à déclarer.</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={onStartAudit}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent-purple hover:bg-accent-purple/80 text-white font-semibold text-base rounded-xl transition-colors"
              >
                Estimer mon gain en 30 secondes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-white/30'}`}>Gratuit, sans inscription</p>
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

          <div className="relative flex justify-end items-center py-4">
            <DesktopMockups isLight={isLight} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Version réaliste pour mobile - design Apple authentique sans effets lourds
function SimpleMobileMockup({ isLight = false }: { isLight?: boolean }) {
  // Couleurs selon le mode
  const colors = isLight ? {
    macFrame: "linear-gradient(180deg, #e5e5e5 0%, #d4d4d4 100%)",
    macBorder: "#c4c4c4",
    screenBg: "#ffffff",
    browserBar: "#f5f5f5",
    browserBorder: "rgba(0,0,0,0.1)",
    urlBg: "#ffffff",
    urlBorder: "rgba(0,0,0,0.1)",
    urlText: "#666",
    chartBg: "#f8f8f8",
    chartBorder: "rgba(0,0,0,0.05)",
    statBg: "#f5f5f5",
    statBorder: "rgba(0,0,0,0.05)",
    labelText: "#666",
    valueText: "#1a1a1a",
    hinge: "linear-gradient(180deg, #d4d4d4 0%, #c4c4c4 50%, #b4b4b4 100%)",
    base: "linear-gradient(180deg, #d4d4d4 0%, #c4c4c4 100%)",
    trackpad: "#aaa",
    iphoneFrame: "linear-gradient(145deg, #e5e5e5 0%, #d4d4d4 50%, #c4c4c4 100%)",
    iphoneBg: "#ffffff",
    iphoneBorder: "#ddd",
    dynamicIsland: "#1a1a1a",
    statusText: "#1a1a1a",
    batteryBg: "#1a1a1a",
    cardBg: "rgba(0,0,0,0.03)",
    cardBorder: "rgba(0,0,0,0.08)",
    itemText: "#333",
    homeIndicator: "rgba(0,0,0,0.2)",
  } : {
    macFrame: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
    macBorder: "#3a3a3a",
    screenBg: "#0a0a0a",
    browserBar: "#161616",
    browserBorder: "rgba(255,255,255,0.05)",
    urlBg: "#0a0a0a",
    urlBorder: "rgba(255,255,255,0.1)",
    urlText: "rgba(255,255,255,0.5)",
    chartBg: "#111",
    chartBorder: "rgba(255,255,255,0.05)",
    statBg: "#111",
    statBorder: "rgba(255,255,255,0.05)",
    labelText: "rgba(255,255,255,0.4)",
    valueText: "#fff",
    hinge: "linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)",
    base: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
    trackpad: "#555",
    iphoneFrame: "linear-gradient(145deg, #8a8a8a 0%, #5a5a5a 50%, #4a4a4a 100%)",
    iphoneBg: "#000",
    iphoneBorder: "#333",
    dynamicIsland: "#000",
    statusText: "#fff",
    batteryBg: "#fff",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.08)",
    itemText: "rgba(255,255,255,0.8)",
    homeIndicator: "rgba(255,255,255,0.3)",
  };

  return (
    <div className="flex justify-center items-end gap-2 sm:gap-4">
      {/* MacBook Pro réaliste */}
      <div className="w-[220px] sm:w-[280px]">
        {/* Écran */}
        <div
          className="rounded-t-xl overflow-hidden"
          style={{
            background: colors.macFrame,
            border: `2px solid ${colors.macBorder}`,
            borderBottom: "none",
          }}
        >
          {/* Bezel supérieur avec caméra */}
          <div className={`h-3 sm:h-4 flex items-center justify-center ${isLight ? 'bg-gray-200' : 'bg-black'}`}>
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLight ? 'bg-gray-300 border-gray-400' : 'bg-[#1a1a1a] border-[#333]'} border`} />
          </div>

          {/* Contenu écran */}
          <div style={{ background: colors.screenBg }}>
            {/* Browser bar */}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2" style={{ background: colors.browserBar, borderBottom: `1px solid ${colors.browserBorder}` }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 sm:px-4 py-0.5 sm:py-1 rounded-md" style={{ background: colors.urlBg, border: `1px solid ${colors.urlBorder}` }}>
                  <span className="text-[8px] sm:text-[10px]" style={{ color: colors.urlText }}>kivio.fr</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-3 sm:p-4">
              <p className="text-[8px] sm:text-[10px] mb-1" style={{ color: colors.labelText }}>Économie totale</p>
              <div className="flex items-baseline gap-0.5 mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl font-bold gradient-text">450</span>
                <span className="text-xl sm:text-2xl font-bold gradient-text">€</span>
              </div>

              {/* Mini chart réaliste */}
              <div className="h-10 sm:h-12 mb-3 sm:mb-4 rounded-lg p-2" style={{ background: colors.chartBg, border: `1px solid ${colors.chartBorder}` }}>
                <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,20 Q15,18 30,14 T60,10 T100,4 L100,24 L0,24 Z" fill="url(#chartGradientMobile)"/>
                  <path d="M0,20 Q15,18 30,14 T60,10 T100,4" fill="none" stroke="#a855f7" strokeWidth="2"/>
                </svg>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { label: "Reçus", value: "24" },
                  { label: "Envoyé", value: "3 600€" },
                  { label: "TMI", value: "30%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg p-1.5 sm:p-2" style={{ background: colors.statBg, border: `1px solid ${colors.statBorder}` }}>
                    <p className="text-[6px] sm:text-[8px]" style={{ color: colors.labelText }}>{stat.label}</p>
                    <p className="text-[10px] sm:text-xs font-bold" style={{ color: colors.valueText }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charnière MacBook */}
        <div
          className="h-1.5 sm:h-2 mx-1"
          style={{
            background: colors.hinge,
            borderRadius: "0 0 2px 2px",
          }}
        />

        {/* Base MacBook */}
        <div
          className="h-2 sm:h-3 rounded-b-lg"
          style={{
            background: colors.base,
          }}
        >
          {/* Encoche trackpad */}
          <div className="flex justify-center pt-0.5">
            <div className="w-8 sm:w-12 h-0.5 rounded-full" style={{ background: colors.trackpad }} />
          </div>
        </div>
      </div>

      {/* iPhone 15 Pro réaliste */}
      <div className="relative w-[75px] sm:w-[95px] -ml-4 sm:-ml-6 mb-2 sm:mb-4">
        {/* Cadre titane */}
        <div
          className="rounded-[16px] sm:rounded-[20px] p-[2px] sm:p-[3px]"
          style={{
            background: colors.iphoneFrame,
          }}
        >
          {/* Écran */}
          <div
            className="rounded-[14px] sm:rounded-[17px] overflow-hidden"
            style={{
              background: colors.iphoneBg,
              border: `1px solid ${colors.iphoneBorder}`,
            }}
          >
            {/* Status bar avec Dynamic Island */}
            <div className="h-6 sm:h-8 flex items-start justify-center pt-1 sm:pt-1.5 relative" style={{ background: colors.screenBg }}>
              {/* Dynamic Island */}
              <div
                className="w-16 sm:w-20 h-4 sm:h-5 rounded-full flex items-center justify-center gap-1.5 sm:gap-2"
                style={{ background: colors.dynamicIsland, border: `1px solid ${isLight ? '#ccc' : '#222'}` }}
              >
                {/* Caméra */}
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLight ? 'bg-gray-700' : 'bg-[#1a1a2e]'} border ${isLight ? 'border-gray-600' : 'border-[#333]'}`}>
                  <div className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full ${isLight ? 'bg-gray-500' : 'bg-[#1e3a5f]'} m-auto mt-0.5`} />
                </div>
              </div>
              {/* Heure */}
              <span className="absolute left-2 top-1 text-[6px] sm:text-[8px] font-medium" style={{ color: colors.statusText }}>9:41</span>
              {/* Indicateurs */}
              <div className="absolute right-2 top-1 flex items-center gap-0.5">
                <div className="w-2.5 sm:w-3 h-1 sm:h-1.5 rounded-sm" style={{ background: colors.batteryBg }} />
              </div>
            </div>

            {/* Contenu app */}
            <div className="px-2 sm:px-2.5 pb-2 sm:pb-3" style={{ background: colors.screenBg }}>
              {/* Bouton scanner */}
              <div
                className="rounded-xl sm:rounded-2xl p-2 sm:p-2.5 mb-2 sm:mb-2.5"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                }}
              >
                <p className="text-[8px] sm:text-[10px] font-bold text-white text-center">Scanner un reçu</p>
              </div>

              {/* Transactions */}
              {[
                { name: "Wave", amount: "+200€", color: "#3b82f6" },
                { name: "Tap Tap", amount: "+150€", color: "#f59e0b" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg p-1.5 sm:p-2 mb-1 sm:mb-1.5"
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-medium" style={{ color: colors.itemText }}>{item.name}</span>
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-accent-purple font-bold">{item.amount}</span>
                </div>
              ))}

              {/* Home indicator */}
              <div className="flex justify-center mt-2 sm:mt-3 pt-1">
                <div className="w-8 sm:w-10 h-0.5 sm:h-1 rounded-full" style={{ background: colors.homeIndicator }} />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons latéraux iPhone */}
        <div className={`absolute -right-[1px] top-12 sm:top-16 w-[2px] h-5 sm:h-6 rounded-r ${isLight ? 'bg-gray-300' : 'bg-[#5a5a5a]'}`} />
        <div className={`absolute -left-[1px] top-10 sm:top-12 w-[2px] h-3 sm:h-4 rounded-l ${isLight ? 'bg-gray-300' : 'bg-[#5a5a5a]'}`} />
        <div className={`absolute -left-[1px] top-16 sm:top-20 w-[2px] h-5 sm:h-6 rounded-l ${isLight ? 'bg-gray-300' : 'bg-[#5a5a5a]'}`} />
      </div>
    </div>
  );
}

// Version complète pour desktop avec effets
function DesktopMockups({ isLight = false }: { isLight?: boolean }) {
  // Couleurs selon le mode
  const colors = isLight ? {
    shadow: "rgba(0,0,0,0.15)",
    macFrame: "linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 50%, #e0e0e0 100%)",
    screenBg: "#ffffff",
    notchBg: "#f5f5f5",
    notchInner: "#e0e0e0",
    cameraBg: "#ffffff",
    cameraBorder: "#d0d0d0",
    browserBg: "#f5f5f5",
    browserBorder: "rgba(0,0,0,0.08)",
    urlBg: "#ffffff",
    urlBorder: "rgba(0,0,0,0.1)",
    urlText: "#666",
    dashboardBg: "linear-gradient(to bottom, #fafafa, #ffffff)",
    labelText: "#888",
    valueText: "#1a1a1a",
    chartBg: "rgba(0,0,0,0.02)",
    chartBorder: "rgba(0,0,0,0.05)",
    statBg: "rgba(0,0,0,0.02)",
    statBorder: "rgba(0,0,0,0.05)",
    hingeBg: "linear-gradient(to bottom, #d0d0d0, #c0c0c0)",
    hingeInner: "#c0c0c0",
    baseBg: "linear-gradient(to bottom, #d0d0d0, #c0c0c0)",
    iphoneFrame: "linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 50%, #d0d0d0 100%)",
    iphoneShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
    iphoneInnerBg: "#ffffff",
    iphoneContentBg: "linear-gradient(to bottom, #fafafa, #ffffff)",
    statusText: "#1a1a1a",
    dynamicIsland: "#1a1a1a",
    appTitle: "#1a1a1a",
    dotBg: "rgba(0,0,0,0.1)",
    cardBg: "rgba(0,0,0,0.03)",
    cardBorder: "rgba(0,0,0,0.08)",
    cardText: "#333",
    homeIndicator: "rgba(0,0,0,0.2)",
  } : {
    shadow: "rgba(0,0,0,0.4)",
    macFrame: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%)",
    screenBg: "#0a0a0a",
    notchBg: "#0a0a0a",
    notchInner: "#1a1a1a",
    cameraBg: "#0a0a0a",
    cameraBorder: "#2a2a2a",
    browserBg: "#1e1e1e",
    browserBorder: "rgba(255,255,255,0.05)",
    urlBg: "#0f0f0f",
    urlBorder: "rgba(255,255,255,0.05)",
    urlText: "rgba(255,255,255,0.5)",
    dashboardBg: "linear-gradient(to bottom, #0f0f0f, #0a0a0a)",
    labelText: "rgba(255,255,255,0.4)",
    valueText: "#fff",
    chartBg: "rgba(255,255,255,0.02)",
    chartBorder: "rgba(255,255,255,0.04)",
    statBg: "rgba(255,255,255,0.03)",
    statBorder: "rgba(255,255,255,0.05)",
    hingeBg: "linear-gradient(to bottom, #3a3a3a, #1a1a1a)",
    hingeInner: "#1a1a1a",
    baseBg: "linear-gradient(to bottom, #2a2a2a, #151515)",
    iphoneFrame: "linear-gradient(135deg, #7a7a7a 0%, #3a3a3a 50%, #5a5a5a 100%)",
    iphoneShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
    iphoneInnerBg: "#000",
    iphoneContentBg: "linear-gradient(to bottom, #1a1a1a, #0d0d0d)",
    statusText: "#fff",
    dynamicIsland: "#000",
    appTitle: "rgba(255,255,255,0.9)",
    dotBg: "rgba(255,255,255,0.1)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.08)",
    cardText: "rgba(255,255,255,0.9)",
    homeIndicator: "rgba(255,255,255,0.3)",
  };

  return (
    <div className="relative w-full max-w-[600px]" style={{ perspective: "1500px" }}>
      <div className="relative" style={{ transform: "rotateY(-5deg) rotateX(2deg)", transformStyle: "preserve-3d" }}>
        {/* Shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 blur-2xl rounded-full" style={{ background: colors.shadow }} />

        {/* MacBook */}
        <div className="relative rounded-t-xl overflow-hidden" style={{ background: colors.macFrame, padding: "3px" }}>
          <div className="rounded-t-[0.7rem] overflow-hidden" style={{ background: colors.screenBg }}>
            {/* Notch */}
            <div className="relative h-6 flex items-center justify-center" style={{ background: colors.notchBg }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-xl flex items-center justify-center" style={{ background: colors.notchInner }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.cameraBg, border: `2px solid ${colors.cameraBorder}` }} />
              </div>
            </div>

            {/* Browser */}
            <div style={{ background: colors.browserBg, borderBottom: `1px solid ${colors.browserBorder}` }}>
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 rounded-md px-3 py-1.5 w-64" style={{ background: colors.urlBg, border: `1px solid ${colors.urlBorder}` }}>
                    <svg className="w-3 h-3 text-accent-purple" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px]" style={{ color: colors.urlText }}>kivio.fr/dashboard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="p-6 min-h-[320px]" style={{ background: colors.dashboardBg }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: colors.labelText }}>Économie totale</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-bold gradient-text">450</span>
                    <span className="text-4xl font-bold gradient-text">€</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
                  <span className="text-accent-purple text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />+12%
                  </span>
                </div>
              </div>

              <div className="relative h-28 mb-5 rounded-xl p-3" style={{ background: colors.chartBg, border: `1px solid ${colors.chartBorder}` }}>
                <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,65 C50,60 100,50 150,40 C200,30 250,22 300,15 C350,8 380,5 400,5 L400,80 L0,80 Z" fill="url(#cg)" />
                  <path d="M0,65 C50,60 100,50 150,40 C200,30 250,22 300,15 C350,8 380,5 400,5" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="400" cy="5" r="4" fill="#a855f7" />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Reçus", value: "24", icon: Receipt },
                  { label: "Envoyé", value: "3 600€", icon: Wallet },
                  { label: "TMI", value: "30%", icon: TrendingUp },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl p-4" style={{ background: colors.statBg, border: `1px solid ${colors.statBorder}` }}>
                    <div className="flex items-center gap-1 mb-2">
                      <stat.icon className="w-4 h-4 text-accent-purple/70" />
                      <p className="text-[10px] uppercase" style={{ color: colors.labelText }}>{stat.label}</p>
                    </div>
                    <p className="text-xl font-bold" style={{ color: colors.valueText }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hinge */}
        <div className="h-5 rounded-b-lg" style={{ background: colors.hingeBg }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-1.5 rounded-b-sm" style={{ background: colors.hingeInner }} />
        </div>
        <div className="h-4 mx-8 rounded-b-xl" style={{ background: colors.baseBg }} />
      </div>

      {/* iPhone */}
      <div className="absolute -bottom-6 -left-10 w-[160px] z-10" style={{ transform: "rotateY(5deg)" }}>
        <div className="rounded-[2rem] overflow-hidden" style={{ background: colors.iphoneFrame, padding: "2.5px", boxShadow: colors.iphoneShadow }}>
          <div className="rounded-[1.85rem] overflow-hidden" style={{ background: colors.iphoneInnerBg }}>
            <div style={{ background: colors.iphoneContentBg }}>
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-3">
                <span className="text-[11px] font-semibold" style={{ color: colors.statusText }}>9:41</span>
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[75px] h-[26px] rounded-full" style={{ background: colors.dynamicIsland }} />
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4" style={{ color: colors.statusText }}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.5 3 4 7 4 12s3.5 9 8 9c1.5 0 3-.5 4-1.5-1-.5-2-1.5-2-3 0-2 1.5-3.5 3.5-3.5.5 0 1 0 1.5.5 0-1 .5-2 .5-3.5C19.5 7 16.5 3 12 3z"/></svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold" style={{ color: colors.appTitle }}>Kivio</p>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: colors.dotBg }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                  </div>
                </div>

                <div className="rounded-2xl p-3.5 mb-3" style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)" }}>
                  <p className="font-bold text-white text-sm text-center">Scanner un reçu</p>
                </div>

                {[
                  { name: "Tap Tap", amount: "+150€", color: "#8B5CF6" },
                  { name: "Wave", amount: "+200€", color: "#06B6D4" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl p-3 mb-2" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: item.color }}>{item.name[0]}</div>
                      <span className="text-[11px]" style={{ color: colors.cardText }}>{item.name}</span>
                    </div>
                    <span className="text-xs text-accent-purple font-bold">{item.amount}</span>
                  </div>
                ))}

                <div className="flex justify-center mt-5 pb-1">
                  <div className="w-28 h-1.5 rounded-full" style={{ background: colors.homeIndicator }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
