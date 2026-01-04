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
      // 1. Charger la simulation depuis la DB uniquement pour CET utilisateur
      const { data: simulations, error: simError } = await supabase
        .from("tax_simulations")
        .select("*")
        .eq("user_id", currentUser)
        .order("created_at", { ascending: false })
        .limit(1);

      if (simError) {
        console.error("[Dashboard] Erreur chargement simulation:", simError);
      }

      // Double vérification: s'assurer que la simulation appartient bien à l'utilisateur
      const simulation = simulations?.[0];
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
  }, [user, supabase, calculateConformityScore]);

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

  // Charger les données quand l'utilisateur change
  useEffect(() => {
    // Si pas d'utilisateur, reset l'état complet
    if (!user) {
      console.log("[Dashboard] No user - resetting state");
      currentUserId.current = null;
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

    // Si c'est un nouvel utilisateur, reset ET charger ses données
    if (currentUserId.current !== user.id) {
      console.log("[Dashboard] User changed:", {
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
