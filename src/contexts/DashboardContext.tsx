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
import type { TaxSimulation, Document } from "@/lib/supabase/types";
import { saveSimulation, type SimulationData } from "@/lib/supabase/simulations";

// Utiliser localStorage pour persister même après fermeture du navigateur
const PENDING_SIMULATION_KEY = "kivio_pending_simulation";

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
  transfers: Transfer[];
  conformityScore: number;
  documents: {
    receipts: boolean;
    parentalLink: boolean;
    needAttestation: boolean;
  };
  loading: boolean;
  syncing: boolean;
}

interface DashboardContextType extends DashboardState {
  refreshData: () => Promise<void>;
  addTransfer: (transfer: Omit<Transfer, "id">) => void;
  updateConformityScore: () => void;
  setDocumentUploaded: (type: keyof DashboardState["documents"]) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    simulation: null,
    transfers: [],
    conformityScore: 20,
    documents: {
      receipts: false,
      parentalLink: false,
      needAttestation: false,
    },
    loading: true,
    syncing: false,
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

  // Vérifier et sauvegarder une simulation en attente dans localStorage
  const checkAndSavePendingSimulation = useCallback(async (userId: string): Promise<TaxSimulation | null> => {
    const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
    console.log("[Dashboard] Checking for pending simulation in localStorage, found:", !!pending);

    if (!pending) return null;

    try {
      const simulationData = JSON.parse(pending) as SimulationData;
      console.log("[Dashboard] Found pending simulation data:", {
        monthlySent: simulationData.monthlySent,
        gain: simulationData.result?.gain,
        eligible: simulationData.eligible
      });

      const { data, error } = await saveSimulation(userId, simulationData);

      if (error) {
        console.error("[Dashboard] Error saving pending simulation:", error);
        // Même si la sauvegarde échoue, on crée un objet simulation temporaire pour l'affichage
        // L'utilisateur pourra refaire une simulation plus tard
        const tempSimulation: TaxSimulation = {
          id: "temp-" + Date.now(),
          user_id: userId,
          monthly_sent: simulationData.monthlySent || 0,
          annual_deduction: simulationData.result?.annualDeduction || 0,
          beneficiary_type: simulationData.beneficiaryType || "parents",
          is_married: simulationData.isMarried ?? false,
          children_count: simulationData.childrenCount || 0,
          annual_income: simulationData.annualIncome || 0,
          tax_gain: simulationData.result?.gain || 0,
          tmi: simulationData.result?.tmi || 0,
          tax_before: simulationData.result?.taxBefore || 0,
          tax_after: simulationData.result?.taxAfter || 0,
          fiscal_parts: simulationData.result?.parts || 1,
          is_eligible: simulationData.eligible ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("[Dashboard] Using temporary simulation for display:", tempSimulation.tax_gain);
        // On ne nettoie pas localStorage pour réessayer plus tard
        return tempSimulation;
      }

      // Vérifier que les données sont bien dans la base avant de nettoyer localStorage
      const { data: verifyData } = await supabase
        .from("tax_simulations")
        .select("id, tax_gain")
        .eq("id", data?.id)
        .single();

      if (verifyData && verifyData.tax_gain === data?.tax_gain) {
        // Nettoyer après confirmation de sauvegarde réussie
        localStorage.removeItem(PENDING_SIMULATION_KEY);
        console.log("[Dashboard] Verified and saved pending simulation:", data?.id, "tax_gain:", data?.tax_gain);
      } else {
        console.warn("[Dashboard] Saved but verification failed, keeping localStorage");
      }

      return data;
    } catch (e) {
      console.error("[Dashboard] Error parsing pending simulation:", e);
      localStorage.removeItem(PENDING_SIMULATION_KEY);
      return null;
    }
  }, [supabase]);

  // Charger les données du dashboard (uniquement depuis la DB)
  const refreshData = useCallback(async () => {
    if (!user) return;

    // Vérifier que c'est bien le bon utilisateur
    const currentUser = user.id;
    console.log("[Dashboard] Chargement des données pour:", currentUser, "email:", user.email);

    // Vérifier que le ref correspond bien à l'utilisateur actuel
    if (currentUserId.current && currentUserId.current !== currentUser) {
      console.warn("[Dashboard] User ID changed during refresh!", {
        expected: currentUserId.current,
        got: currentUser
      });
    }

    setState(prev => ({ ...prev, syncing: true }));

    try {
      // 1. D'ABORD charger la simulation depuis la DB pour CET utilisateur
      const { data: simulations, error: simError } = await supabase
        .from("tax_simulations")
        .select("*")
        .eq("user_id", currentUser)
        .order("created_at", { ascending: false })
        .limit(1);

      if (simError) {
        console.error("[Dashboard] Erreur chargement simulation:", simError);
      }

      let simulation = simulations?.[0] || null;

      // 2. SEULEMENT si l'utilisateur n'a PAS de simulation dans la DB,
      // vérifier s'il y a une simulation en attente dans localStorage
      // Cela évite qu'un utilisateur existant récupère les données d'un autre utilisateur
      if (!simulation) {
        console.log("[Dashboard] Aucune simulation en DB, vérification du localStorage...");
        const pendingSaved = await checkAndSavePendingSimulation(currentUser);
        if (pendingSaved) {
          simulation = pendingSaved;
        }
      } else {
        // L'utilisateur a déjà des données en DB, on nettoie le localStorage
        // car il pourrait contenir des données d'un autre utilisateur
        const pending = localStorage.getItem(PENDING_SIMULATION_KEY);
        if (pending) {
          console.log("[Dashboard] Utilisateur existant avec données en DB, nettoyage du localStorage");
          localStorage.removeItem(PENDING_SIMULATION_KEY);
        }
      }

      // Double vérification: s'assurer que la simulation appartient bien à l'utilisateur
      if (simulation && simulation.user_id !== currentUser) {
        console.error("[Dashboard] ERREUR: Simulation ne correspond pas à l'utilisateur!", {
          expected: currentUser,
          got: simulation.user_id
        });
        setState(prev => ({ ...prev, loading: false, syncing: false, simulation: null }));
        return;
      }

      console.log("[Dashboard] Simulation chargée:", simulation?.id, "gain:", simulation?.tax_gain);

      // 2. Charger les documents
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

      setState({
        simulation,
        transfers,
        conformityScore,
        documents: docs,
        loading: false,
        syncing: false,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setState(prev => ({ ...prev, loading: false, syncing: false }));
    }
  }, [user, supabase, calculateConformityScore, checkAndSavePendingSimulation]);

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
        transfers: [],
        conformityScore: 20,
        documents: {
          receipts: false,
          parentalLink: false,
          needAttestation: false,
        },
        loading: true,
        syncing: false,
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
        transfers: [],
        conformityScore: 20,
        documents: {
          receipts: false,
          parentalLink: false,
          needAttestation: false,
        },
        loading: true,
        syncing: false,
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
