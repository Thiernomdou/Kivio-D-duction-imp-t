"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function CGU() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Conditions Générales d&apos;Utilisation</h1>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation du service Kivio, une plateforme de simulation et d&apos;aide à la déclaration fiscale pour les personnes envoyant de l&apos;argent à leurs proches à l&apos;étranger.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description du service</h2>
              <p>Kivio propose :</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-white">Service gratuit</strong> : Enregistrement illimité de reçus, estimation en temps réel du gain fiscal, archivage sécurisé pendant 3 ans, rappels avant déclaration</li>
                <li><strong className="text-white">Service premium (49€)</strong> : Rapport PDF certifié pour la case 6GU, calcul exact avec taux BCE et frais, attestations légales, support prioritaire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Inscription</h2>
              <p>
                L&apos;utilisation du service nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Utilisation du service</h2>
              <p>L&apos;utilisateur s&apos;engage à :</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Utiliser le service conformément à sa finalité</li>
                <li>Fournir des informations exactes et vérifiables</li>
                <li>Ne pas utiliser le service à des fins frauduleuses</li>
                <li>Respecter la législation fiscale française</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Base légale des calculs</h2>
              <p>
                Les calculs de déduction fiscale sont basés sur les <strong className="text-white">articles 205 à 208 du Code civil</strong> relatifs à l&apos;obligation alimentaire. Les taux de change utilisés sont les taux officiels de la <strong className="text-white">Banque Centrale Européenne (BCE)</strong>.
              </p>
              <p className="mt-4">
                Kivio est un outil d&apos;aide à la déclaration et ne se substitue pas à un conseil fiscal professionnel. L&apos;utilisateur reste seul responsable de sa déclaration d&apos;impôts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Tarification</h2>
              <p>
                Le service de base est gratuit. Le Pack Déclaration est facturé <strong className="text-white">49€ par déclaration</strong>. Le paiement est effectué de manière sécurisée via notre prestataire de paiement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des éléments du service (design, textes, algorithmes, etc.) sont la propriété exclusive de Kivio. Toute reproduction est interdite sans autorisation préalable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Limitation de responsabilité</h2>
              <p>
                Kivio met tout en œuvre pour fournir des calculs précis. Toutefois, Kivio ne saurait être tenu responsable :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Des erreurs de saisie de l&apos;utilisateur</li>
                <li>Des modifications de la législation fiscale</li>
                <li>Des décisions de l&apos;administration fiscale</li>
                <li>Des interruptions temporaires du service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Résiliation</h2>
              <p>
                L&apos;utilisateur peut supprimer son compte à tout moment depuis les paramètres de son espace personnel. Kivio se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Modification des CGU</h2>
              <p>
                Kivio se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification substantielle par email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Droit applicable</h2>
              <p>
                Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Contact</h2>
              <p>
                Pour toute question : <a href="mailto:contact.kivio@gmail.com" className="text-emerald-400 hover:underline">contact.kivio@gmail.com</a>
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
