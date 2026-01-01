import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Kivio - Optimisez vos transferts. Récupérez vos impôts.",
  description:
    "Automatisez votre dossier de preuves pour la case 6GU. Transformez vos reçus Wave, TapTap, Western Union en remboursement d'impôt certifié.",
  keywords: [
    "déduction fiscale",
    "transfert argent",
    "case 6GU",
    "impôts France",
    "pension alimentaire",
    "Wave",
    "Western Union",
  ],
  authors: [{ name: "Kivio" }],
  openGraph: {
    title: "Kivio - Optimisez vos transferts. Récupérez vos impôts.",
    description:
      "Simulez votre gain fiscal en 30 secondes. Automatisez votre dossier case 6GU.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-dark-900 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
