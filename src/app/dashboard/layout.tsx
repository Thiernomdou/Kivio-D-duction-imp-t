"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Home, FileText, Settings, HelpCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Toaster } from "sonner";
import Logo from "@/components/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const redirected = useRef(false);

  // Ne montrer le loader que si le chargement prend plus de 300ms
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [loading]);

  // Redirection si non connecté (une seule fois)
  useEffect(() => {
    if (!loading && !user && !redirected.current) {
      redirected.current = true;
      router.push("/");
    }
  }, [user, loading, router]);

  // Afficher le loader uniquement si vraiment nécessaire
  if (loading && showLoader) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <Sparkles className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher un écran minimal pendant le chargement court
  if (loading && !user) {
    return <div className="min-h-screen bg-black" />;
  }

  // Si pas d'utilisateur après chargement, afficher rien (redirection en cours)
  if (!user) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-black relative">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px]" />
        </div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Logo size="md" onClick={() => router.push("/dashboard")} />

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <NavItem href="/dashboard" icon={<Home className="w-4 h-4" />} active>
                  Tableau de bord
                </NavItem>
                <NavItem href="/dashboard/documents" icon={<FileText className="w-4 h-4" />}>
                  Documents
                </NavItem>
                <NavItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />}>
                  Paramètres
                </NavItem>
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <HelpCircle className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500"
                    style={{
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <User className="w-5 h-5 text-black" />
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
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
        <main className="pt-16 pb-20 md:pb-0 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
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

// Composant NavItem
function NavItem({
  href,
  icon,
  children,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {icon}
      {children}
    </a>
  );
}

// Navigation mobile en bas de l'écran
function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Accueil" },
    { href: "/dashboard/documents", icon: FileText, label: "Documents" },
    { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[70px] ${
                isActive
                  ? "text-emerald-400"
                  : "text-gray-500 active:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
