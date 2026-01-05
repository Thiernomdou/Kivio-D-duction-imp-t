"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Camera,
  Calculator,
  FileText,
  Check,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Mail,
} from "lucide-react";
import Hero from "./Hero";
import Logo from "./Logo";

interface LandingPageProps {
  onStartAudit: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

// Gradient text style
const gradientStyle = {
  background: "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

// Section: Preuve de Valeur
function ValueProofSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Ne laissez plus d&apos;argent{" "}
            <span style={gradientStyle}>sur la table</span>
          </h2>
        </motion.div>

        {/* 3 Blocs */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Bloc 1: Le Constat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-3">Le constat</h3>
            <p className="text-gray-500 leading-relaxed">
              <span className="text-white font-semibold">90% des contribuables</span> ne déclarent pas ou oublient les frais de santé payés pour leurs parents en Afrique. Ils utilisent aussi un taux de change approximatif et ignorent les frais de transfert déductibles.
            </p>
          </motion.div>

          {/* Bloc 2: La Solution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">La solution</h3>
            <p className="text-gray-400 leading-relaxed">
              <span className="text-white font-semibold">Uploadez vos reçus</span>, Kivio calcule automatiquement : montants envoyés + frais de transfert + taux BCE officiel. Vous téléchargez un <span className="text-white font-semibold">PDF avec le montant exact</span> à déduire, prêt pour les impôts.
            </p>
          </motion.div>

          {/* Bloc 3: Le Résultat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-[#0D0D0D] border-2 border-emerald-500/50"
            style={{
              boxShadow: "0 0 40px rgba(16, 185, 129, 0.1)",
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Le résultat</h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              Déduction supplémentaire moyenne :
            </p>
            <p className="text-4xl font-bold text-emerald-400">+120 €</p>
            <p className="text-sm text-gray-500 mt-1">par déclaration</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section: Comment ça marche
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 overflow-hidden">
      <HowItWorksContent />
    </section>
  );
}

function HowItWorksContent() {
  const steps = [
    {
      step: 1,
      icon: Camera,
      title: "Uploadez vos reçus",
      description: "Prenez en photo ou importez vos reçus Wave, Orange Money, Western Union, MoneyGram... Kivio reconnaît automatiquement les montants et les frais.",
      highlight: "Tous vos transferts au même endroit",
      color: "blue",
    },
    {
      step: 2,
      icon: Calculator,
      title: "Calcul automatique",
      description: "Kivio additionne tous vos envois + les frais de transfert et applique le taux de change BCE officiel. Aucun calcul à faire, tout est automatisé.",
      highlight: "Montants + Frais + Taux BCE",
      color: "purple",
    },
    {
      step: 3,
      icon: FileText,
      title: "Téléchargez votre PDF",
      description: "Recevez un document PDF avec le montant exact à déclarer (case 6GU). Ce montant correspond précisément à tout ce que vous avez envoyé, frais d'envoi inclus.",
      highlight: "Prêt pour les impôts",
      color: "emerald",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "rgba(59, 130, 246, 0.15)",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      glow: "rgba(168, 85, 247, 0.15)",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "rgba(16, 185, 129, 0.15)",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  };

  return (
    <>
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/3 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Comment <span style={gradientStyle}>ça marche</span> ?
          </h2>
          <p className="text-lg text-gray-500">
            3 étapes simples pour récupérer votre argent
          </p>
        </motion.div>

        {/* Steps - Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((item, index) => {
            const colors = colorClasses[item.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Card */}
                <div
                  className={`relative p-6 rounded-2xl bg-[#0D0D0D] border ${colors.border} h-full transition-all duration-300 hover:scale-[1.02]`}
                  style={{
                    boxShadow: `0 0 40px ${colors.glow}`,
                  }}
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-black bg-gradient-to-br from-emerald-400 to-emerald-600"
                      style={{ boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)" }}
                    >
                      {item.step}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-5`}>
                    <item.icon className={`w-7 h-7 ${colors.text}`} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>

                  {/* Description */}
                  <p className="text-gray-500 leading-relaxed mb-4 text-sm">{item.description}</p>

                  {/* Highlight Badge */}
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${colors.badge} text-xs font-medium`}>
                    <Check className="w-3 h-3 mr-1.5" />
                    {item.highlight}
                  </div>
                </div>

                {/* Connector Arrow (mobile: hidden, desktop: between cards) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-emerald-500/50" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              Résultat : un PDF avec le montant exact de vos envois + frais, prêt à déclarer
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Section: Tarification
function PricingSection({ onStartAudit }: { onStartAudit: () => void }) {
  return (
    <section id="pricing" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Tarification <span style={gradientStyle}>transparente</span>
          </h2>
          <p className="text-lg text-gray-500">
            Stockez gratuitement toute l&apos;année. Payez uniquement pour le dossier fiscal.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl" />
            <div className="relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-6">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-xs text-gray-400 font-medium">Accès libre</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Gratuit</h3>
              <p className="text-gray-500 mb-8">Gérez vos reçus toute l&apos;année</p>

              <div className="mb-8">
                <span className="text-6xl font-bold text-white">0</span>
                <span className="text-2xl font-bold text-white ml-1">€</span>
                <span className="text-gray-500 ml-3">pour toujours</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Enregistrement illimité de reçus",
                  "Estimation en temps réel du gain",
                  "Archivage sécurisé 3 ans",
                  "Rappels avant déclaration",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onStartAudit}
                className="w-full py-4 px-6 rounded-2xl border border-white/[0.15] text-white font-semibold hover:bg-white/[0.05] transition-all duration-300"
              >
                Commencer gratuitement
              </button>
              <p className="text-center text-xs text-gray-600 mt-4">Aucune carte bancaire requise</p>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-[1px] rounded-3xl opacity-75"
              style={{
                background: "linear-gradient(145deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(16, 185, 129, 0.3) 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-30"
              style={{
                background: "linear-gradient(145deg, #10B981 0%, transparent 70%)",
              }}
            />

            <div className="relative p-8 rounded-3xl bg-[#0a0a0a] border border-emerald-500/30">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span
                  className="px-5 py-1.5 rounded-full bg-emerald-500 text-black text-sm font-bold shadow-lg"
                  style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)" }}
                >
                  Recommandé
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Pack Déclaration</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-gray-500 mb-8">Dossier complet prêt pour le fisc</p>

              <div className="mb-8">
                <span className="text-6xl font-bold text-white">49</span>
                <span className="text-2xl font-bold text-white ml-1">€</span>
                <span className="text-gray-500 ml-3">/ déclaration</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Rapport PDF certifié (case 6GU)",
                  "Calcul exact taux BCE + frais",
                  "Attestations légales incluses",
                  "Justificatifs lien de parenté",
                  "Support prioritaire",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-white">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onStartAudit}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.35)",
                }}
              >
                Générer mon dossier
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                ROI moyen : <span className="text-emerald-400 font-semibold">+400 € net</span>
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// Section: Avis
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Mamadou D.",
      role: "Ingénieur IT, Paris",
      content: "J'envoie 300€/mois à mes parents au Sénégal depuis 5 ans. Kivio m'a fait récupérer 450€ sur ma dernière déclaration. Le dossier était parfait.",
      rating: 5,
      savings: "450€",
    },
    {
      name: "Fatou S.",
      role: "Infirmière, Lyon",
      content: "Simple et efficace. J'ai uploadé mes reçus Wave, en 10 minutes j'avais mon PDF. Les impôts ont validé sans poser de question.",
      rating: 5,
      savings: "320€",
    },
    {
      name: "Ibrahima K.",
      role: "Comptable, Marseille",
      content: "En tant que comptable, j'étais sceptique. Leur calcul est irréprochable : taux BCE, frais inclus, attestations conformes. Je recommande à tous mes clients.",
      rating: 5,
      savings: "580€",
    },
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0D0D] border border-white/10 mb-6">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-gray-400 text-sm">+500 utilisateurs satisfaits</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Ce qu&apos;ils en <span style={gradientStyle}>pensent</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 hover:border-white/20 transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Économisé</p>
                  <p className="text-lg font-bold text-emerald-400">{testimonial.savings}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 gap-8 max-w-md mx-auto"
        >
          {[
            { value: "500+", label: "Dossiers générés" },
            { value: "450€", label: "Économie moyenne" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold" style={gradientStyle}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Section: Footer
function Footer({ onStartAudit }: { onStartAudit: () => void }) {
  return (
    <footer className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pb-16 border-b border-white/10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à récupérer{" "}
            <span style={gradientStyle}>votre argent</span> ?
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Simulation gratuite en 30 secondes. Aucune carte bancaire requise.
          </p>
          <motion.button
            onClick={onStartAudit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-xl transition-colors"
            style={{
              boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Zap className="w-5 h-5" />
            Estimer mon gain
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="text-gray-600 mt-4 max-w-sm text-sm">
              Kivio aide les contribuables français à déduire légalement l&apos;aide financière envoyée à leurs proches à l&apos;étranger. Conformité Art. 205-208 du Code civil.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="mailto:contact.kivio@gmail.com"
                className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                contact.kivio@gmail.com
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Produit</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-gray-600 hover:text-white transition-colors text-sm">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-white transition-colors text-sm">
                  Tarifs
                </a>
              </li>
              <li>
                <button onClick={onStartAudit} className="text-gray-600 hover:text-white transition-colors text-sm">
                  Simulateur
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Légal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/mentions-legales" className="text-gray-600 hover:text-white transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-gray-600 hover:text-white transition-colors text-sm">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-gray-600 hover:text-white transition-colors text-sm">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-white transition-colors text-sm">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs">
            © {new Date().getFullYear()} Kivio. Tous droits réservés.
          </p>
          <p className="text-gray-700 text-xs">
            Simulation fiscale conforme au droit français
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onStartAudit, onSignIn, onSignUp }: LandingPageProps) {
  return (
    <div className="relative bg-black">
      {/* Header avec backdrop-blur */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              <button
                onClick={onSignIn}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Se connecter
              </button>
              <button
                onClick={onSignUp}
                className="px-4 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 transition-colors rounded-lg"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero onStartAudit={onStartAudit} />

      {/* Value Proof Section */}
      <ValueProofSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Pricing Section */}
      <PricingSection onStartAudit={onStartAudit} />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer onStartAudit={onStartAudit} />
    </div>
  );
}
