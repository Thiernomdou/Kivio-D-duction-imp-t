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
import { getFiscalProfile, saveFiscalProfile } from "@/lib/supabase/fiscal-profile";
import { formatCurrency } from "@/lib/tax-calculator";
import { hasUserPaidForYear } from "@/lib/supabase/orders";
import { TESTING_MODE_BYPASS_PAYWALL } from "@/lib/admin-config";

// Analysis status type
export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "calculating" | "complete" | "error";

// Tax calculation summary from API (version payante - données complètes)
export interface TaxCalculationSummary {
  receiptsCount: number;
  totalAmountSent?: number;
  totalFees?: number;
  totalDeductible?: number;
  taxReduction?: number;
  estimatedTaxReduction?: number; // Version gratuite - approximatif
  tmiRate: number;
  matchedRelations?: { relation: string; label: string; count: number }[];
  pendingReviewCount?: number;
  rejectedCount?: number;
}

// Case 6GU info (uniquement si payé)
export interface Case6GUInfo {
  amount: number;
  instruction: string;
}

// Paywall info
export interface PaywallInfo {
  price: number;
  currency: string;
  features: string[];
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
  // Tax result modal state
  showTaxResultModal: boolean;
  // Paywall state
  hasPaid: boolean;
  case6GU: Case6GUInfo | null;
  paywall: PaywallInfo | null;
  pdfPath: string | null;
  checkoutLoading: boolean;
  bypassLoading: boolean;
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
  // Tax result modal controls
  openTaxResultModal: () => void;
  closeTaxResultModal: () => void;
  // Paywall / Checkout
  startCheckout: () => Promise<void>;
  // Admin bypass
  adminBypass: () => Promise<void>;
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
    showTaxResultModal: false,
    // Paywall state
    hasPaid: false,
    case6GU: null,
    paywall: null,
    pdfPath: null,
    checkoutLoading: false,
    bypassLoading: false,
  });

  const currentUserId = useRef<string | null>(null);
  const supabase = createClient();

  // Calculer le score de conformité
  // Basé uniquement sur : reçus uploadés + attestation de besoin (recommandé)
  // Le lien de parenté est maintenant basé sur attestation sur l'honneur lors de l'upload
  const calculateConformityScore = useCallback((docs: DashboardState["documents"], transferCount: number) => {
    let score = 20; // Base score (situation fiscale renseignée via questionnaire)
    if (docs.receipts || transferCount > 0) score += 50; // Reçus uploadés
    if (docs.needAttestation) score += 30; // Attestation de besoin (recommandé)
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

      // Aussi mettre à jour le profil fiscal
      await saveFiscalProfile(userId, {
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
      console.log("[Dashboard] Also updated fiscal profile");

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

    // Start syncing without blocking the UI
    setState(prev => ({ ...prev, syncing: true, loading: false }));

    try {
      const currentYear = new Date().getFullYear();

      // Fetch all independent data in parallel for faster loading
      const [
        fiscalProfileResult,
        simulationsResult,
        documentsResult,
        receiptsResult,
        taxCalcResult,
        paymentResult
      ] = await Promise.all([
        // 1. Profil fiscal
        getFiscalProfile(currentUser),
        // 2. Simulations
        supabase.from("tax_simulations").select("*").eq("user_id", currentUser).order("created_at", { ascending: false }).limit(1),
        // 3. Documents
        supabase.from("documents").select("*").eq("user_id", currentUser),
        // 4. Reçus
        supabase.from("receipts").select("*").eq("user_id", currentUser).eq("tax_year", currentYear),
        // 5. Tax calculation
        supabase.from("tax_calculations").select("*").eq("user_id", currentUser).eq("tax_year", currentYear).maybeSingle(),
        // 6. Payment status
        hasUserPaidForYear(currentUser, currentYear)
      ]);

      const { data: fiscalProfile, error: profileError } = fiscalProfileResult;
      const { data: simulations, error: simError } = simulationsResult;
      const { data: documents } = documentsResult;
      const { data: receiptsData } = receiptsResult;
      const { data: taxCalcData } = taxCalcResult;
      // En mode test, tout le monde a accès gratuitement
      const hasPaid = TESTING_MODE_BYPASS_PAYWALL || paymentResult.hasPaid;
      const order = paymentResult.order;

      if (profileError) {
        console.error("[Dashboard] Error loading fiscal profile:", profileError);
      }
      if (simError) {
        console.error("[Dashboard] Error loading simulation:", simError);
      }

      console.log("[Dashboard] Fiscal profile:", fiscalProfile ? `estimated_recovery=${fiscalProfile.estimated_recovery}` : "none");

      let simulation = simulations?.[0] || null;
      console.log("[Dashboard] Simulation:", simulation ? `id=${simulation.id}, gain=${simulation.tax_gain}` : "none");

      // Variable pour stocker le profil fiscal final
      let finalFiscalProfile = fiscalProfile;

      // 3. Vérifier s'il y a des données dans localStorage (source de vérité la plus récente)
      const pendingData = localStorage.getItem(PENDING_SIMULATION_KEY);
      if (pendingData) {
        try {
          const parsedPending = JSON.parse(pendingData);
          console.log("[Dashboard] Found pending data in localStorage:", {
            gain: parsedPending.result?.gain,
            monthlySent: parsedPending.monthlySent,
            annualIncome: parsedPending.annualIncome,
            tmi: parsedPending.result?.tmi
          });

          // Vérifier que les données sont valides et non expirées
          const isExpired = parsedPending.createdAt && (Date.now() - parsedPending.createdAt > SIMULATION_EXPIRY_MS);

          if (!isExpired && parsedPending.monthlySent !== undefined) {
            console.log("[Dashboard] Using localStorage data as primary source");

            // Créer le profil fiscal depuis localStorage (toujours utiliser les données les plus récentes)
            finalFiscalProfile = {
              id: currentUser,
              email: fiscalProfile?.email || "",
              full_name: fiscalProfile?.full_name || null,
              phone: fiscalProfile?.phone || null,
              monthly_amount: parsedPending.monthlySent || 0,
              beneficiary_type: parsedPending.beneficiaryType || "parents",
              expense_type: parsedPending.expenseType || "alimentary",
              is_married: parsedPending.isMarried || false,
              children_count: parsedPending.childrenCount || 0,
              annual_income: parsedPending.annualIncome || 0,
              spouse_income: null,
              tmi: parsedPending.result?.tmi || 0,
              estimated_recovery: parsedPending.result?.gain || 0,
              fiscal_parts: parsedPending.result?.parts || null,
              tax_before: parsedPending.result?.taxBefore || null,
              tax_after: parsedPending.result?.taxAfter || null,
              created_at: fiscalProfile?.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Essayer de sauvegarder en DB en arrière-plan (ne bloque pas l'affichage)
            savePendingSimulation(currentUser).then(saved => {
              if (saved) {
                console.log("[Dashboard] Async save to DB completed");
                // Nettoyer localStorage après sauvegarde réussie
                localStorage.removeItem(PENDING_SIMULATION_KEY);
              }
            }).catch(e => {
              console.error("[Dashboard] Async save failed:", e);
            });
          } else if (isExpired) {
            console.log("[Dashboard] localStorage data expired, clearing");
            localStorage.removeItem(PENDING_SIMULATION_KEY);
          }
        } catch (e) {
          console.error("[Dashboard] Error parsing localStorage:", e);
          localStorage.removeItem(PENDING_SIMULATION_KEY);
        }
      }

      // 4. Déterminer le montant estimé à afficher
      // Priorité: profil fiscal > simulation > 0
      const estimatedRecovery = finalFiscalProfile?.estimated_recovery || simulation?.tax_gain || 0;
      console.log("[Dashboard] Final estimated recovery:", estimatedRecovery);

      // Documents already loaded in parallel above
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

      // Receipts, tax calculation, and payment status already loaded in parallel above
      const loadedReceipts = (receiptsData || []) as Receipt[];
      console.log("[Dashboard] Loaded receipts:", loadedReceipts.length);
      console.log("[Dashboard] Payment status:", hasPaid ? "PAID" : "FREE");

      // Reconstruire le taxCalculationSummary si des données existent
      let taxCalcSummary: TaxCalculationSummary | null = null;
      let case6GUInfo: Case6GUInfo | null = null;
      let pdfPathValue: string | null = null;

      if (taxCalcData || loadedReceipts.length > 0) {
        // RÈGLE FISCALE IMPORTANTE:
        // Le TMI au 31 décembre s'applique à TOUS les transferts de l'année.
        // Donc on utilise TOUJOURS le TMI actuel du profil fiscal, pas celui en cache.
        const currentTmiRate = finalFiscalProfile?.tmi || simulation?.tmi || 30;

        // Calculer les totaux à partir des reçus (montants fixes)
        let totalAmountSent = 0;
        let totalFees = 0;
        let totalDeductible = 0;

        for (const receipt of loadedReceipts) {
          const amountEur = receipt.amount_eur || 0;
          const fees = receipt.fees || 0;
          totalAmountSent += amountEur;
          totalFees += fees;
          totalDeductible += amountEur + fees;
        }

        // Recalculer la réduction d'impôt avec le TMI ACTUEL (pas le cache)
        const taxReduction = Math.round(totalDeductible * (currentTmiRate / 100) * 100) / 100;

        console.log("[Dashboard] TMI calculation:", {
          currentTmiRate,
          cachedTmiRate: taxCalcData?.tmi_rate,
          totalDeductible,
          taxReduction,
        });

        // Toujours utiliser le TMI actuel pour la réduction d'impôt
        taxCalcSummary = {
          receiptsCount: taxCalcData?.total_receipts || loadedReceipts.length,
          totalAmountSent: hasPaid ? totalAmountSent : undefined,
          totalFees: hasPaid ? totalFees : undefined,
          totalDeductible: hasPaid ? totalDeductible : undefined,
          // IMPORTANT: Toujours recalculer avec le TMI actuel
          taxReduction: hasPaid ? taxReduction : undefined,
          estimatedTaxReduction: !hasPaid ? taxReduction : undefined,
          tmiRate: currentTmiRate, // TMI actuel du profil, pas du cache
        };

        if (hasPaid) {
          case6GUInfo = {
            amount: Math.round(totalDeductible * 100) / 100,
            instruction: "Reportez ce montant dans la case 6GU de votre déclaration de revenus.",
          };
          pdfPathValue = order?.pdf_path || taxCalcData?.pdf_path || null;
        }

        console.log("[Dashboard] Restored taxCalculationSummary with current TMI:", taxCalcSummary);
      }

      // Mettre à jour docs.receipts si des reçus existent dans la table receipts
      if (loadedReceipts.length > 0) {
        docs.receipts = true;
      }

      const conformityScore = calculateConformityScore(docs, transfers.length + loadedReceipts.length);

      setState(prev => ({
        ...prev,
        simulation,
        fiscalProfile: finalFiscalProfile,
        estimatedRecovery,
        transfers,
        conformityScore,
        documents: docs,
        // Restaurer les données des reçus et calculs
        receipts: loadedReceipts,
        taxCalculation: taxCalcData || null,
        taxCalculationSummary: taxCalcSummary,
        analysisStatus: taxCalcSummary ? "complete" : "idle",
        hasPaid,
        case6GU: case6GUInfo,
        pdfPath: pdfPathValue,
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
  // Note: Cette fonction est conservée pour compatibilité mais n'est plus utilisée
  // Le lien de parenté est maintenant basé sur attestation sur l'honneur
  const setIdentityDocument = useCallback((doc: IdentityDocument) => {
    setState(prev => ({
      ...prev,
      identityDocument: doc,
    }));
  }, []);

  // Set analysis status
  const setAnalysisStatus = useCallback((status: AnalysisStatus) => {
    setState(prev => ({ ...prev, analysisStatus: status }));
  }, []);

  // Tax result modal controls
  const openTaxResultModal = useCallback(() => {
    setState(prev => ({ ...prev, showTaxResultModal: true }));
  }, []);

  const closeTaxResultModal = useCallback(() => {
    setState(prev => ({ ...prev, showTaxResultModal: false }));
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

      // Déterminer le montant de réduction (exact si payé, estimé sinon)
      const taxReduction = data.hasPaid
        ? data.summary.taxReduction
        : data.summary.estimatedTaxReduction;

      // Recharger les receipts depuis la DB pour avoir les données à jour
      const { data: updatedReceipts } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", user.id)
        .eq("tax_year", new Date().getFullYear())
        .order("created_at", { ascending: false });

      setState(prev => ({
        ...prev,
        taxCalculation: data.taxCalculation || null,
        taxCalculationSummary: data.summary,
        analysisStatus: "complete",
        estimatedRecovery: taxReduction || prev.estimatedRecovery,
        showTaxResultModal: true,
        // Mettre à jour les receipts avec les données fraîches
        receipts: updatedReceipts || prev.receipts,
        // Paywall state
        hasPaid: data.hasPaid || false,
        case6GU: data.case6GU || null,
        paywall: data.paywall || null,
        pdfPath: data.pdfPath || null,
      }));

      if (data.hasPaid) {
        toast.success("Calcul terminé !", {
          description: `Réduction d'impôt: ${formatCurrency(taxReduction || 0)}`,
        });
      } else {
        toast.success("Analyse terminée !", {
          description: `Réduction estimée: ~${formatCurrency(taxReduction || 0)}`,
        });
      }
    } catch (error) {
      console.error("[Dashboard] Tax calculation error:", error);
      setState(prev => ({ ...prev, analysisStatus: "error" }));
      toast.error("Erreur lors du calcul", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    }
  }, [user, supabase]);

  // Start checkout process
  const startCheckout = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, checkoutLoading: true }));

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYear: new Date().getFullYear() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du checkout");
      }

      // Rediriger vers la page de checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("[Dashboard] Checkout error:", error);
      setState(prev => ({ ...prev, checkoutLoading: false }));
      toast.error("Erreur lors du paiement", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    }
  }, [user]);

  // Admin bypass - débloquer sans payer (mode test)
  const adminBypass = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, bypassLoading: true }));

    try {
      const response = await fetch("/api/admin/bypass-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYear: new Date().getFullYear() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du déblocage");
      }

      // Mettre à jour l'état
      setState(prev => ({
        ...prev,
        hasPaid: true,
        bypassLoading: false,
      }));

      toast.success("Accès débloqué !", {
        description: data.alreadyPaid
          ? "Vous aviez déjà accès à ce dossier."
          : "Mode test - Paiement simulé avec succès.",
      });

      // Relancer le calcul pour obtenir les données complètes
      await runTaxCalculation();
    } catch (error) {
      console.error("[Dashboard] Admin bypass error:", error);
      setState(prev => ({ ...prev, bypassLoading: false }));
      toast.error("Erreur lors du déblocage", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    }
  }, [user, runTaxCalculation]);

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
        showTaxResultModal: false,
        hasPaid: false,
        case6GU: null,
        paywall: null,
        pdfPath: null,
        checkoutLoading: false,
        bypassLoading: false,
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
        showTaxResultModal: false,
        hasPaid: false,
        case6GU: null,
        paywall: null,
        pdfPath: null,
        checkoutLoading: false,
        bypassLoading: false,
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
        openTaxResultModal,
        closeTaxResultModal,
        startCheckout,
        adminBypass,
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
