"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User, Home, FileText, Settings, HelpCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-bold text-white">Kivio</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <NavItem href="/dashboard" icon={<Home className="w-4 h-4" />} active>
                  Dashboard
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
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {profile?.full_name || "Utilisateur"}
                    </p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-400" />
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
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
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #3f3f46",
              color: "#fff",
            },
            className: "!bg-dark-800 !border-dark-600",
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary-500/10 text-primary-400"
          : "text-zinc-400 hover:text-white hover:bg-dark-700"
      }`}
    >
      {icon}
      {children}
    </a>
  );
}
