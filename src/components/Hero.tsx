"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScanLine, TrendingUp, Receipt, Wallet, Bell, Wifi, Battery, Signal } from "lucide-react";

interface HeroProps {
  onStartAudit: () => void;
}

export default function Hero({ onStartAudit }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12">
      {/* Background pur noir */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[800px] lg:h-[800px] bg-emerald-500/[0.04] rounded-full blur-[100px] sm:blur-[150px] lg:blur-[200px]" />
        <div className="absolute bottom-0 right-0 sm:right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] bg-blue-500/[0.04] rounded-full blur-[100px] sm:blur-[150px] lg:blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Badge - Plus visible, au-dessus du titre */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mb-4 sm:mb-6"
            >
              <div
                className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-emerald-500/30"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
                  boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
                }}
              >
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wide">
                  En moyenne <span className="text-white font-bold">450 €</span> récupérés
                </span>
              </div>
            </motion.div>

            {/* Main Heading - 3 lignes exactement */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[1.5rem] sm:text-[2.5rem] lg:text-[3.25rem] font-semibold tracking-[-0.03em] leading-[1.2] mb-4"
            >
              <span className="block text-white sm:whitespace-nowrap">Vous envoyez de l&apos;argent</span>
              <span className="block text-white sm:whitespace-nowrap">à vos parents ?</span>
              <span className="block sm:whitespace-nowrap gradient-text">
                C&apos;est déductible.
              </span>
            </motion.h1>

            {/* Pain Point - Accroche émotionnelle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-[1.125rem] sm:text-[1.5rem] lg:text-[1.75rem] font-semibold mb-8"
            >
              <span className="text-white/60">Vous perdez </span>
              <span className="text-emerald-400 font-bold">450€/an</span>
              <span className="text-white/60"> en ne le déclarant pas.</span>
            </motion.p>

            {/* Subtitle - Solution claire */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-[1.0625rem] sm:text-[1.125rem] text-white/50 leading-relaxed mb-10 max-w-lg font-normal tracking-[-0.01em]"
            >
              <span className="text-white/80 font-medium">Vos transferts + vos frais</span> = déductibles de vos impôts.{" "}
              <span className="text-emerald-400 font-medium">Kivio compile tout en un dossier prêt à déclarer.</span>
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <button
                  onClick={onStartAudit}
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-[1.0625rem] rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
                  style={{
                    boxShadow: "0 0 60px rgba(16, 185, 129, 0.25), 0 0 100px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  Estimer mon gain en 30 secondes
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-xs text-white/30">Gratuit, sans inscription</p>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-6 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-[13px] text-white/30"
            >
              {["100% légal", "Taux BCE officiel", "Art. 205-208 Code civil"].map((text) => (
                <span key={text} className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Device Mockups - Visible sur tous les écrans */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end items-center lg:pr-4 mt-8 lg:mt-0"
          >
            {/* Glow behind devices */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 rounded-[4rem] blur-3xl scale-150" />

            {/* MacBook Pro Mockup - Visible sur tous les écrans */}
            <div className="relative w-full max-w-[320px] sm:max-w-[450px] lg:max-w-[580px]">
              {/* MacBook Screen */}
              <div
                className="relative rounded-t-[1rem] overflow-hidden"
                style={{
                  background: "#1a1a1a",
                  boxShadow: "0 -2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1a] rounded-b-full z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] border border-[#333]" />
                </div>

                {/* Screen bezel */}
                <div className="p-2 pt-3 bg-[#0a0a0a]">
                  {/* Browser window */}
                  <div className="rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/[0.08]">
                    {/* Browser Header */}
                    <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-3 bg-[#0f0f0f] border-b border-white/[0.06]">
                      <div className="flex gap-1 sm:gap-1.5">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#28CA41]" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-1 sm:gap-2 bg-[#252525] rounded px-2 py-1 sm:px-3 sm:py-1.5 max-w-[180px] sm:max-w-[280px] w-full">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-[8px] sm:text-[11px] text-white/40 font-medium truncate">kivio.fr</span>
                        </div>
                      </div>
                      <div className="w-6 sm:w-12" />
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-2 sm:p-4 lg:p-6 min-h-[180px] sm:min-h-[260px] lg:min-h-[340px] bg-[#0a0a0a]">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-6 lg:mb-8">
                        <div>
                          <p className="text-white/40 text-[8px] sm:text-[10px] lg:text-xs font-medium mb-0.5 uppercase tracking-wider">Économie totale</p>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">450</span>
                            <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-emerald-400">€</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="px-2 py-1 lg:px-3 lg:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-emerald-400 text-xs lg:text-sm font-medium flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                              +12%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="relative h-16 sm:h-24 lg:h-32 mb-3 sm:mb-4 lg:mb-6 bg-white/[0.02] rounded-lg lg:rounded-xl p-2 lg:p-4 border border-white/[0.04]">
                        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#34D399" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,70 C30,65 60,55 100,45 C140,35 180,28 220,22 C260,16 300,12 340,10 C370,8 400,8 400,8 L400,80 L0,80 Z"
                            fill="url(#chartGradient3)"
                          />
                          <path
                            d="M0,70 C30,65 60,55 100,45 C140,35 180,28 220,22 C260,16 300,12 340,10 C370,8 400,8 400,8"
                            fill="none"
                            stroke="url(#lineGradient3)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="400" cy="8" r="3" fill="#10B981" />
                        </svg>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3">
                        {[
                          { label: "Reçus", value: "24", icon: Receipt },
                          { label: "Envoyé", value: "3 600€", icon: Wallet },
                          { label: "TMI", value: "30%", icon: TrendingUp },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-white/[0.02] rounded-lg lg:rounded-xl p-1.5 sm:p-2.5 lg:p-4 border border-white/[0.04]">
                            <div className="flex items-center gap-1 mb-0.5 sm:mb-1 lg:mb-2">
                              <stat.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-emerald-400/60" />
                              <p className="text-[6px] sm:text-[8px] lg:text-[10px] text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
                            </div>
                            <p className="text-xs sm:text-base lg:text-xl font-bold text-white">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MacBook Body/Base */}
              <div
                className="h-4 rounded-b-xl"
                style={{
                  background: "linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%)",
                }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="w-16 h-1 rounded-full bg-[#3a3a3a]" />
                </div>
              </div>

              {/* MacBook Base Shadow/Stand */}
              <div
                className="h-2 mx-8 rounded-b-lg"
                style={{
                  background: "linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)",
                }}
              />

              {/* iPhone Pro Mockup - Visible sur tous les écrans */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
                className="absolute -bottom-2 -left-2 sm:-left-4 lg:-left-6 w-[100px] sm:w-[130px] lg:w-[170px]"
              >
                {/* iPhone Frame */}
                <div
                  className="rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] p-[1px] sm:p-[2px] overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #4a4a4a 0%, #1a1a1a 50%, #3a3a3a 100%)",
                    boxShadow: "0 15px 30px -8px rgba(0,0,0,0.9), 0 0 40px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  {/* iPhone Inner bezel */}
                  <div className="bg-black rounded-[1.15rem] sm:rounded-[1.4rem] lg:rounded-[1.9rem] overflow-hidden">
                    {/* Status Bar - Caché sur petits écrans */}
                    <div className="hidden sm:flex items-center justify-between px-3 sm:px-5 pt-1 sm:pt-2 pb-0.5">
                      <span className="text-[7px] sm:text-[9px] text-white font-semibold">9:41</span>
                      <div className="flex items-center gap-0.5">
                        <Signal className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        <Wifi className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                        <Battery className="w-3 h-2 sm:w-4 sm:h-2.5 text-white" />
                      </div>
                    </div>

                    {/* Dynamic Island - Simplifié sur mobile */}
                    <div className="flex justify-center py-1 sm:pb-2">
                      <div className="w-12 h-3 sm:w-20 sm:h-6 bg-black rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-[#1a1a1a] border border-[#333]" />
                      </div>
                    </div>

                    {/* iPhone Content */}
                    <div className="px-1.5 sm:px-3 pb-2 sm:pb-4">
                      <div className="hidden sm:flex items-center justify-between mb-3">
                        <p className="text-[10px] sm:text-xs text-white font-semibold">Mon suivi</p>
                        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/40" />
                      </div>

                      {/* Scan Button */}
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg sm:rounded-xl p-1.5 sm:p-3 mb-1.5 sm:mb-3"
                        style={{
                          boxShadow: "0 4px 15px -4px rgba(16, 185, 129, 0.6)",
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <ScanLine className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                          <span className="font-bold text-black text-[8px] sm:text-xs">Scanner</span>
                        </div>
                      </div>

                      {/* Transfers - Simplifié sur petit écran */}
                      <div className="space-y-1 sm:space-y-2">
                        {[
                          { name: "Tap Tap", amount: "150€", color: "#8B5CF6" },
                          { name: "Wave", amount: "200€", color: "#3B82F6" },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between bg-white/[0.05] rounded-md sm:rounded-lg p-1 sm:p-2.5 border border-white/[0.06]"
                          >
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div
                                className="w-4 h-4 sm:w-7 sm:h-7 rounded sm:rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                <div
                                  className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                              <span className="text-[7px] sm:text-[10px] text-white font-semibold">{item.name}</span>
                            </div>
                            <span className="text-[8px] sm:text-xs text-emerald-400 font-bold">{item.amount}</span>
                          </div>
                        ))}
                      </div>

                      {/* Home Indicator */}
                      <div className="flex justify-center mt-2 sm:mt-4">
                        <div className="w-12 sm:w-24 h-0.5 sm:h-1 bg-white/30 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
