"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { TaxSimulation } from "@/lib/supabase/types";

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
  });

  const supabase = createClient();

  // Calculer le score de conformité
  const calculateConformityScore = useCallback((docs: DashboardState["documents"], transferCount: number) => {
    let score = 20; // Base score
    if (docs.receipts || transferCount > 0) score += 30;
    if (docs.parentalLink) score += 25;
    if (docs.needAttestation) score += 25;
    return Math.min(100, score);
  }, []);

  // Charger les données du dashboard
  const refreshData = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Charger la dernière simulation
      const { data: simulations } = await supabase
        .from("tax_simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const simulation = simulations?.[0] || null;

      // Charger les documents (pour vérifier ce qui a été uploadé)
      const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);

      // Déterminer quels documents ont été uploadés
      const docs = {
        receipts: documents?.some(d => d.file_type === "receipt") || false,
        parentalLink: documents?.some(d => d.file_type === "parental_link") || false,
        needAttestation: documents?.some(d => d.file_type === "need_attestation") || false,
      };

      // Transformer les documents en transferts (si applicable)
      const transfers: Transfer[] = documents
        ?.filter(d => d.file_type === "receipt" && d.ocr_data)
        .map(d => ({
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
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setState(prev => ({ ...prev, loading: false }));
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

  // Charger les données au montage
  useEffect(() => {
    if (user) {
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
