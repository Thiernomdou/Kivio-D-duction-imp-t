/**
 * Parenthood Matcher
 * Matches receiver names from transfer receipts against identity document family names
 * Uses fuzzy string matching to handle variations in name spelling
 */

import { compareTwoStrings } from "string-similarity";

// Thresholds for matching confidence
const AUTO_VALIDATE_THRESHOLD = 0.80; // >= 80% = auto-validated
const MANUAL_REVIEW_THRESHOLD = 0.60; // 60-80% = needs manual review
// < 60% = rejected

export type RelationType = "father" | "mother" | "child";

export interface MatchResult {
  isMatch: boolean;
  confidence: number;
  relation: RelationType | null;
  matchedName: string | null;
  requiresManualReview: boolean;
}

export interface IdentityData {
  father_name?: string | null;
  mother_name?: string | null;
  children?: { name: string; birth_date?: string }[];
}

/**
 * Normalizes a French name for comparison
 * - Converts to lowercase
 * - Removes accents (é -> e, ç -> c, etc.)
 * - Normalizes whitespace
 * - Removes hyphens and underscores
 */
export function normalizeName(name: string): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

/**
 * Compares two names and returns a similarity score (0-1)
 */
export function compareNames(name1: string, name2: string): number {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);

  if (!normalized1 || !normalized2) return 0;

  // Use string-similarity library for fuzzy matching
  return compareTwoStrings(normalized1, normalized2);
}

/**
 * Matches a receiver name from a receipt against family members in an identity document
 * Returns the best match with confidence score and relation type
 */
export function matchParenthood(
  receiverName: string,
  identityDoc: IdentityData
): MatchResult {
  if (!receiverName) {
    return {
      isMatch: false,
      confidence: 0,
      relation: null,
      matchedName: null,
      requiresManualReview: false,
    };
  }

  let bestMatch: MatchResult = {
    isMatch: false,
    confidence: 0,
    relation: null,
    matchedName: null,
    requiresManualReview: false,
  };

  // Check father
  if (identityDoc.father_name) {
    const score = compareNames(receiverName, identityDoc.father_name);
    if (score > bestMatch.confidence) {
      bestMatch = {
        isMatch: score >= AUTO_VALIDATE_THRESHOLD,
        confidence: score,
        relation: "father",
        matchedName: identityDoc.father_name,
        requiresManualReview: score >= MANUAL_REVIEW_THRESHOLD && score < AUTO_VALIDATE_THRESHOLD,
      };
    }
  }

  // Check mother
  if (identityDoc.mother_name) {
    const score = compareNames(receiverName, identityDoc.mother_name);
    if (score > bestMatch.confidence) {
      bestMatch = {
        isMatch: score >= AUTO_VALIDATE_THRESHOLD,
        confidence: score,
        relation: "mother",
        matchedName: identityDoc.mother_name,
        requiresManualReview: score >= MANUAL_REVIEW_THRESHOLD && score < AUTO_VALIDATE_THRESHOLD,
      };
    }
  }

  // Check children
  if (identityDoc.children && identityDoc.children.length > 0) {
    for (const child of identityDoc.children) {
      if (!child.name) continue;

      const score = compareNames(receiverName, child.name);
      if (score > bestMatch.confidence) {
        bestMatch = {
          isMatch: score >= AUTO_VALIDATE_THRESHOLD,
          confidence: score,
          relation: "child",
          matchedName: child.name,
          requiresManualReview: score >= MANUAL_REVIEW_THRESHOLD && score < AUTO_VALIDATE_THRESHOLD,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Determines the validation status based on match result
 */
export function getValidationStatus(
  match: MatchResult
): "auto_validated" | "manual_review" | "rejected" | "pending" {
  if (match.isMatch) {
    return "auto_validated";
  }
  if (match.requiresManualReview) {
    return "manual_review";
  }
  if (match.confidence > 0) {
    return "rejected";
  }
  return "pending";
}

/**
 * Gets a human-readable label for the relation type in French
 */
export function getRelationLabel(relation: RelationType | null): string {
  switch (relation) {
    case "father":
      return "Père";
    case "mother":
      return "Mère";
    case "child":
      return "Enfant";
    default:
      return "Non identifié";
  }
}
