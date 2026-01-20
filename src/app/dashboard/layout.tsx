"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Home, FileText, Settings, HelpCircle, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Toaster } from "sonner";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import BackgroundEffect from "@/components/BackgroundEffect";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const redirected = useRef(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isLight = theme === "light";

  // Fermer le menu profil quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  // Ne montrer le loader que si le chargement prend plus de 100ms (fast feedback)
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [loading]);

  // Redirection si non connecté - géré principalement par le middleware
  // Ceci est un fallback côté client pour les cas edge
  useEffect(() => {
    if (!loading && !user && !redirected.current) {
      redirected.current = true;
      // Utiliser replace au lieu de push pour éviter l'historique
      router.replace("/");
    }
  }, [user, loading, router]);

  // Afficher un écran stable pendant le chargement - évite les flashs sur mobile
  if (loading) {
    return (
      <div
        className={`min-h-screen min-h-[100dvh] ${isLight ? 'bg-[#f0f0f3]' : 'bg-black'}`}
        style={{
          contain: 'layout style paint',
          willChange: 'auto'
        }}
      >
        {showLoader && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-accent-purple/20 border-t-accent-purple"
                style={{ animation: 'spin 0.5s linear infinite' }}
              />
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Chargement...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si pas d'utilisateur après chargement, écran minimal (redirection middleware en cours)
  if (!user) {
    return (
      <div
        className={`min-h-screen min-h-[100dvh] ${isLight ? 'bg-[#f0f0f3]' : 'bg-black'}`}
        style={{ contain: 'layout style paint' }}
      />
    );
  }

  return (
    <DashboardProvider>
      <div
        className="min-h-screen min-h-[100dvh] relative"
        style={{ contain: 'layout style' }}
      >
        {/* Fond style Finary */}
        <BackgroundEffect />

        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${isLight ? 'bg-white/70 border-black/5' : 'bg-black/60 border-white/5'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Logo size="md" onClick={() => router.push("/dashboard")} />

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <NavItem href="/dashboard" icon={<Home className="w-4 h-4" />} active isLight={isLight}>
                  Tableau de bord
                </NavItem>
                <NavItem href="/dashboard/documents" icon={<FileText className="w-4 h-4" />} isLight={isLight}>
                  Documents
                </NavItem>
                <NavItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} isLight={isLight}>
                  Paramètres
                </NavItem>
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <ThemeToggle />

                <button className={`p-2 transition-colors rounded-lg ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                  <HelpCircle className="w-5 h-5" />
                </button>

                <div className={`flex items-center gap-3 pl-4 border-l ${isLight ? 'border-gray-200' : 'border-white/10'}`} ref={profileMenuRef}>
                  <div className="hidden sm:block text-right">
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-600'}`}>{user.email}</p>
                  </div>

                  {/* Avatar cliquable avec menu dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 focus:outline-none"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                          boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)"
                        }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${showProfileMenu ? 'rotate-180' : ''} ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>

                    {/* Menu dropdown - visible sur mobile */}
                    {showProfileMenu && (
                      <div
                        className={`absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl overflow-hidden z-[200] ${
                          isLight ? 'bg-white border-gray-200' : 'bg-[#141414] border-white/10'
                        }`}
                        style={{
                          animation: 'fadeIn 0.15s ease-out'
                        }}
                      >
                        {/* Info utilisateur dans le menu */}
                        <div className={`px-4 py-3 border-b ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                          <p className={`text-sm font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                          </p>
                          <p className={`text-xs truncate ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>{user.email}</p>
                        </div>

                        {/* Liens de navigation */}
                        <div className="py-1">
                          <Link
                            href="/dashboard/documents"
                            onClick={() => setShowProfileMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            Documents
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            <Settings className="w-4 h-4" />
                            Paramètres
                          </Link>
                        </div>

                        {/* Déconnexion */}
                        <div className={`border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              signOut();
                            }}
                            className={`flex items-center gap-3 px-4 py-3 text-sm w-full transition-colors ${
                              isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bouton déconnexion rapide - visible sur toutes les tailles */}
                  <button
                    onClick={() => signOut()}
                    className={`p-2 transition-colors rounded-lg ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 pb-24 md:pb-0 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0D0D0D",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              borderRadius: "12px",
            },
          }}
        />
      </div>
    </DashboardProvider>
  );
}

// Composant NavItem - Fast navigation with prefetch
function NavItem({
  href,
  icon,
  children,
  active = false,
  isLight = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  isLight?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-100 ${
        active
          ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
          : isLight
            ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent active:scale-[0.98]"
            : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent active:scale-[0.98]"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

// Navigation mobile en bas de l'écran - Optimisée pour performances
function MobileNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Accueil" },
    { href: "/dashboard/documents", icon: FileText, label: "Documents" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t ${isLight ? 'bg-white border-gray-200' : 'bg-[#0a0a0a] border-white/10'}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'auto'
      }}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl min-w-[80px] min-h-[56px] transition-colors duration-75 ${
                isActive
                  ? "text-accent-purple bg-accent-purple/10"
                  : isLight
                    ? "text-gray-500 active:text-gray-900 active:bg-gray-100"
                    : "text-gray-500 active:text-white active:bg-white/5"
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
