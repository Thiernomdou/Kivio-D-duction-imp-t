"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

export default function MentionsLegales() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Mentions légales</h1>

          <div className="space-y-8 text-gray-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Éditeur du site</h2>
              <p>
                Le site Kivio est édité par :<br />
                <strong className="text-white">Kivio</strong><br />
                Email : contact.kivio@gmail.com<br />
                Directeur de la publication : L&apos;équipe Kivio
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Hébergement</h2>
              <p>
                Le site est hébergé par :<br />
                <strong className="text-white">Vercel Inc.</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789, États-Unis<br />
                Site web : vercel.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des contenus présents sur le site Kivio (textes, images, graphismes, logo, icônes, logiciels, etc.) sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="mt-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Kivio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Limitation de responsabilité</h2>
              <p>
                Kivio s&apos;efforce de fournir des informations aussi précises que possible. Toutefois, Kivio ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
              </p>
              <p className="mt-4">
                Les simulations fiscales fournies par Kivio sont données à titre indicatif et ne constituent pas un conseil fiscal personnalisé. L&apos;utilisateur reste seul responsable de sa déclaration fiscale.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Base légale</h2>
              <p>
                Les calculs de déduction fiscale sont basés sur les articles 205 à 208 du Code civil français relatifs à l&apos;obligation alimentaire entre ascendants et descendants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Contact</h2>
              <p>
                Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l&apos;adresse suivante : <a href="mailto:contact.kivio@gmail.com" className="text-emerald-400 hover:underline">contact.kivio@gmail.com</a>
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
