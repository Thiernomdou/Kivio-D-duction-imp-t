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
import { useTheme } from "@/contexts/ThemeContext";

interface LandingPageProps {
  onStartAudit: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

// Section: Preuve de Valeur
function ValueProofSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ne laissez plus d&apos;argent{" "}
            <span className="gradient-text">sur la table</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Bloc 1 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-400 mb-3">Le constat</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              <span className="text-white font-semibold">90% des gens</span> ne déclarent pas l&apos;aide envoyée à leurs parents. Ils ignorent les frais de transfert déductibles.
            </p>
          </div>

          {/* Bloc 2 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">La solution</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-white font-semibold">Uploadez vos reçus</span>, Kivio calcule automatiquement et génère un <span className="text-white font-semibold">PDF prêt pour les impôts</span>.
            </p>
          </div>

          {/* Bloc 3 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111] border-2 border-accent-purple/50">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-accent-purple mb-3">Le résultat</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Déduction supplémentaire moyenne :
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-accent-purple">+120 €</p>
            <p className="text-xs text-gray-500 mt-1">par déclaration</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section: Comment ça marche
function HowItWorksSection() {
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
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    emerald: { bg: "bg-accent-purple/10", text: "text-accent-purple", badge: "bg-accent-purple/20 text-accent-purple/80 border-accent-purple/30" },
  };

  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 px-4 bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Comment <span className="gradient-text">ça marche</span> ?
          </h2>
          <p className="text-base sm:text-lg text-gray-500">
            3 étapes simples pour récupérer votre argent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((item) => {
            const colors = colorClasses[item.color as keyof typeof colorClasses];
            return (
              <div key={item.step} className="relative p-5 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-black bg-accent-purple">
                  {item.step}
                </div>

                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} strokeWidth={1.5} />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>

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
function LegalCredibilitySection() {
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
    <section className="relative py-16 sm:py-24 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-accent-purple" />
            <span className="text-accent-purple text-xs sm:text-sm font-medium">Conformité garantie</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Pourquoi c&apos;est <span className="gradient-text">100% légal</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {legalCards.map((card) => {
            const colors = colorClasses[card.color as keyof typeof colorClasses];
            return (
              <div key={card.title} className="p-5 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{card.title}</h3>
                <p className={`text-xs sm:text-sm ${colors.text} font-medium mb-3`}>{card.subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Section: Tarification
function PricingSection({ onStartAudit }: { onStartAudit: () => void }) {
  return (
    <section id="pricing" className="relative py-16 sm:py-24 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Tarification <span className="gradient-text">transparente</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500">
            Stockez gratuitement. Payez uniquement pour le dossier fiscal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111] border border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-400 font-medium">Accès libre</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Gratuit</h3>
            <p className="text-gray-500 mb-6 text-sm">Gérez vos reçus toute l&apos;année</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-white">0</span>
              <span className="text-xl font-bold text-white ml-1">€</span>
            </div>

            <ul className="space-y-3 mb-6">
              {["Enregistrement illimité", "Estimation en temps réel", "Archivage 3 ans"].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-gray-400 text-sm">
                  <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={onStartAudit}
              className="w-full py-3 px-6 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors text-sm sm:text-base"
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Premium Plan */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-[#111] border-2 border-accent-purple/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-accent-purple text-black text-xs sm:text-sm font-bold">
                Recommandé
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-xs text-accent-purple font-medium">Pack Déclaration</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Premium</h3>
            <p className="text-gray-500 mb-4 text-sm">Dossier complet pour contrôle fiscal</p>

            <div className="mb-4">
              <span className="text-5xl font-bold text-white">49</span>
              <span className="text-xl font-bold text-white ml-1">€</span>
              <span className="text-gray-500 ml-2 text-sm">/ déclaration</span>
            </div>

            {/* ROI */}
            <div className="p-3 rounded-xl bg-accent-purple/5 border border-accent-purple/20 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">49€</span>
                <ArrowRight className="w-4 h-4 text-accent-purple" />
                <span className="text-accent-purple font-bold">~450€</span>
              </div>
              <p className="text-center text-xs text-accent-purple font-semibold mt-2">ROI : x9</p>
            </div>

            <ul className="space-y-3 mb-6">
              {["Rapport PDF certifié", "Taux BCE + frais", "Attestations légales", "Conservé 3 ans"].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-white text-sm">
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
function TestimonialsSection() {
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
    <section className="relative py-16 sm:py-24 px-4 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ils ont <span className="gradient-text">récupéré leur argent</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="p-5 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-accent-purple/20 mb-3" />
              <p className="text-sm text-gray-400 mb-4 leading-relaxed italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-600">{testimonial.location}</p>
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
        <div className="mt-12 grid grid-cols-3 gap-3 max-w-xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#111] border border-white/10">
          {[
            { value: "500+", label: "Dossiers" },
            { value: "450€", label: "Économie moy." },
            { value: "10 min", label: "Temps moyen" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer({ onStartAudit }: { onStartAudit: () => void }) {
  return (
    <footer className="relative py-12 sm:py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        {/* CTA */}
        <div className="text-center mb-12 pb-12 border-b border-white/10">
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">
            Prêt à récupérer <span className="gradient-text">votre argent</span> ?
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
            Créez votre dossier fiscal en quelques minutes.
          </p>
          <button
            onClick={onStartAudit}
            className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-accent-purple hover:bg-accent-purple/80 text-black font-semibold rounded-xl transition-colors text-sm sm:text-base"
          >
            Créer mon dossier gratuitement
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-gray-500">
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
            <p className="text-gray-600 mt-4 max-w-sm text-xs sm:text-sm">
              Kivio aide les contribuables français à déduire légalement l&apos;aide financière envoyée à leurs proches.
            </p>
            <a
              href="mailto:contact.kivio@gmail.com"
              className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors text-xs sm:text-sm mt-4"
            >
              <Mail className="w-4 h-4" />
              contact.kivio@gmail.com
            </a>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Produit</h4>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="text-gray-600 hover:text-white text-xs sm:text-sm">Comment ça marche</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-white text-xs sm:text-sm">Tarifs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="text-gray-600 hover:text-white text-xs sm:text-sm">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="text-gray-600 hover:text-white text-xs sm:text-sm">Confidentialité</Link></li>
              <li><Link href="/cgu" className="text-gray-600 hover:text-white text-xs sm:text-sm">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-gray-700 text-xs">© {new Date().getFullYear()} Kivio. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onStartAudit, onSignIn, onSignUp }: LandingPageProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className={isLight ? "bg-slate-50" : "bg-black"}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${isLight ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Logo size="md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={onSignIn}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                Connexion
              </button>
              <button
                onClick={onSignUp}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-accent-purple hover:bg-accent-purple/80 transition-colors rounded-lg"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </header>

      <Hero onStartAudit={onStartAudit} />
      <ValueProofSection />
      <HowItWorksSection />
      <LegalCredibilitySection />
      <PricingSection onStartAudit={onStartAudit} />
      <TestimonialsSection />
      <Footer onStartAudit={onStartAudit} />
    </div>
  );
}
