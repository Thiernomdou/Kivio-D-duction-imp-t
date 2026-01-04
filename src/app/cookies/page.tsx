"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Politique de cookies</h1>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de votre visite sur notre site. Il permet de stocker des informations relatives à votre navigation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Cookies utilisés par Kivio</h2>

              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-emerald-400 mb-2">Cookies essentiels</h3>
                  <p className="text-sm">
                    Ces cookies sont indispensables au fonctionnement du site. Ils permettent notamment :
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>La gestion de votre session et authentification</li>
                    <li>La mémorisation de vos préférences</li>
                    <li>La sécurité de votre navigation</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">Durée : Session ou 1 an maximum</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-blue-400 mb-2">Cookies de performance</h3>
                  <p className="text-sm">
                    Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site :
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>Pages visitées et temps passé</li>
                    <li>Erreurs éventuelles rencontrées</li>
                    <li>Performance du chargement des pages</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">Durée : 13 mois maximum</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Cookies tiers</h2>
              <p>
                Kivio utilise les services suivants qui peuvent déposer des cookies :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-white">Supabase</strong> : Authentification et stockage des données</li>
                <li><strong className="text-white">Vercel</strong> : Hébergement et analytics de performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Gestion des cookies</h2>
              <p>
                Vous pouvez à tout moment gérer vos préférences en matière de cookies :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-white">Via votre navigateur</strong> : Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies</li>
                <li><strong className="text-white">Cookies essentiels</strong> : Le blocage de ces cookies peut empêcher le bon fonctionnement du site</li>
              </ul>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 text-sm">
                  <strong>Note :</strong> La désactivation des cookies essentiels peut affecter votre expérience sur Kivio (impossibilité de vous connecter, perte de vos préférences, etc.)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Comment supprimer les cookies ?</h2>
              <p>La procédure varie selon votre navigateur :</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-white">Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong className="text-white">Firefox</strong> : Options → Vie privée et sécurité → Cookies</li>
                <li><strong className="text-white">Safari</strong> : Préférences → Confidentialité → Cookies</li>
                <li><strong className="text-white">Edge</strong> : Paramètres → Cookies et autorisations de site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Contact</h2>
              <p>
                Pour toute question concernant notre politique de cookies : <a href="mailto:contact.kivio@gmail.com" className="text-emerald-400 hover:underline">contact.kivio@gmail.com</a>
              </p>
            </section>
          </div>

          <p className="mt-12 text-sm text-gray-600">
            Dernière mise à jour : Janvier 2025
          </p>
        </div>
      </main>
    </div>
  );
}
