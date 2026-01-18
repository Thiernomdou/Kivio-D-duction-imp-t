"use client";

import Link from "next/link";
import {
  Camera,
  Calculator,
  FileText,
  Check,
  Star,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Mail,
  Scale,
  ClipboardCheck,
  ShieldCheck,
  Quote,
} from "lucide-react";
import Hero from "./Hero";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import BackgroundEffect from "./BackgroundEffect";
import { useTheme } from "@/contexts/ThemeContext";

interface LandingPageProps {
  onStartAudit: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

// Section: Preuve de Valeur
function ValueProofSection({ isLight }: { isLight: boolean }) {
  return (
    <section className={`relative py-16 sm:py-24 px-4 ${isLight ? 'bg-white/50' : 'bg-black/50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Ne laissez plus d&apos;argent{" "}
            <span className="gradient-text">sur la table</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Bloc 1 */}
          <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Le constat</h3>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
              <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>90% des gens</span> ne déclarent pas l&apos;aide envoyée à leurs parents. Ils ignorent les frais de transfert déductibles.
            </p>
          </div>

          {/* Bloc 2 */}
          <div className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>La solution</h3>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Uploadez vos reçus</span>, Kivio calcule automatiquement et génère un <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>PDF prêt pour les impôts</span>.
            </p>
          </div>

          {/* Bloc 3 */}
          <div className={`p-5 sm:p-6 rounded-2xl border-2 border-accent-purple/50 ${isLight ? 'bg-white shadow-sm' : 'bg-[#111]/80'}`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-accent-purple mb-3">Le résultat</h3>
            <p className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Déduction supplémentaire moyenne :
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-accent-purple">+120 €</p>
            <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>par déclaration en ajoutant les frais d&apos;envoi</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section: Comment ça marche
function HowItWorksSection({ isLight }: { isLight: boolean }) {
  const steps = [
    {
      step: 1,
      icon: Camera,
      title: "Uploadez vos reçus",
      description: "Prenez en photo vos reçus Wave, Orange Money, Western Union... Kivio reconnaît automatiquement les montants.",
      highlight: "Tous vos transferts au même endroit",
      color: "blue",
    },
    {
      step: 2,
      icon: Calculator,
      title: "Calcul automatique",
      description: "Kivio additionne vos envois + les frais et applique le taux BCE officiel.",
      highlight: "Montants + Frais + Taux BCE",
      color: "purple",
    },
    {
      step: 3,
      icon: FileText,
      title: "Téléchargez votre PDF",
      description: "Recevez un PDF avec le montant exact à déclarer (case 6GU).",
      highlight: "Prêt pour les impôts",
      color: "emerald",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", badge: isLight ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", badge: isLight ? "bg-purple-500/10 text-purple-600 border-purple-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    emerald: { bg: "bg-accent-purple/10", text: "text-accent-purple", badge: isLight ? "bg-accent-purple/10 text-accent-purple border-accent-purple/30" : "bg-accent-purple/20 text-accent-purple/80 border-accent-purple/30" },
  };

  return (
    <section id="how-it-works" className={`relative py-16 sm:py-24 px-4 ${isLight ? 'bg-gray-50/80' : 'bg-[#050505]/80'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Comment <span className="gradient-text">ça marche</span> ?
          </h2>
          <p className={`text-base sm:text-lg ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
            3 étapes simples pour récupérer votre argent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((item) => {
            const colors = colorClasses[item.color as keyof typeof colorClasses];
            return (
              <div key={item.step} className={`relative p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-black bg-accent-purple">
                  {item.step}
                </div>

                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} strokeWidth={1.5} />
                </div>

                <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed mb-4 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>{item.description}</p>

                <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${colors.badge} text-xs font-medium`}>
                  <Check className="w-3 h-3 mr-1.5" />
                  {item.highlight}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-accent-purple/10 border border-accent-purple/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent-purple" />
            <span className="text-accent-purple font-medium text-sm sm:text-base">
              Un PDF prêt à déclarer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section: Crédibilité Juridique
function LegalCredibilitySection({ isLight }: { isLight: boolean }) {
  const legalCards = [
    {
      icon: Scale,
      title: "Obligation alimentaire",
      subtitle: "Art. 205-207 Code civil",
      description: "La loi française reconnaît l'obligation d'aider ses parents dans le besoin.",
      color: "blue",
    },
    {
      icon: ClipboardCheck,
      title: "Déduction fiscale",
      subtitle: "Sans plafond légal",
      description: "L'aide versée à vos ascendants est déductible si elle correspond à leurs besoins.",
      color: "purple",
    },
    {
      icon: ShieldCheck,
      title: "Dossier conforme",
      subtitle: "Prêt en cas de contrôle",
      description: "Kivio génère un dossier avec taux BCE officiel pour la case 6GU.",
      color: "emerald",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
    emerald: { bg: "bg-accent-purple/10", text: "text-accent-purple" },
  };

  return (
    <section className={`relative py-16 sm:py-24 px-4 ${isLight ? 'bg-white/50' : 'bg-black/50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-accent-purple" />
            <span className="text-accent-purple text-xs sm:text-sm font-medium">Conformité garantie</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Pourquoi c&apos;est <span className="gradient-text">100% légal</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {legalCards.map((card) => {
            const colors = colorClasses[card.color as keyof typeof colorClasses];
            return (
              <div key={card.title} className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} strokeWidth={1.5} />
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{card.title}</h3>
                <p className={`text-xs sm:text-sm ${colors.text} font-medium mb-3`}>{card.subtitle}</p>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Section: Tarification
function PricingSection({ onStartAudit, isLight }: { onStartAudit: () => void; isLight: boolean }) {
  return (
    <section id="pricing" className={`relative py-16 sm:py-24 px-4 ${isLight ? 'bg-gray-50/80' : 'bg-black/50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-2xl sm:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Tarification <span className="gradient-text">transparente</span>
          </h2>
          <p className={`text-base sm:text-lg ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
            Stockez gratuitement. Payez uniquement pour le dossier fiscal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Accès libre</span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>Gratuit</h3>
            <p className={`mb-6 text-sm ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Gérez vos reçus toute l&apos;année</p>

            <div className="mb-6">
              <span className={`text-5xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>0</span>
              <span className={`text-xl font-bold ml-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>€</span>
            </div>

            <ul className="space-y-3 mb-6">
              {["Enregistrement illimité", "Estimation en temps réel", "Archivage 3 ans"].map((feature) => (
                <li key={feature} className={`flex items-start gap-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isLight ? 'text-gray-400' : 'text-gray-500'}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={onStartAudit}
              className={`w-full py-3 px-6 rounded-xl border font-semibold transition-colors text-sm sm:text-base ${isLight ? 'border-gray-300 text-gray-900 hover:bg-gray-50' : 'border-white/20 text-white hover:bg-white/5'}`}
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Premium Plan */}
          <div className={`relative p-6 sm:p-8 rounded-3xl border-2 border-accent-purple/50 ${isLight ? 'bg-white shadow-sm' : 'bg-[#111]/80'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-accent-purple text-black text-xs sm:text-sm font-bold">
                Recommandé
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-xs text-accent-purple font-medium">Pack Déclaration</span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>Premium</h3>
            <p className={`mb-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Dossier complet pour contrôle fiscal</p>

            <div className="mb-4">
              <span className={`text-5xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>49</span>
              <span className={`text-xl font-bold ml-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>€</span>
              <span className={`ml-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>/ déclaration</span>
            </div>

            <ul className="space-y-3 mb-6">
              {["Rapport PDF certifié", "Taux BCE + frais", "Attestations légales", "Conservé 3 ans"].map((feature) => (
                <li key={feature} className={`flex items-start gap-2 text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  <Check className="w-4 h-4 text-accent-purple mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={onStartAudit}
              className="w-full py-3 px-6 rounded-xl bg-accent-purple hover:bg-accent-purple/80 text-black font-bold transition-colors text-sm sm:text-base"
            >
              Créer mon dossier fiscal
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section: Témoignages
function TestimonialsSection({ isLight }: { isLight: boolean }) {
  const testimonials = [
    {
      name: "Amadou",
      location: "Montreuil (93)",
      content: "J'avais jamais pensé que c'était déductible. Ça fait 5 ans que j'envoie à Dakar. Résultat : 450€ de moins sur mes impôts.",
      rating: 5,
      savings: "450€",
    },
    {
      name: "Mariama",
      location: "Villeurbanne (69)",
      content: "Je galérais à calculer avec les taux de change. Là c'est simple : je scanne, ça calcule. Je mets directement sur ma déclaration et je garde mon justificatif.",
      rating: 5,
      savings: "380€",
    },
    {
      name: "Ousmane",
      location: "Toulouse (31)",
      content: "Au début j'étais sceptique. Mais c'est vraiment légal, j'ai vérifié avec un ami avocat. Maintenant je récupère sur mes impôts.",
      rating: 5,
      savings: "290€",
    },
  ];

  return (
    <section className={`relative py-16 sm:py-24 px-4 ${isLight ? 'bg-white/50' : 'bg-[#050505]/80'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Ils ont <span className="gradient-text">récupéré leur argent</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className={`p-5 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
              <Quote className={`w-6 h-6 sm:w-8 sm:h-8 mb-3 ${isLight ? 'text-accent-purple/30' : 'text-accent-purple/20'}`} />
              <p className={`text-sm mb-4 leading-relaxed italic ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className={`pt-4 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`font-semibold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{testimonial.name}</p>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>{testimonial.location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 inline-block">
                  <span className="text-accent-purple font-bold text-xs">{testimonial.savings} économisés</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className={`mt-12 grid grid-cols-3 gap-3 max-w-xl mx-auto p-4 sm:p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#111]/80 border-white/10'}`}>
          {[
            { value: "500+", label: "Dossiers" },
            { value: "450€", label: "Économie moy." },
            { value: "10 min", label: "Temps moyen" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</p>
              <p className={`text-[10px] sm:text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer({ onStartAudit, isLight }: { onStartAudit: () => void; isLight: boolean }) {
  return (
    <footer className={`relative py-12 sm:py-16 px-4 ${isLight ? 'bg-gray-50' : 'bg-black/80'}`}>
      <div className="max-w-6xl mx-auto">
        {/* CTA */}
        <div className={`text-center mb-12 pb-12 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className={`text-xl sm:text-3xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Prêt à récupérer <span className="gradient-text">votre argent</span> ?
          </h2>
          <p className={`mb-6 max-w-md mx-auto text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
            Créez votre dossier fiscal en quelques minutes.
          </p>
          <button
            onClick={onStartAudit}
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-accent-purple hover:bg-accent-purple/80 text-black font-semibold rounded-xl transition-colors text-sm sm:text-base"
          >
            Créer mon dossier gratuitement
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className={`flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-purple" />
              Stockage gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-accent-purple" />
              Sans carte bancaire
            </span>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2">
            <Logo size="md" />
            <p className={`mt-4 max-w-sm text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-600'}`}>
              Kivio aide les contribuables français à déduire légalement l&apos;aide financière envoyée à leurs proches.
            </p>
            <a
              href="mailto:contact.kivio@gmail.com"
              className={`flex items-center gap-2 transition-colors text-xs sm:text-sm mt-4 ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}
            >
              <Mail className="w-4 h-4" />
              contact.kivio@gmail.com
            </a>
          </div>

          <div>
            <h4 className={`font-semibold mb-3 text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Produit</h4>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className={`text-xs sm:text-sm ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}>Comment ça marche</a></li>
              <li><a href="#pricing" className={`text-xs sm:text-sm ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}>Tarifs</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-3 text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className={`text-xs sm:text-sm ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}>Mentions légales</Link></li>
              <li><Link href="/confidentialite" className={`text-xs sm:text-sm ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}>Confidentialité</Link></li>
              <li><Link href="/cgu" className={`text-xs sm:text-sm ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-white'}`}>CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className={`pt-6 border-t text-center ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-700'}`}>© {new Date().getFullYear()} Kivio. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onStartAudit, onSignIn, onSignUp }: LandingPageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="relative min-h-screen">
      {/* Fond style Finary */}
      <BackgroundEffect />

      {/* Header - pas de blur sur mobile pour performance */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b ${isLight ? 'bg-white/95 sm:bg-white/80 sm:backdrop-blur-xl border-gray-200' : 'bg-black/95 sm:bg-black/60 sm:backdrop-blur-xl border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Logo size="md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={onSignIn}
                type="button"
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors active:opacity-70 ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                Connexion
              </button>
              <button
                onClick={onSignUp}
                type="button"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 active:bg-accent-purple/70 transition-colors rounded-lg"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="relative z-10">
        <Hero onStartAudit={onStartAudit} />
        <ValueProofSection isLight={isLight} />
        <HowItWorksSection isLight={isLight} />
        <LegalCredibilitySection isLight={isLight} />
        <PricingSection onStartAudit={onStartAudit} isLight={isLight} />
        <TestimonialsSection isLight={isLight} />
        <Footer onStartAudit={onStartAudit} isLight={isLight} />
      </div>
    </div>
  );
}
