import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import BackgroundEffect from "@/components/BackgroundEffect";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

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
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kivio",
  },
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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeProvider>
          <BackgroundEffect />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
