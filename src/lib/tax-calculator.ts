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
    // 41% au-delà de 82 341€

    if (q > 82341) {
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
  if (quotient > 82341) tmi = 41;
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
 * Formate un nombre en euros
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Vérifie l'éligibilité du bénéficiaire
 */
export type BeneficiaryType = "parents" | "children" | "siblings";

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
          "Les versements aux frères, soeurs, oncles ou tantes ne sont pas déductibles fiscalement.",
      };
    default:
      return { eligible: false, message: "" };
  }
};
