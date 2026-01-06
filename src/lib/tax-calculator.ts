export interface TaxResult {
  gain: number;
  tmi: number;
  taxBefore: number;
  taxAfter: number;
  parts: number;
  annualDeduction: number;
}

export interface TaxInput {
  monthlySent: number;
  annualIncome: number;
  isMarried: boolean;
  childrenCount: number;
}

// Types de bénéficiaires
export type BeneficiaryType = "parents" | "children" | "siblings";

// Types de dépenses
export type ExpenseType = "alimentary" | "investment";

// Raisons d'inéligibilité
export type IneligibilityReason =
  | "non_imposable"
  | "beneficiary_not_eligible"
  | "expense_not_eligible"
  | null;

export interface EligibilityResult {
  eligible: boolean;
  reason: IneligibilityReason;
  message: string;
  legalReference?: string;
}

/**
 * Calcule le gain fiscal basé sur les barèmes français 2024
 * Prend en compte le quotient familial et les tranches d'imposition
 */
export const calculateTaxGain = (
  monthlySent: number,
  annualIncome: number,
  isMarried: boolean,
  childrenCount: number
): TaxResult => {
  // Calcul des parts fiscales
  let parts = isMarried ? 2 : 1;
  if (childrenCount > 0) {
    if (childrenCount === 1) parts += 0.5;
    else if (childrenCount === 2) parts += 1;
    else parts += 1 + (childrenCount - 2);
  }

  // Fonction d'estimation de l'impôt selon les tranches 2024
  const estimateTax = (income: number, p: number): number => {
    const q = income / p; // Quotient familial
    let tax = 0;

    // Barème progressif 2024
    // 0% jusqu'à 11 294€
    // 11% de 11 294€ à 28 797€
    // 30% de 28 797€ à 82 341€
    // 41% de 82 341€ à 177 106€
    // 45% au-delà de 177 106€

    if (q > 177106) {
      tax +=
        (income - 177106 * p) * 0.45 +
        (177106 - 82341) * p * 0.41 +
        (82341 - 28797) * p * 0.3 +
        (28797 - 11294) * p * 0.11;
    } else if (q > 82341) {
      tax +=
        (income - 82341 * p) * 0.41 +
        (82341 - 28797) * p * 0.3 +
        (28797 - 11294) * p * 0.11;
    } else if (q > 28797) {
      tax += (income - 28797 * p) * 0.3 + (28797 - 11294) * p * 0.11;
    } else if (q > 11294) {
      tax += (income - 11294 * p) * 0.11;
    }

    return Math.max(0, tax);
  };

  const annualDeduction = monthlySent * 12;
  const taxBefore = estimateTax(annualIncome, parts);
  const taxAfter = estimateTax(Math.max(0, annualIncome - annualDeduction), parts);
  const gain = Math.round(taxBefore - taxAfter);

  // Calcul du TMI (Taux Marginal d'Imposition)
  const quotient = annualIncome / parts;
  let tmi = 0;
  if (quotient > 177106) tmi = 45;
  else if (quotient > 82341) tmi = 41;
  else if (quotient > 28797) tmi = 30;
  else if (quotient > 11294) tmi = 11;

  return {
    gain,
    tmi,
    taxBefore: Math.round(taxBefore),
    taxAfter: Math.round(taxAfter),
    parts,
    annualDeduction,
  };
};

/**
 * Vérifie si l'utilisateur est imposable (TMI > 0%)
 */
export const checkIfTaxable = (
  annualIncome: number,
  isMarried: boolean,
  childrenCount: number
): boolean => {
  let parts = isMarried ? 2 : 1;
  if (childrenCount > 0) {
    if (childrenCount === 1) parts += 0.5;
    else if (childrenCount === 2) parts += 1;
    else parts += 1 + (childrenCount - 2);
  }

  const quotient = annualIncome / parts;
  return quotient > 11294; // Seuil d'imposition 2024
};

/**
 * Vérifie l'éligibilité complète de l'utilisateur
 */
export const checkFullEligibility = (
  beneficiaryType: BeneficiaryType,
  expenseType: ExpenseType,
  annualIncome: number,
  isMarried: boolean,
  childrenCount: number
): EligibilityResult => {
  // 1. Vérifier le type de bénéficiaire (Articles 205-208)
  if (beneficiaryType === "siblings") {
    return {
      eligible: false,
      reason: "beneficiary_not_eligible",
      message: "Les versements aux frères, sœurs, oncles, tantes ou cousins ne sont pas déductibles.",
      legalReference: "Seuls les ascendants (parents, grands-parents) et descendants (enfants) dans le besoin sont concernés par l'obligation alimentaire (Articles 205 à 208 du Code civil).",
    };
  }

  // 2. Vérifier le type de dépense
  if (expenseType === "investment") {
    return {
      eligible: false,
      reason: "expense_not_eligible",
      message: "Les sommes destinées à l'immobilier, l'épargne ou l'investissement ne sont pas déductibles.",
      legalReference: "La déduction fiscale concerne uniquement les dépenses à caractère alimentaire : nourriture, logement, santé, vêtements, besoins vitaux du bénéficiaire.",
    };
  }

  // 3. Vérifier si l'utilisateur est imposable
  const isTaxable = checkIfTaxable(annualIncome, isMarried, childrenCount);
  if (!isTaxable) {
    return {
      eligible: false,
      reason: "non_imposable",
      message: "Vous n'êtes pas imposable cette année.",
      legalReference: "La déduction fiscale réduit le revenu imposable, elle ne génère pas de remboursement si vous ne payez pas d'impôt. Votre quotient familial vous place sous le seuil d'imposition (11 294 € par part).",
    };
  }

  // Éligible
  const beneficiaryLabel = beneficiaryType === "parents"
    ? "Ascendants (parents, grands-parents)"
    : "Descendants (enfants)";

  return {
    eligible: true,
    reason: null,
    message: `${beneficiaryLabel} éligibles à la pension alimentaire déductible.`,
    legalReference: "Articles 205 à 208 du Code civil - Obligation alimentaire entre ascendants et descendants.",
  };
};

/**
 * Vérifie l'éligibilité du bénéficiaire uniquement (pour rétrocompatibilité)
 */
export const checkEligibility = (
  beneficiaryType: BeneficiaryType
): { eligible: boolean; message: string } => {
  switch (beneficiaryType) {
    case "parents":
      return {
        eligible: true,
        message: "Ascendants éligibles (Articles 205-207 du Code civil)",
      };
    case "children":
      return {
        eligible: true,
        message: "Descendants éligibles (Article 208 du Code civil)",
      };
    case "siblings":
      return {
        eligible: false,
        message:
          "Les versements aux frères, sœurs, oncles ou tantes ne sont pas déductibles fiscalement (hors cas d'infirmité spécifique).",
      };
    default:
      return { eligible: false, message: "" };
  }
};

/**
 * Formate un nombre en euros
 * Retourne "0 €" si le montant est NaN, null, undefined ou invalide
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  // S'assurer que le montant est un nombre valide, sinon retourner 0 €
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

/**
 * Calcule la matrice de gain par TMI
 * Utile pour afficher les gains potentiels selon les tranches
 */
export const getTMIMatrix = (annualDeduction: number): { tmi: number; gain: number }[] => {
  return [
    { tmi: 11, gain: Math.round(annualDeduction * 0.11) },
    { tmi: 30, gain: Math.round(annualDeduction * 0.30) },
    { tmi: 41, gain: Math.round(annualDeduction * 0.41) },
    { tmi: 45, gain: Math.round(annualDeduction * 0.45) },
  ];
};
