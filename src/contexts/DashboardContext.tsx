"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { TaxSimulation, Document, Profile, Receipt, IdentityDocument, TaxCalculation } from "@/lib/supabase/types";
import { saveSimulation, type SimulationData } from "@/lib/supabase/simulations";
import { toast } from "sonner";
import { getFiscalProfile } from "@/lib/supabase/fiscal-profile";

// Analysis status type
export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "calculating" | "complete" | "error";

// Tax calculation summary from API
export interface TaxCalculationSummary {
  totalReceipts: number;
  totalAmountSent: number;
  totalFees: number;
  totalDeductible: number;
  taxReduction: number;
  tmiRate: number;
  matchedRelations: { relation: string; label: string; count: number }[];
  pendingReviewCount: number;
  rejectedCount: number;
}

// Utiliser localStorage pour persister même après fermeture du navigateur
const PENDING_SIMULATION_KEY = "kivio_pending_simulation";
// Clé pour le sessionId dans sessionStorage (effacé à la fermeture du navigateur)
const SESSION_ID_KEY = "kivio_simulation_session_id";
// Durée de validité d'une simulation en localStorage (24 heures en millisecondes)
const SIMULATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface Transfer {
  id: string;
  date: string;
  beneficiary: string;
  method: "wave" | "taptap" | "western_union" | "virement" | "other";
  amountOriginal: number;
  currency: string;
  amountEur: number;
  status: "validated" | "pending" | "rejected";
  receiptUrl?: string;
}

export interface DashboardState {
  simulation: TaxSimulation | null;
  fiscalProfile: Profile | null;
  estimatedRecovery: number;
  transfers: Transfer[];
  conformityScore: number;
  documents: {
    receipts: boolean;
    parentalLink: boolean;
    needAttestation: boolean;
  };
  loading: boolean;
  syncing: boolean;
  // New fields for document analysis
  receipts: Receipt[];
  identityDocument: IdentityDocument | null;
  taxCalculation: TaxCalculation | null;
  taxCalculationSummary: TaxCalculationSummary | null;
  analysisStatus: AnalysisStatus;
}

