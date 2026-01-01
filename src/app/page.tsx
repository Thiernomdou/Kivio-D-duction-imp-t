"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, User, Loader2, CheckCircle2 } from "lucide-react";
import Hero from "@/components/Hero";
import SmartAudit from "@/components/SmartAudit";
import AuditResult from "@/components/AuditResult";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { type TaxResult, type BeneficiaryType } from "@/lib/tax-calculator";
import { saveSimulation, type SimulationData } from "@/lib/supabase/simulations";

type AppState = "hero" | "audit" | "result";

interface AuditData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  isMarried: boolean;
  childrenCount: number;
  annualIncome: number;
}

// Wrapper pour Suspense
export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
}

function HomeContent() {
  const [appState, setAppState] = useState<AppState>("hero");
  const [auditResult, setAuditResult] = useState<
    (TaxResult & { eligible: boolean }) | null
  >(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signup");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const auditRef = useRef<HTMLDivElement>(null);

  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gérer la confirmation d'email et la redirection
  useEffect(() => {
    // Si l'utilisateur vient de confirmer son email
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      setEmailConfirmed(true);
      setAuthModalMode("signin");
      setShowAuthModal(true);
      // Nettoyer l'URL
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Rediriger vers le dashboard si l'utilisateur est connecté
  // (sauf s'il est en train de faire une simulation)
  useEffect(() => {
    if (!loading && user && appState === "hero" && !showAuthModal) {
      router.push("/dashboard");
    }
  }, [user, loading, appState, showAuthModal, router]);

  const handleStartAudit = () => {
    setAppState("audit");
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAuditComplete = (
    result: TaxResult & { eligible: boolean },
    data?: AuditData
  ) => {
    setAuditResult(result);
    if (data) setAuditData(data);
    setAppState("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setAuditResult(null);
    setAuditData(null);
    setSaveSuccess(false);
    setAppState("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!user) {
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }

    if (!auditResult || !auditData) return;

    setSaving(true);
    try {
      const simulationData: SimulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
      };

      const { error } = await saveSimulation(user.id, simulationData);

      if (error) {
        console.error("Error saving simulation:", error);
        alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
      } else {
        setSaveSuccess(true);
        // Redirection vers le dashboard après 1.5s
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = () => {
    // Après connexion, sauvegarder automatiquement si on a des résultats
    if (auditResult && auditData) {
      handleSave();
    }
  };

  const openSignIn = () => {
    setAuthModalMode("signin");
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthModalMode("signup");
    setShowAuthModal(true);
  };

  return (
    <main className="relative">
      <AnimatePresence mode="wait">
        {appState === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Hero onStartAudit={handleStartAudit} />
          </motion.div>
        )}

        {appState === "audit" && (
          <motion.div
            key="audit"
            ref={auditRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SmartAudit
              onComplete={(result, data) =>
                handleAuditComplete(result, data as AuditData)
              }
            />
          </motion.div>
        )}

        {appState === "result" && auditResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuditResult
              result={auditResult}
              onRestart={handleRestart}
              onSave={handleSave}
              saving={saving}
              saveSuccess={saveSuccess}
              isAuthenticated={!!user}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleRestart}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-white">Kivio</span>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 sm:gap-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-zinc-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={openSignIn}
                  className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Connexion
                </button>
                <button
                  onClick={openSignUp}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors"
                >
                  Inscription
                </button>
              </>
            )}
          </motion.nav>
        </div>
      </header>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="text-xs text-zinc-600">
            Kivio - Simulation fiscale indicative. Consultez un conseiller fiscal
            pour une analyse personnalisée.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setEmailConfirmed(false);
        }}
        onSuccess={handleAuthSuccess}
        defaultMode={authModalMode}
        showEmailConfirmed={emailConfirmed}
      />
    </main>
  );
}
