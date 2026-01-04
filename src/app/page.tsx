"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import SmartAudit from "@/components/SmartAudit";
import AuditResult from "@/components/AuditResult";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { type TaxResult, type BeneficiaryType, type ExpenseType, type IneligibilityReason } from "@/lib/tax-calculator";
import { saveSimulation, type SimulationData } from "@/lib/supabase/simulations";

// Clé pour le stockage de la simulation en attente (localStorage pour persister après fermeture navigateur)
const PENDING_SIMULATION_KEY = "kivio_pending_simulation";

type AppState = "hero" | "audit" | "result";

interface AuditResultData extends TaxResult {
  eligible: boolean;
  ineligibilityReason?: IneligibilityReason;
  ineligibilityMessage?: string;
  legalReference?: string;
}

interface AuditData {
  monthlySent: number;
  beneficiaryType: BeneficiaryType;
  expenseType: ExpenseType;
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
  const [auditResult, setAuditResult] = useState<AuditResultData | null>(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signup");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const auditRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gérer la confirmation d'email et la redirection
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      // Nettoyer l'URL d'abord
      router.replace("/", { scroll: false });

      // Si déjà connecté après confirmation, aller directement au dashboard
      if (!loading && user) {
        router.push("/dashboard");
        return;
      }

      // Sinon afficher le modal de connexion
      if (!loading && !user) {
        setEmailConfirmed(true);
        setAuthModalMode("signin");
        setShowAuthModal(true);
      }
    }
  }, [searchParams, router, loading, user]);

  // Rediriger vers le dashboard si l'utilisateur est connecté
  useEffect(() => {
    if (!loading && user && appState === "hero" && !showAuthModal && !emailConfirmed) {
      router.push("/dashboard");
    }
  }, [user, loading, appState, showAuthModal, emailConfirmed, router]);

  const handleStartAudit = () => {
    setAppState("audit");
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAuditComplete = (
    result: AuditResultData,
    data?: AuditData
  ) => {
    console.log("[AuditComplete] Result received:", { gain: result.gain, eligible: result.eligible });
    console.log("[AuditComplete] Data received:", data);

    setAuditResult(result);
    if (data) setAuditData(data);
    setAppState("result");

    // Sauvegarder automatiquement en localStorage pour ne pas perdre les données
    // localStorage persiste même après fermeture du navigateur
    if (data && result) {
      const simulationData: SimulationData = {
        ...data,
        result: result,
        eligible: result.eligible,
      };
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationData));
      console.log("[AuditComplete] Auto-saved simulation to localStorage, gain:", result.gain);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setAuditResult(null);
    setAuditData(null);
    setSaveSuccess(false);
    setAppState("hero");
    // Nettoyer toute simulation en attente
    localStorage.removeItem(PENDING_SIMULATION_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    console.log("[HandleSave] Called with auditResult:", auditResult);
    console.log("[HandleSave] Called with auditData:", auditData);

    if (!auditResult || !auditData) {
      console.error("[HandleSave] Missing data - auditResult:", !!auditResult, "auditData:", !!auditData);
      return;
    }

    // Si pas connecté, sauvegarder en localStorage et ouvrir le modal
    if (!user) {
      const simulationData: SimulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
      };
      console.log("[HandleSave] Saving to localStorage:", JSON.stringify(simulationData, null, 2));
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationData));
      console.log("[HandleSave] Saved pending simulation to localStorage, gain:", auditResult.gain);
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }

    // Si connecté, sauvegarder directement
    await saveSimulationToDb();
  };

  const saveSimulationToDb = async (userId?: string, silent = false) => {
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) {
      console.log("[Simulation] No userId available for saving");
      return;
    }

    // Priorité 1: Utiliser les données en mémoire (state)
    // Priorité 2: Récupérer depuis localStorage (après création de compte)
    let simulationData: SimulationData | null = null;

    if (auditResult && auditData) {
      // Données en mémoire disponibles
      simulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
      };
      console.log("[Simulation] Using data from memory state");
    } else {
      // Essayer de récupérer depuis localStorage
      const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
      if (pending) {
        try {
          simulationData = JSON.parse(pending) as SimulationData;
          console.log("[Simulation] Retrieved pending simulation from localStorage");
        } catch (parseError) {
          console.error("[Simulation] Error parsing pending simulation:", parseError);
          localStorage.removeItem(PENDING_SIMULATION_KEY);
          return;
        }
      }
    }

    if (!simulationData) {
      console.log("[Simulation] No simulation data to save");
      return;
    }

    setSaving(true);
    try {
      console.log("[Simulation] Saving for user:", effectiveUserId, "data:", {
        monthlySent: simulationData.monthlySent,
        taxGain: simulationData.result?.gain,
      });

      const { error } = await saveSimulation(effectiveUserId, simulationData);

      if (error) {
        console.error("[Simulation] Error saving:", error);
        // Ne pas afficher d'alerte si silent mode (redirection en cours)
        if (!silent) {
          alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
        }
      } else {
        // Nettoyer localStorage après sauvegarde réussie
        localStorage.removeItem(PENDING_SIMULATION_KEY);
        setSaveSuccess(true);
        console.log("[Simulation] Successfully saved to DB for user:", effectiveUserId);
      }
    } catch (error) {
      console.error("[Simulation] Exception:", error);
      if (!silent) {
        alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = async (userId?: string) => {
    setShowAuthModal(false);
    // Après inscription/connexion, sauvegarder automatiquement avec le userId passé
    // Mode silent car on redirige vers le dashboard juste après
    await saveSimulationToDb(userId, true);
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
      {/* Header persistant sur audit et result */}
      {appState !== "hero" && (
        <Header
          onLogoClick={handleRestart}
          onSignIn={openSignIn}
          showSignIn={!user}
        />
      )}

      <AnimatePresence mode="wait">
        {appState === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onStartAudit={handleStartAudit} onSignIn={openSignIn} onSignUp={openSignUp} />
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
            className="min-h-screen bg-dark-900 pt-16"
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
            className="min-h-screen bg-dark-900 pt-16"
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
