"use client";

import { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load heavy components for faster initial page load
const SmartAudit = dynamic(() => import("@/components/SmartAudit"), {
  loading: () => <ComponentLoader text="Chargement du questionnaire" />,
  ssr: false,
});

const AuditResult = dynamic(() => import("@/components/AuditResult"), {
  loading: () => <ComponentLoader text="Préparation des résultats" />,
  ssr: false,
});

// Loading component for lazy-loaded components
function ComponentLoader({ text }: { text: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 blur-xl animate-pulse" />

        {/* Logo */}
        <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
          <span className="text-xl font-bold text-white">K</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-400">{text}</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

import { type TaxResult, type BeneficiaryType, type ExpenseType, type IneligibilityReason } from "@/lib/tax-calculator";
import { saveSimulation, type SimulationData } from "@/lib/supabase/simulations";
import { saveFiscalProfile } from "@/lib/supabase/fiscal-profile";

// Clé pour le stockage de la simulation en attente (localStorage pour persister après fermeture navigateur)
const PENDING_SIMULATION_KEY = "kivio_pending_simulation";
// Clé pour le sessionId dans sessionStorage (effacé à la fermeture du navigateur)
const SESSION_ID_KEY = "kivio_simulation_session_id";
// Durée de validité d'une simulation en localStorage (24 heures en millisecondes)
const SIMULATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

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
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-black"
      style={{ contain: 'layout style paint' }}
    >
      <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
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
  const [redirecting, setRedirecting] = useState(false);
  // Identifiant unique de session pour cette simulation (évite les conflits entre utilisateurs)
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null);
  const auditRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Optimized animation variants - simpler on mobile/reduced motion
  const pageVariants = useMemo(() => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0 },
    animate: { opacity: 1 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0 },
  }), [prefersReducedMotion]);

  const pageTransition = useMemo(() => ({
    duration: prefersReducedMotion ? 0.1 : 0.2,
  }), [prefersReducedMotion]);

  // Gérer la confirmation d'email et la redirection
  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      // Si déjà connecté après confirmation, aller directement au dashboard
      if (!loading && user) {
        setRedirecting(true);
        router.replace("/dashboard");
        return;
      }

      // Sinon afficher le modal de connexion
      if (!loading && !user) {
        // Nettoyer l'URL sans bloquer
        router.replace("/", { scroll: false });
        setEmailConfirmed(true);
        setAuthModalMode("signin");
        setShowAuthModal(true);
      }
    }
  }, [searchParams, router, loading, user]);

  // Vérifier si on doit afficher le questionnaire directement (via paramètre URL)
  useEffect(() => {
    const startAudit = searchParams.get("audit");
    if (startAudit === "true") {
      setAppState("audit");
      // Nettoyer l'URL
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Rediriger vers le dashboard si l'utilisateur est connecté (géré par middleware, fallback client)
  useEffect(() => {
    const startAudit = searchParams.get("audit");
    const confirmed = searchParams.get("confirmed");
    if (!loading && user && appState === "hero" && !showAuthModal && !emailConfirmed && startAudit !== "true" && confirmed !== "true") {
      // Marquer comme redirection en cours pour éviter flash
      setRedirecting(true);
      router.replace("/dashboard");
    }
  }, [user, loading, appState, showAuthModal, emailConfirmed, router, searchParams]);

  // Afficher écran vide pendant la redirection (évite flash)
  if (redirecting || (user && !loading && appState === "hero" && !showAuthModal)) {
    return (
      <div
        className="min-h-screen min-h-[100dvh] bg-black"
        style={{ contain: 'layout style paint' }}
      />
    );
  }

  const handleStartAudit = () => {
    setAppState("audit");
    setTimeout(() => {
      auditRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleAuditComplete = async (
    result: AuditResultData,
    data?: AuditData
  ) => {
    console.log("[AuditComplete] Result received:", { gain: result.gain, eligible: result.eligible });
    console.log("[AuditComplete] Data received:", data);

    // Générer un identifiant unique pour cette simulation
    const sessionId = crypto.randomUUID();
    setSimulationSessionId(sessionId);
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);

    setAuditResult(result);
    if (data) setAuditData(data);

    // Sauvegarder automatiquement en localStorage pour ne pas perdre les données
    if (data && result) {
      const simulationDataWithSession = {
        ...data,
        result: result,
        eligible: result.eligible,
        sessionId: sessionId,
        createdAt: Date.now(),
      };
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationDataWithSession));
      console.log("[AuditComplete] Auto-saved simulation to localStorage, gain:", result.gain);

      // Si l'utilisateur est connecté, sauvegarder et rediriger directement vers le dashboard
      if (user) {
        console.log("[AuditComplete] User is logged in, saving and redirecting to dashboard...");

        // Tenter la sauvegarde en DB
        let saveSuccessful = false;
        try {
          const { data: savedData, error } = await saveSimulation(user.id, simulationDataWithSession);
          if (!error && savedData) {
            console.log("[AuditComplete] Simulation saved to DB:", savedData.id);

            // Mettre à jour le profil fiscal
            const { data: profileData, error: profileError } = await saveFiscalProfile(user.id, {
              monthlyAmount: data.monthlySent,
              beneficiaryType: data.beneficiaryType,
              expenseType: data.expenseType,
              isMarried: data.isMarried,
              childrenCount: data.childrenCount,
              annualIncome: data.annualIncome,
              tmi: result.tmi,
              estimatedRecovery: result.gain,
              fiscalParts: result.parts,
              taxBefore: result.taxBefore,
              taxAfter: result.taxAfter,
            });

            if (!profileError && profileData) {
              // Les deux sauvegardes ont réussi
              // NE PAS nettoyer localStorage ici - le dashboard le fera après avoir chargé les données
              saveSuccessful = true;
              console.log("[AuditComplete] Saved to DB successfully, localStorage kept for dashboard verification");
            } else {
              console.log("[AuditComplete] Profile save failed:", profileError?.message);
              // Garder localStorage pour retry
            }
          } else {
            console.log("[AuditComplete] Simulation save failed:", error?.message);
          }
        } catch (e) {
          console.error("[AuditComplete] Save exception:", e);
        }

        if (!saveSuccessful) {
          console.log("[AuditComplete] Data preserved in localStorage for dashboard retry");
        }

        // Rediriger vers le dashboard avec le paramètre refresh pour forcer le rechargement
        router.push("/dashboard?refresh=true");
        return;
      }
    }

    // Pour les utilisateurs non connectés, afficher la page de résultats
    setAppState("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setAuditResult(null);
    setAuditData(null);
    setSaveSuccess(false);
    setSimulationSessionId(null);
    setAppState("hero");
    // Nettoyer toute simulation en attente et le sessionId
    localStorage.removeItem(PENDING_SIMULATION_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
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
      const currentSessionId = simulationSessionId || crypto.randomUUID();
      if (!simulationSessionId) {
        setSimulationSessionId(currentSessionId);
        sessionStorage.setItem(SESSION_ID_KEY, currentSessionId);
      }

      const simulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
        sessionId: currentSessionId,
        createdAt: Date.now(),
      };
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationData));
      console.log("[HandleSave] Saved to localStorage, opening auth modal");
      setAuthModalMode("signup");
      setShowAuthModal(true);
      return;
    }

    // Si connecté, sauvegarder et rediriger vers le dashboard
    setSaving(true);
    await saveSimulationToDb();
    router.push("/dashboard");
  };

  const saveSimulationToDb = async (userId?: string) => {
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) {
      console.log("[Simulation] No userId available for saving");
      return;
    }

    // Récupérer les données depuis le state en mémoire OU localStorage
    let simulationData: SimulationData | null = null;

    // Priorité 1: Utiliser les données en mémoire (state)
    if (auditResult && auditData) {
      simulationData = {
        ...auditData,
        result: auditResult,
        eligible: auditResult.eligible,
      };
      console.log("[Simulation] Using data from memory state, gain:", auditResult.gain);
    } else {
      // Priorité 2: Récupérer depuis localStorage
      const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
      if (pending) {
        try {
          const parsedData = JSON.parse(pending) as SimulationData & { createdAt?: number };

          // Vérifier l'expiration (24h)
          if (parsedData.createdAt) {
            const age = Date.now() - parsedData.createdAt;
            if (age > SIMULATION_EXPIRY_MS) {
              console.log("[Simulation] Pending simulation expired");
              localStorage.removeItem(PENDING_SIMULATION_KEY);
              return;
            }
          }
          simulationData = parsedData;
          console.log("[Simulation] Using data from localStorage, gain:", parsedData.result?.gain);
        } catch (parseError) {
          console.error("[Simulation] Error parsing localStorage:", parseError);
          localStorage.removeItem(PENDING_SIMULATION_KEY);
          return;
        }
      }
    }

    if (!simulationData) {
      console.log("[Simulation] No simulation data to save");
      return;
    }

    try {
      console.log("[Simulation] Saving for user:", effectiveUserId);

      const { data, error } = await saveSimulation(effectiveUserId, simulationData);

      if (error) {
        console.error("[Simulation] Error saving:", error);
        // Les données restent en localStorage pour une nouvelle tentative via le dashboard
      } else if (data) {
        // Mettre à jour le profil fiscal
        await saveFiscalProfile(effectiveUserId, {
          monthlyAmount: simulationData.monthlySent || 0,
          beneficiaryType: simulationData.beneficiaryType || "parents",
          expenseType: simulationData.expenseType || "alimentary",
          isMarried: simulationData.isMarried || false,
          childrenCount: simulationData.childrenCount || 0,
          annualIncome: simulationData.annualIncome || 0,
          tmi: simulationData.result?.tmi || 0,
          estimatedRecovery: simulationData.result?.gain || 0,
          fiscalParts: simulationData.result?.parts || undefined,
          taxBefore: simulationData.result?.taxBefore || undefined,
          taxAfter: simulationData.result?.taxAfter || undefined,
        });

        // Nettoyer le localStorage après succès
        localStorage.removeItem(PENDING_SIMULATION_KEY);
        sessionStorage.removeItem(SESSION_ID_KEY);
        console.log("[Simulation] Saved successfully");
        setSaveSuccess(true);
      }
    } catch (error) {
      console.error("[Simulation] Exception:", error);
      // Les données restent en localStorage pour une nouvelle tentative
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = async (userId?: string) => {
    console.log("[AuthSuccess] Called with userId:", userId);
    setShowAuthModal(false);

    // Après inscription/connexion, sauvegarder automatiquement et le AuthContext redirigera vers le dashboard
    try {
      await saveSimulationToDb(userId);
      console.log("[AuthSuccess] saveSimulationToDb completed");
    } catch (e) {
      console.error("[AuthSuccess] saveSimulationToDb failed:", e);
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
      {/* Header persistant sur audit et result */}
      {appState !== "hero" && (
        <Header
          onLogoClick={handleRestart}
          onSignIn={openSignIn}
          showSignIn={!user}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {appState === "hero" && (
          <motion.div
            key="hero"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LandingPage onStartAudit={handleStartAudit} onSignIn={openSignIn} onSignUp={openSignUp} />
          </motion.div>
        )}

        {appState === "audit" && (
          <motion.div
            key="audit"
            ref={auditRef}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-screen pt-16"
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
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-screen pt-16"
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
