"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function Confidentialite() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Politique de confidentialité</h1>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Collecte des données</h2>
              <p>
                Kivio collecte les données suivantes dans le cadre de son service :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Données d&apos;identification : nom, prénom, adresse email</li>
                <li>Données financières : montants des transferts, reçus uploadés</li>
                <li>Données de simulation : revenus déclarés, situation familiale</li>
                <li>Données techniques : adresse IP, type de navigateur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Utilisation des données</h2>
              <p>
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Fournir le service de simulation fiscale</li>
                <li>Générer vos rapports PDF pour la déclaration d&apos;impôts</li>
                <li>Améliorer nos services et l&apos;expérience utilisateur</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Stockage et sécurité</h2>
              <p>
                Vos données sont stockées de manière sécurisée sur les serveurs de Supabase, conformes aux normes de sécurité les plus strictes. Les données sont chiffrées en transit et au repos.
              </p>
              <p className="mt-4">
                Vos reçus et documents sont conservés pendant <strong className="text-white">3 ans</strong> pour vous permettre de les consulter en cas de contrôle fiscal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Partage des données</h2>
              <p>
                Kivio ne vend, ne loue et ne partage pas vos données personnelles avec des tiers à des fins commerciales. Vos données peuvent être partagées uniquement avec :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Nos prestataires techniques (hébergement, paiement)</li>
                <li>Les autorités compétentes si la loi l&apos;exige</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Vos droits (RGPD)</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li><strong className="text-white">Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
                <li><strong className="text-white">Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong className="text-white">Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
                <li><strong className="text-white">Droit à la portabilité</strong> : récupérer vos données dans un format lisible</li>
                <li><strong className="text-white">Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:contact.kivio@gmail.com" className="text-emerald-400 hover:underline">contact.kivio@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Cookies</h2>
              <p>
                Kivio utilise des cookies essentiels au fonctionnement du service (authentification, préférences). Consultez notre <Link href="/cookies" className="text-emerald-400 hover:underline">Politique de cookies</Link> pour plus de détails.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Contact</h2>
              <p>
                Pour toute question relative à cette politique, contactez notre délégué à la protection des données : <a href="mailto:contact.kivio@gmail.com" className="text-emerald-400 hover:underline">contact.kivio@gmail.com</a>
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
