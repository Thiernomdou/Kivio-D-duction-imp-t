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
    <div className="min-h-screen flex items-center justify-center">
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
  // Identifiant unique de session pour cette simulation (évite les conflits entre utilisateurs)
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null);
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

  // Vérifier si on doit afficher le questionnaire directement (via paramètre URL)
  useEffect(() => {
    const startAudit = searchParams.get("audit");
    if (startAudit === "true") {
      setAppState("audit");
      // Nettoyer l'URL
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Rediriger vers le dashboard si l'utilisateur est connecté (sauf si on force le questionnaire)
  useEffect(() => {
    const startAudit = searchParams.get("audit");
    if (!loading && user && appState === "hero" && !showAuthModal && !emailConfirmed && startAudit !== "true") {
      router.push("/dashboard");
    }
  }, [user, loading, appState, showAuthModal, emailConfirmed, router, searchParams]);

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
    // Cet ID permet d'éviter les conflits si plusieurs utilisateurs font des simulations sur le même navigateur
    const sessionId = crypto.randomUUID();
    setSimulationSessionId(sessionId);
    // Stocker aussi dans sessionStorage pour validation (effacé à la fermeture du navigateur)
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);

    setAuditResult(result);
    if (data) setAuditData(data);
    setAppState("result");

    // Sauvegarder automatiquement en localStorage pour ne pas perdre les données
    // localStorage persiste même après fermeture du navigateur
    if (data && result) {
      const simulationDataWithSession = {
        ...data,
        result: result,
        eligible: result.eligible,
        sessionId: sessionId, // Ajouter l'ID de session pour identifier cette simulation
        createdAt: Date.now(), // Timestamp pour savoir quand la simulation a été faite
      };
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationDataWithSession));
      console.log("[AuditComplete] Auto-saved simulation to localStorage, gain:", result.gain, "sessionId:", sessionId);

      // Si l'utilisateur est déjà connecté, sauvegarder automatiquement dans la DB
      if (user) {
        console.log("[AuditComplete] User is logged in, auto-saving to DB...");
        try {
          const { data: savedData, error } = await saveSimulation(user.id, simulationDataWithSession);
          if (error) {
            console.error("[AuditComplete] Auto-save to DB failed:", error);
            // Garder le localStorage pour permettre une nouvelle tentative
          } else if (savedData) {
            // Aussi mettre à jour le profil fiscal avec toutes les données du questionnaire
            await saveFiscalProfile(user.id, {
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
            console.log("[AuditComplete] Also updated fiscal profile");
            // Sauvegarde réussie - nettoyer le localStorage et sessionStorage immédiatement
            localStorage.removeItem(PENDING_SIMULATION_KEY);
            sessionStorage.removeItem(SESSION_ID_KEY);
            console.log("[AuditComplete] Auto-saved to DB and cleaned localStorage, id:", savedData.id, "tax_gain:", savedData.tax_gain);
          }
        } catch (e) {
          console.error("[AuditComplete] Auto-save to DB exception:", e);
        }
      }
    }

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
      // Générer un sessionId si on n'en a pas encore
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
      console.log("[HandleSave] Saving to localStorage:", JSON.stringify(simulationData, null, 2));
      localStorage.setItem(PENDING_SIMULATION_KEY, JSON.stringify(simulationData));
      console.log("[HandleSave] Saved pending simulation to localStorage, gain:", auditResult.gain, "sessionId:", currentSessionId);
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
      // Priorité 2: Récupérer depuis localStorage (toujours vérifier)
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

    setSaving(true);
    try {
      console.log("[Simulation] Saving for user:", effectiveUserId, "data:", {
        monthlySent: simulationData.monthlySent,
        taxGain: simulationData.result?.gain,
      });

      const { data, error } = await saveSimulation(effectiveUserId, simulationData);

      if (error) {
        console.error("[Simulation] Error saving:", error);
        // Ne pas afficher d'alerte si silent mode (redirection en cours)
        // Garder le localStorage pour permettre une nouvelle tentative via le dashboard
        if (!silent) {
          alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
        }
      } else if (data) {
        // Aussi mettre à jour le profil fiscal avec toutes les données du questionnaire
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
        console.log("[Simulation] Also updated fiscal profile");

        // Sauvegarde réussie - nettoyer le localStorage et sessionStorage immédiatement
        // pour éviter que les données soient réutilisées par un autre utilisateur
        localStorage.removeItem(PENDING_SIMULATION_KEY);
        sessionStorage.removeItem(SESSION_ID_KEY);
        console.log("[Simulation] Saved to DB and cleaned localStorage for user:", effectiveUserId, "id:", data.id, "tax_gain:", data.tax_gain);
        setSaveSuccess(true);
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
    console.log("[AuthSuccess] Called with userId:", userId);
    console.log("[AuthSuccess] Current state - auditResult:", !!auditResult, "auditData:", !!auditData, "sessionId:", simulationSessionId);

    setShowAuthModal(false);
    // Après inscription/connexion, sauvegarder automatiquement avec le userId passé
    // Mode silent car on redirige vers le dashboard juste après
    try {
      await saveSimulationToDb(userId, true);
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
