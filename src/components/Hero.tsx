"use client";

import { motion } from "framer-motion";
import { ArrowDown, Scale, Globe, FileCheck, Zap } from "lucide-react";

interface HeroProps {
  onStartAudit: () => void;
}

export default function Hero({ onStartAudit }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-900">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-500/5 to-transparent rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span className="text-sm text-zinc-400">
            Simulateur fiscal France 2024
          </span>
        </motion.div>

        {/* Main Heading - 3 lignes */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-10 space-y-4"
        >
          <span className="text-white block">Déduisez vos envois à vos familles.</span>
          <span className="gradient-text block">Récupérez vos impôts.</span>
          <span className="text-zinc-400 block text-2xl sm:text-3xl md:text-4xl lg:text-4xl mt-4 font-semibold">
            Transformez vos reçus <span className="text-white">(Wave, Orange, YMO...)</span> en dossier <span className="text-primary-400">6GU</span>.
          </span>
        </motion.h1>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={onStartAudit}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 glow-green hover:glow-green-strong"
          >
            <Zap className="w-5 h-5" />
            Estimer mon gain en 30s
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>

        {/* Trust Badges - Section de réassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white">Conformité fiscale</span>
              <p className="text-xs text-zinc-500">Art. 205-208</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white">Taux officiels BCE</span>
              <p className="text-xs text-zinc-500">Mis à jour quotidiennement</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-primary-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white">Dossier prêt à l&apos;envoi</span>
              <p className="text-xs text-zinc-500">PDF certifié</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
