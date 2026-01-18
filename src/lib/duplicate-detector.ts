/**
 * Détection de doublons pour les reçus de transfert
 *
 * Un reçu est considéré comme doublon s'il a :
 * - Le même montant (amount_sent)
 * - La même date de transfert (transfer_date)
 * - Le même bénéficiaire (receiver_name) - avec matching flou
 * - Optionnellement le même provider
 */

import type { Receipt } from "@/lib/supabase/types";

/**
 * Normalise un nom pour la comparaison :
 * - Minuscules
 * - Supprime les accents
 * - Supprime les espaces multiples
 * - Trim
 */
function normalizeName(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\s+/g, " ") // Remplace espaces multiples par un seul
    .trim();
}

/**
 * Calcule la similarité entre deux chaînes (algorithme de Levenshtein simplifié)
 * Retourne un score entre 0 et 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeName(str1);
  const s2 = normalizeName(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Utilise la distance de Levenshtein
  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length][s2.length];
  return 1 - distance / maxLength;
}

/**
 * Normalise une date au format YYYY-MM-DD
 */
function normalizeDate(date: string | null): string | null {
  if (!date) return null;

  // Essaie de parser la date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return null;

  // Retourne au format YYYY-MM-DD
  return parsed.toISOString().split("T")[0];
}

/**
 * Configuration pour la détection de doublons
 */
interface DuplicateConfig {
  /** Seuil de similarité pour les noms (0-1, défaut: 0.85) */
  nameSimilarityThreshold?: number;
  /** Tolérance sur le montant en % (défaut: 0.01 = 1%) */
  amountTolerance?: number;
}

/**
 * Résultat de la détection de doublon
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchingReceipt: Receipt | null;
  confidence: number;
  reasons: string[];
}

/**
 * Données extraites du nouveau reçu à vérifier
 */
export interface NewReceiptData {
  amount_sent: number | null;
  transfer_date: string | null;
  receiver_name: string | null;
  provider: string | null;
  currency: string | null;
}

/**
 * Vérifie si un nouveau reçu est un doublon d'un reçu existant
 */
export function checkForDuplicate(
  newReceipt: NewReceiptData,
  existingReceipts: Receipt[],
  config: DuplicateConfig = {}
): DuplicateCheckResult {
  const {
    nameSimilarityThreshold = 0.85,
    amountTolerance = 0.01,
  } = config;

  const result: DuplicateCheckResult = {
    isDuplicate: false,
    matchingReceipt: null,
    confidence: 0,
    reasons: [],
  };

  // Si données insuffisantes, on ne peut pas détecter de doublon
  if (!newReceipt.amount_sent || !newReceipt.transfer_date) {
    return result;
  }

  const newDate = normalizeDate(newReceipt.transfer_date);
  if (!newDate) return result;

  for (const existing of existingReceipts) {
    const matchReasons: string[] = [];
    let matchScore = 0;

    // 1. Vérifier le montant (avec tolérance)
    if (existing.amount_sent) {
      const amountDiff = Math.abs(existing.amount_sent - newReceipt.amount_sent);
      const toleranceAmount = newReceipt.amount_sent * amountTolerance;

      if (amountDiff <= toleranceAmount) {
        matchReasons.push(`Même montant: ${existing.amount_sent} ${existing.currency}`);
        matchScore += 0.35;
      } else {
        continue; // Montant différent, pas un doublon
      }
    } else {
      continue;
    }

    // 2. Vérifier la date
    const existingDate = normalizeDate(existing.transfer_date);
    if (existingDate === newDate) {
      matchReasons.push(`Même date: ${existingDate}`);
      matchScore += 0.35;
    } else {
      continue; // Date différente, pas un doublon
    }

    // 3. Vérifier le bénéficiaire (avec matching flou)
    if (newReceipt.receiver_name && existing.receiver_name) {
      const nameSimilarity = calculateSimilarity(
        newReceipt.receiver_name,
        existing.receiver_name
      );

      if (nameSimilarity >= nameSimilarityThreshold) {
        matchReasons.push(
          `Même bénéficiaire: ${existing.receiver_name} (similarité: ${Math.round(nameSimilarity * 100)}%)`
        );
        matchScore += 0.2;
      } else {
        // Bénéficiaire différent, probablement pas un doublon
        // mais on continue car le reste peut correspondre
        matchScore -= 0.1;
      }
    }

    // 4. Vérifier le provider (bonus)
    if (newReceipt.provider && existing.provider) {
      const providerSimilarity = calculateSimilarity(
        newReceipt.provider,
        existing.provider
      );
      if (providerSimilarity >= 0.8) {
        matchReasons.push(`Même service: ${existing.provider}`);
        matchScore += 0.1;
      }
    }

    // 5. Vérifier la devise
    if (newReceipt.currency && existing.currency) {
      if (newReceipt.currency.toUpperCase() === existing.currency.toUpperCase()) {
        matchScore += 0.05;
      }
    }

    // Si le score est suffisant, c'est un doublon
    if (matchScore >= 0.7) {
      result.isDuplicate = true;
      result.matchingReceipt = existing;
      result.confidence = Math.min(matchScore, 1);
      result.reasons = matchReasons;
      return result;
    }
  }

  return result;
}

/**
 * Vérifie plusieurs reçus uploadés en même temps pour les doublons internes
 * (doublons entre les nouveaux reçus eux-mêmes)
 */
export function findInternalDuplicates(
  receipts: NewReceiptData[]
): { index: number; duplicateOf: number }[] {
  const duplicates: { index: number; duplicateOf: number }[] = [];

  for (let i = 1; i < receipts.length; i++) {
    for (let j = 0; j < i; j++) {
      const result = checkForDuplicate(receipts[i], [
        {
          ...receipts[j],
          id: `temp-${j}`,
          user_id: "",
          file_path: "",
          file_name: "",
          file_size: null,
          mime_type: null,
          fees: 0,
          currency: receipts[j].currency || "EUR",
          ocr_confidence: null,
          is_validated: false,
          validation_status: "pending",
          matched_relation: null,
          match_confidence: null,
          amount_eur: null,
          exchange_rate: null,
          tax_year: new Date().getFullYear(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Receipt,
      ]);

      if (result.isDuplicate) {
        duplicates.push({ index: i, duplicateOf: j });
        break;
      }
    }
  }

  return duplicates;
}

/**
 * Formate un message d'erreur pour un doublon détecté
 */
export function formatDuplicateMessage(result: DuplicateCheckResult): string {
  if (!result.isDuplicate || !result.matchingReceipt) {
    return "";
  }

  const receipt = result.matchingReceipt;
  const date = receipt.transfer_date
    ? new Date(receipt.transfer_date).toLocaleDateString("fr-FR")
    : "date inconnue";

  return `Ce reçu semble être un doublon d'un transfert déjà enregistré:\n` +
    `- ${receipt.amount_sent} ${receipt.currency} vers ${receipt.receiver_name || "bénéficiaire inconnu"}\n` +
    `- Date: ${date}\n` +
    `- Service: ${receipt.provider || "non spécifié"}\n\n` +
    `Confiance: ${Math.round(result.confidence * 100)}%`;
}
