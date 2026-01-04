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

// Générer un ID unique pour cette session de simulation
const generateSessionId = () => `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Structure pour stocker la simulation en attente avec son ID de session
interface PendingSimulationData {
  sessionId: string;
  data: SimulationData;
}

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

  // ID de session unique pour cette simulation (généré une fois par session)
  const sessionIdRef = useRef<string>(generateSessionId());

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
    // Générer un nouvel ID de session pour la prochaine simulation
    sessionIdRef.current = generateSessionId();
    // Nettoyer toute simulation en attente
    localStorage.removeItem("pendingSimulation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!auditResult || !auditData) return;

    // Si pas connecté, sauvegarder en localStorage avec l'ID de session et ouvrir le modal
    if (!user) {
      const simulationData: SimulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
      };
      // Stocker avec l'ID de session pour isoler cette simulation
      const pendingData: PendingSimulationData = {
        sessionId: sessionIdRef.current,
        data: simulationData,
      };
      localStorage.setItem("pendingSimulation", JSON.stringify(pendingData));
      console.log("[Simulation] Saved pending simulation with sessionId:", sessionIdRef.current);
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }

    // Si connecté, sauvegarder directement (sans passer par localStorage)
    await saveSimulationToDb();
  };

  const saveSimulationToDb = async (userId?: string) => {
    const effectiveUserId = userId || user?.id;

    if (!effectiveUserId || (!auditResult && !auditData)) {
      // Essayer de récupérer depuis localStorage avec vérification du sessionId
      const pending = localStorage.getItem("pendingSimulation");
      if (!pending || !effectiveUserId) return;

      try {
        const pendingData = JSON.parse(pending) as PendingSimulationData;

        // CRITIQUE: Vérifier que le sessionId correspond à cette session
        // Cela empêche un utilisateur de sauvegarder la simulation d'un autre
        if (pendingData.sessionId !== sessionIdRef.current) {
          console.warn("[Simulation] Session ID mismatch - ignoring stale pending simulation", {
            expected: sessionIdRef.current,
            found: pendingData.sessionId
          });
          // Nettoyer la simulation obsolète
          localStorage.removeItem("pendingSimulation");
          return;
        }

        console.log("[Simulation] Saving pending simulation for user:", effectiveUserId);
        const simulationData = pendingData.data;
        setSaving(true);
        try {
          const { error } = await saveSimulation(effectiveUserId, simulationData);
          if (!error) {
            localStorage.removeItem("pendingSimulation");
            setSaveSuccess(true);
            console.log("[Simulation] Successfully saved to DB");
          }
        } finally {
          setSaving(false);
        }
      } catch (parseError) {
        console.error("[Simulation] Error parsing pending simulation:", parseError);
        localStorage.removeItem("pendingSimulation");
      }
      return;
    }

    setSaving(true);
    try {
      const simulationData: SimulationData = {
        ...auditData!,
        result: auditResult!,
        eligible: auditResult!.eligible,
      };

      console.log("[Simulation] Saving directly for user:", effectiveUserId);
      const { error } = await saveSimulation(effectiveUserId, simulationData);

      if (error) {
        console.error("Error saving simulation:", error);
        alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
      } else {
        localStorage.removeItem("pendingSimulation");
        setSaveSuccess(true);
        console.log("[Simulation] Successfully saved to DB");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = async (userId?: string) => {
    setShowAuthModal(false);
    // Après inscription/connexion, sauvegarder automatiquement avec le userId passé
    await saveSimulationToDb(userId);
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
            <LandingPage onStartAudit={handleStartAudit} onSignIn={openSignIn} />
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
