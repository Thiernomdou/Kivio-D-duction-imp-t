"use client";

import { ArrowRight, ScanLine, TrendingUp, Receipt, Wallet, Wifi, Battery, Signal } from "lucide-react";

interface HeroProps {
  onStartAudit: () => void;
}

export default function Hero({ onStartAudit }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-8 sm:pb-12 bg-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
          {/* Left: Text Content */}
          <div className="animate-fadeIn order-2 lg:order-1">
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
            <p className="text-sm sm:text-base lg:text-lg text-white/50 leading-relaxed mb-6 sm:mb-8 max-w-lg">
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

          {/* Right: Device Mockups */}
          <div className="relative flex justify-center lg:justify-end items-center order-1 lg:order-2 py-4">
            {/* Container avec perspective 3D */}
            <div
              className="relative w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[600px]"
              style={{ perspective: "1500px" }}
            >
              {/* MacBook Pro Mockup */}
              <div
                className="relative"
                style={{
                  transform: "rotateY(-5deg) rotateX(2deg)",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Ombre portée du MacBook */}
                <div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/40 blur-2xl rounded-full"
                  style={{ transform: "translateZ(-50px)" }}
                />

                {/* MacBook Screen Frame */}
                <div
                  className="relative rounded-t-[0.75rem] sm:rounded-t-[1rem] lg:rounded-t-[1.25rem] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%)",
                    padding: "3px",
                    boxShadow: "0 -1px 0 rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
                  }}
                >
                  {/* Screen Inner */}
                  <div className="rounded-t-[0.6rem] sm:rounded-t-[0.85rem] lg:rounded-t-[1.1rem] overflow-hidden bg-[#0a0a0a]">
                    {/* Camera/Notch */}
                    <div className="relative h-4 sm:h-5 lg:h-6 bg-[#0a0a0a] flex items-center justify-center">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 lg:w-24 h-4 sm:h-5 lg:h-6 bg-[#1a1a1a] rounded-b-xl flex items-center justify-center">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0a0a0a] border-2 border-[#2a2a2a]" />
                      </div>
                    </div>

                    {/* Browser Chrome */}
                    <div className="bg-[#1e1e1e] border-b border-white/5">
                      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
                        {/* Traffic lights */}
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28CA41] shadow-inner" />
                        </div>
                        {/* URL Bar */}
                        <div className="flex-1 flex justify-center">
                          <div className="flex items-center gap-2 bg-[#0f0f0f] rounded-md px-3 py-1.5 max-w-[200px] sm:max-w-[280px] w-full border border-white/5">
                            <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[9px] sm:text-[11px] text-white/50 font-medium">kivio.fr/dashboard</span>
                          </div>
                        </div>
                        <div className="w-8 sm:w-12" />
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-3 sm:p-5 lg:p-6 min-h-[180px] sm:min-h-[260px] lg:min-h-[320px] bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4 sm:mb-6">
                        <div>
                          <p className="text-white/40 text-[8px] sm:text-[10px] lg:text-xs font-medium mb-1 uppercase tracking-wider">Économie totale</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">450</span>
                            <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-emerald-400">€</span>
                          </div>
                        </div>
                        <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-emerald-400 text-[9px] sm:text-xs font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            +12%
                          </span>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="relative h-14 sm:h-20 lg:h-28 mb-4 sm:mb-5 bg-white/[0.02] rounded-lg lg:rounded-xl p-2 sm:p-3 border border-white/[0.04]">
                        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradientMac" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,65 C50,60 100,50 150,40 C200,30 250,22 300,15 C350,8 380,5 400,5 L400,80 L0,80 Z"
                            fill="url(#chartGradientMac)"
                          />
                          <path
                            d="M0,65 C50,60 100,50 150,40 C200,30 250,22 300,15 C350,8 380,5 400,5"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="400" cy="5" r="4" fill="#10B981" />
                          <circle cx="400" cy="5" r="8" fill="#10B981" fillOpacity="0.3" />
                        </svg>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: "Reçus", value: "24", icon: Receipt },
                          { label: "Envoyé", value: "3 600€", icon: Wallet },
                          { label: "TMI", value: "30%", icon: TrendingUp },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white/[0.03] rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/[0.05]">
                            <div className="flex items-center gap-1 mb-1 sm:mb-2">
                              <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400/70" />
                              <p className="text-[7px] sm:text-[9px] lg:text-[10px] text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                            </div>
                            <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Screen reflection overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(115deg, rgba(255,255,255,0.03) 0%, transparent 50%, transparent 100%)"
                      }}
                    />
                  </div>
                </div>

                {/* MacBook Bottom Bezel / Hinge */}
                <div
                  className="relative h-3 sm:h-4 lg:h-5"
                  style={{
                    background: "linear-gradient(to bottom, #3a3a3a 0%, #2a2a2a 30%, #1a1a1a 100%)",
                    borderRadius: "0 0 0.5rem 0.5rem"
                  }}
                >
                  {/* Notch/Hinge indicator */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 lg:w-36 h-1 sm:h-1.5 bg-[#1a1a1a] rounded-b-sm" />
                </div>

                {/* MacBook Base/Keyboard */}
                <div
                  className="relative h-2 sm:h-3 lg:h-4 mx-4 sm:mx-6 lg:mx-8"
                  style={{
                    background: "linear-gradient(to bottom, #2a2a2a 0%, #1f1f1f 50%, #151515 100%)",
                    borderRadius: "0 0 0.75rem 0.75rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                />
              </div>

              {/* iPhone 15 Pro Mockup - Premium Design */}
              <div
                className="absolute bottom-0 sm:-bottom-4 lg:-bottom-6 -left-2 sm:-left-6 lg:-left-10 w-[95px] sm:w-[125px] lg:w-[160px] z-10"
                style={{
                  transform: "rotateY(5deg) rotateX(-2deg)",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* iPhone Shadow - Realistic */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 rounded-[50%]"
                  style={{
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
                    filter: "blur(8px)"
                  }}
                />

                {/* iPhone Outer Frame - Titanium */}
                <div
                  className="relative rounded-[1.1rem] sm:rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #8a8a8a 0%, #5a5a5a 10%, #3d3d3d 30%, #2a2a2a 50%, #3d3d3d 70%, #5a5a5a 90%, #7a7a7a 100%)",
                    padding: "2.5px",
                    boxShadow: `
                      0 30px 60px -15px rgba(0, 0, 0, 0.7),
                      0 0 0 0.5px rgba(255,255,255,0.15),
                      inset 0 1px 1px rgba(255,255,255,0.2),
                      inset 0 -1px 1px rgba(0,0,0,0.3)
                    `
                  }}
                >
                  {/* Side Buttons - Left */}
                  <div className="absolute left-0 top-[20%] w-[2px] h-4 sm:h-5 lg:h-6 bg-gradient-to-b from-[#5a5a5a] via-[#3a3a3a] to-[#5a5a5a] rounded-r-sm" />
                  <div className="absolute left-0 top-[35%] w-[2px] h-6 sm:h-8 lg:h-10 bg-gradient-to-b from-[#5a5a5a] via-[#3a3a3a] to-[#5a5a5a] rounded-r-sm" />
                  <div className="absolute left-0 top-[52%] w-[2px] h-6 sm:h-8 lg:h-10 bg-gradient-to-b from-[#5a5a5a] via-[#3a3a3a] to-[#5a5a5a] rounded-r-sm" />

                  {/* Side Button - Right */}
                  <div className="absolute right-0 top-[30%] w-[2px] h-8 sm:h-10 lg:h-12 bg-gradient-to-b from-[#5a5a5a] via-[#3a3a3a] to-[#5a5a5a] rounded-l-sm" />

                  {/* Inner bezel */}
                  <div
                    className="rounded-[0.95rem] sm:rounded-[1.35rem] lg:rounded-[1.85rem] overflow-hidden"
                    style={{
                      background: "#000",
                      boxShadow: "inset 0 0 1px 1px rgba(0,0,0,0.8)"
                    }}
                  >
                    {/* Screen Content */}
                    <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
                      {/* Status Bar with Time and Icons */}
                      <div className="relative flex items-center justify-between px-4 sm:px-5 lg:px-6 pt-2 sm:pt-2.5 lg:pt-3">
                        <span className="text-[8px] sm:text-[10px] lg:text-[11px] text-white font-semibold tracking-tight">9:41</span>

                        {/* Dynamic Island */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 top-1.5 sm:top-2 w-[50px] sm:w-[60px] lg:w-[75px] h-[18px] sm:h-[22px] lg:h-[26px] bg-black rounded-full flex items-center justify-center"
                          style={{
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 0 2px rgba(0,0,0,1)"
                          }}
                        >
                          {/* Camera */}
                          <div className="absolute left-3 sm:left-4 w-[6px] sm:w-[8px] lg:w-[10px] h-[6px] sm:h-[8px] lg:h-[10px] rounded-full bg-[#1a1a2e] border border-[#2a2a3a]">
                            <div className="absolute inset-[2px] rounded-full bg-[#0a0a15]" />
                            <div className="absolute top-[1px] left-[1px] w-[2px] h-[2px] rounded-full bg-[#3a3a5a] opacity-60" />
                          </div>
                          {/* Sensors */}
                          <div className="absolute right-3 sm:right-4 flex items-center gap-1">
                            <div className="w-[4px] sm:w-[5px] lg:w-[6px] h-[4px] sm:h-[5px] lg:h-[6px] rounded-full bg-[#0d2818]" />
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Signal className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                          <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                          <div className="relative w-[18px] sm:w-[22px] lg:w-[26px] h-[9px] sm:h-[11px] lg:h-[13px]">
                            <div className="absolute inset-0 rounded-[3px] border border-white/40" />
                            <div className="absolute top-[2px] left-[2px] bottom-[2px] right-[4px] sm:right-[5px] rounded-[1.5px] bg-emerald-400" />
                            <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-[1.5px] h-[5px] bg-white/40 rounded-r-full" />
                          </div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="px-2.5 sm:px-3 lg:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 lg:pb-4">
                        {/* Mini Header */}
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <p className="text-[8px] sm:text-[10px] lg:text-xs text-white/90 font-semibold">Kivio</p>
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400" />
                          </div>
                        </div>

                        {/* Scan Button - Premium */}
                        <div
                          className="relative rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-3.5 mb-2.5 sm:mb-3 overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            boxShadow: "0 8px 24px -6px rgba(16, 185, 129, 0.6), inset 0 1px 1px rgba(255,255,255,0.2)"
                          }}
                        >
                          <div className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                            <ScanLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                            <span className="font-bold text-white text-[9px] sm:text-[11px] lg:text-sm drop-shadow-sm">Scanner</span>
                          </div>
                        </div>

                        {/* Transfers List - Premium Cards */}
                        <div className="space-y-1.5 sm:space-y-2">
                          {[
                            { name: "Tap Tap", amount: "+150€", color: "#8B5CF6", icon: "T" },
                            { name: "Wave", amount: "+200€", color: "#06B6D4", icon: "W" },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between rounded-xl p-2 sm:p-2.5 lg:p-3"
                              style={{
                                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.08)"
                              }}
                            >
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <div
                                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] lg:text-xs font-bold text-white"
                                  style={{
                                    background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                                    boxShadow: `0 2px 8px -2px ${item.color}80`
                                  }}
                                >
                                  {item.icon}
                                </div>
                                <span className="text-[8px] sm:text-[10px] lg:text-[11px] text-white/90 font-medium">{item.name}</span>
                              </div>
                              <span className="text-[9px] sm:text-[11px] lg:text-xs text-emerald-400 font-bold">{item.amount}</span>
                            </div>
                          ))}
                        </div>

                        {/* Home Indicator */}
                        <div className="flex justify-center mt-3 sm:mt-4 lg:mt-5 pb-1">
                          <div
                            className="w-20 sm:w-24 lg:w-28 h-1 sm:h-1.5 rounded-full"
                            style={{
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                            }}
                          />
                        </div>
                      </div>

                      {/* Screen Glass Reflection */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)"
                        }}
                      />
                    </div>
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