interface DashboardContextType extends DashboardState {
  refreshData: () => Promise<void>;
  addTransfer: (transfer: Omit<Transfer, "id">) => void;
  updateConformityScore: () => void;
  setDocumentUploaded: (type: keyof DashboardState["documents"]) => void;
  // New methods for document analysis
  addReceipt: (receipt: Receipt) => void;
  setIdentityDocument: (doc: IdentityDocument) => void;
  runTaxCalculation: () => Promise<void>;
  setAnalysisStatus: (status: AnalysisStatus) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    simulation: null,
    fiscalProfile: null,
    estimatedRecovery: 0,
    transfers: [],
    conformityScore: 20,
    documents: {
      receipts: false,
      parentalLink: false,
      needAttestation: false,
    },
    loading: true,
    syncing: false,
    // New fields
    receipts: [],
    identityDocument: null,
    taxCalculation: null,
    taxCalculationSummary: null,
    analysisStatus: "idle",
  });

  const currentUserId = useRef<string | null>(null);
  const supabase = createClient();

  // Calculer le score de conformité
  const calculateConformityScore = useCallback((docs: DashboardState["documents"], transferCount: number) => {
    let score = 20; // Base score
    if (docs.receipts || transferCount > 0) score += 30;
    if (docs.parentalLink) score += 25;
    if (docs.needAttestation) score += 25;
    return Math.min(100, score);
  }, []);

  // Sauvegarder une simulation en attente (localStorage) vers Supabase
  const savePendingSimulation = useCallback(async (userId: string): Promise<TaxSimulation | null> => {
    const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
    if (!pending) return null;

    try {
      const simulationData = JSON.parse(pending) as SimulationData & { createdAt?: number };

      // Vérifier expiration (24h)
      if (simulationData.createdAt && Date.now() - simulationData.createdAt > SIMULATION_EXPIRY_MS) {
        console.log("[Dashboard] Pending simulation expired");
        localStorage.removeItem(PENDING_SIMULATION_KEY);
        return null;
      }

      console.log("[Dashboard] Saving pending simulation:", { gain: simulationData.result?.gain });

      const { data, error } = await saveSimulation(userId, simulationData);

      if (error || !data) {
        console.error("[Dashboard] Failed to save simulation:", error);
        return null;
      }

      // Sauvegarde réussie - nettoyer localStorage
      localStorage.removeItem(PENDING_SIMULATION_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      console.log("[Dashboard] Simulation saved to Supabase:", data.id);

      return data;
    } catch (e) {
      console.error("[Dashboard] Error saving pending simulation:", e);
      return null;
    }
  }, []);

  // Charger les données du dashboard depuis Supabase
  const refreshData = useCallback(async () => {
    if (!user) return;

    const currentUser = user.id;
    console.log("[Dashboard] Loading data for user:", currentUser);

    setState(prev => ({ ...prev, syncing: true }));

    try {
      // 1. Charger le profil fiscal de l'utilisateur (source principale)
      const { data: fiscalProfile, error: profileError } = await getFiscalProfile(currentUser);

      if (profileError) {
        console.error("[Dashboard] Error loading fiscal profile:", profileError);
      }

      console.log("[Dashboard] Fiscal profile:", fiscalProfile ? `estimated_recovery=${fiscalProfile.estimated_recovery}` : "none");

      // 2. Charger les simulations (pour compatibilité et historique)
      const { data: simulations, error: simError } = await supabase
        .from("tax_simulations")
        .select("*")
        .eq("user_id", currentUser)
        .order("created_at", { ascending: false })
        .limit(1);

      if (simError) {
        console.error("[Dashboard] Error loading simulation:", simError);
      }

      let simulation = simulations?.[0] || null;
      console.log("[Dashboard] Simulation:", simulation ? `id=${simulation.id}, gain=${simulation.tax_gain}` : "none");

      // 3. Si pas de simulation en DB, essayer de sauvegarder depuis localStorage
      if (!simulation) {
        console.log("[Dashboard] No simulation in DB, checking localStorage...");
        const saved = await savePendingSimulation(currentUser);
        if (saved) {
          simulation = saved;
          toast.success("Simulation sauvegardée");
        }
      } else {
        // Nettoyer localStorage si on a des données en DB
        localStorage.removeItem(PENDING_SIMULATION_KEY);
      }

      // 4. Déterminer le montant estimé à afficher
      // Priorité: profil fiscal > simulation > 0
      const estimatedRecovery = fiscalProfile?.estimated_recovery || simulation?.tax_gain || 0;
      console.log("[Dashboard] Final estimated recovery:", estimatedRecovery);

      // 5. Charger les documents
      const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);

      const docs = {
        receipts: documents?.some((d: Document) => d.file_type === "receipt") || false,
        parentalLink: documents?.some((d: Document) => d.file_type === "parental_link") || false,
        needAttestation: documents?.some((d: Document) => d.file_type === "need_attestation") || false,
      };

      const transfers: Transfer[] = documents
        ?.filter((d: Document) => d.file_type === "receipt" && d.ocr_data)
        .map((d: Document) => ({
          id: d.id,
          date: d.transfer_date || d.created_at,
          beneficiary: (d.ocr_data as any)?.beneficiary || "Non spécifié",
          method: (d.provider?.toLowerCase() as Transfer["method"]) || "other",
          amountOriginal: d.amount || 0,
          currency: (d.ocr_data as any)?.currency || "EUR",
          amountEur: d.amount || 0,
          status: d.ocr_status === "completed" ? "validated" : "pending",
          receiptUrl: d.file_url,
        })) || [];

      const conformityScore = calculateConformityScore(docs, transfers.length);

      setState(prev => ({
        ...prev,
        simulation,
        fiscalProfile,
        estimatedRecovery,
        transfers,
        conformityScore,
        documents: docs,
        loading: false,
        syncing: false,
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setState(prev => ({ ...prev, loading: false, syncing: false }));
    }
  }, [user, supabase, calculateConformityScore, savePendingSimulation]);

  // Ajouter un transfert
  const addTransfer = useCallback((transfer: Omit<Transfer, "id">) => {
    const newTransfer: Transfer = {
      ...transfer,
      id: crypto.randomUUID(),
    };

    setState(prev => {
      const newTransfers = [...prev.transfers, newTransfer];
      const newDocs = { ...prev.documents, receipts: true };
      return {
        ...prev,
        transfers: newTransfers,
        documents: newDocs,
        conformityScore: calculateConformityScore(newDocs, newTransfers.length),
      };
    });
  }, [calculateConformityScore]);

  // Mettre à jour le score de conformité
  const updateConformityScore = useCallback(() => {
    setState(prev => ({
      ...prev,
      conformityScore: calculateConformityScore(prev.documents, prev.transfers.length),
    }));
  }, [calculateConformityScore]);

  // Marquer un document comme uploadé
  const setDocumentUploaded = useCallback((type: keyof DashboardState["documents"]) => {
    setState(prev => {
      const newDocs = { ...prev.documents, [type]: true };
      return {
        ...prev,
        documents: newDocs,
        conformityScore: calculateConformityScore(newDocs, prev.transfers.length),
      };
    });
  }, [calculateConformityScore]);

  // Add a new receipt to the list
  const addReceipt = useCallback((receipt: Receipt) => {
    setState(prev => {
      const newReceipts = [...prev.receipts, receipt];
      const newDocs = { ...prev.documents, receipts: true };
      return {
        ...prev,
        receipts: newReceipts,
        documents: newDocs,
        conformityScore: calculateConformityScore(newDocs, prev.transfers.length),
      };
    });
  }, [calculateConformityScore]);

  // Set the identity document
  const setIdentityDocument = useCallback((doc: IdentityDocument) => {
    setState(prev => {
      const newDocs = { ...prev.documents, parentalLink: true };
      return {
        ...prev,
        identityDocument: doc,
        documents: newDocs,
        conformityScore: calculateConformityScore(newDocs, prev.transfers.length),
      };
    });
  }, [calculateConformityScore]);

  // Set analysis status
  const setAnalysisStatus = useCallback((status: AnalysisStatus) => {
    setState(prev => ({ ...prev, analysisStatus: status }));
  }, []);

  // Run tax calculation
  const runTaxCalculation = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, analysisStatus: "calculating" }));

    try {
      const response = await fetch("/api/calculate-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYear: new Date().getFullYear() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du calcul");
      }

      setState(prev => ({
        ...prev,
        taxCalculation: data.taxCalculation,
        taxCalculationSummary: data.summary,
        analysisStatus: "complete",
        // Update estimated recovery with tax reduction
        estimatedRecovery: data.summary.taxReduction || prev.estimatedRecovery,
      }));

      toast.success("Calcul terminé !", {
        description: `Réduction d'impôt estimée: ${data.summary.taxReduction}€`,
      });
    } catch (error) {
      console.error("[Dashboard] Tax calculation error:", error);
      setState(prev => ({ ...prev, analysisStatus: "error" }));
      toast.error("Erreur lors du calcul", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    }
  }, [user]);

  // Flag pour savoir si le composant vient d'être monté
  const isInitialMount = useRef(true);

  // Charger les données quand l'utilisateur change ou au montage initial
  useEffect(() => {
    // Si pas d'utilisateur, reset l'état complet
    if (!user) {
      console.log("[Dashboard] No user - resetting state");
      currentUserId.current = null;
      isInitialMount.current = true;
      setState({
        simulation: null,
        fiscalProfile: null,
        estimatedRecovery: 0,
        transfers: [],
        conformityScore: 20,
        documents: {
          receipts: false,
          parentalLink: false,
          needAttestation: false,
        },
        loading: true,
        syncing: false,
        receipts: [],
        identityDocument: null,
        taxCalculation: null,
        taxCalculationSummary: null,
        analysisStatus: "idle",
      });
      return;
    }

    // Si c'est un nouvel utilisateur OU le montage initial, charger les données
    const shouldRefresh = currentUserId.current !== user.id || isInitialMount.current;

    if (shouldRefresh) {
      console.log("[Dashboard] Loading data:", {
        reason: isInitialMount.current ? "initial mount" : "user changed",
        from: currentUserId.current,
        to: user.id,
        email: user.email
      });

      // IMPORTANT: Reset l'état AVANT de charger les nouvelles données
      // pour éviter d'afficher les données de l'ancien utilisateur
      setState({
        simulation: null,
        fiscalProfile: null,
        estimatedRecovery: 0,
        transfers: [],
        conformityScore: 20,
        documents: {
          receipts: false,
          parentalLink: false,
          needAttestation: false,
        },
        loading: true,
        syncing: false,
        receipts: [],
        identityDocument: null,
        taxCalculation: null,
        taxCalculationSummary: null,
        analysisStatus: "idle",
      });

      currentUserId.current = user.id;
      isInitialMount.current = false;
      refreshData();
    }
  }, [user, refreshData]);

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        refreshData,
        addTransfer,
        updateConformityScore,
        setDocumentUploaded,
        addReceipt,
        setIdentityDocument,
        runTaxCalculation,
        setAnalysisStatus,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
