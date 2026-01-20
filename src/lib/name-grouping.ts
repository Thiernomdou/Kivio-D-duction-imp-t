/**
 * Utilitaire de regroupement intelligent des noms de bénéficiaires
 *
 * Gère les cas où le même bénéficiaire apparaît avec des variantes de nom :
 * - Titres honorifiques : "Hadja Oumou Bah" et "Oumou Bah" → même personne
 * - Surnoms ajoutés : "Mohamed Diallo" et "Mohamed Diallo dit Momo" → même personne
 */

// Titres/préfixes honorifiques courants (Afrique de l'Ouest principalement)
const HONORIFIC_PREFIXES = [
  'hadja', 'hadj', 'el hadj', 'elhadj', 'alhaj', 'al hadj',
  'mama', 'maman', 'tata', 'tonton', 'oncle', 'tante',
  'nene', 'néné', 'baba', 'papa',
  'cheikh', 'sheikh', 'imam',
  'docteur', 'dr', 'professeur', 'prof',
  'monsieur', 'mr', 'm.', 'madame', 'mme', 'mademoiselle', 'mlle',
];

// Mots de liaison pour les surnoms
const NICKNAME_MARKERS = ['dit', 'dite', 'alias', 'surnommé', 'surnommée'];

/**
 * Normalise un nom : première lettre majuscule, reste minuscule
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extrait le nom de base sans les titres honorifiques ni les surnoms
 */
function extractBaseName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Retirer les titres honorifiques du début
  for (const prefix of HONORIFIC_PREFIXES) {
    const prefixWithSpace = prefix + ' ';
    if (normalized.startsWith(prefixWithSpace)) {
      normalized = normalized.slice(prefixWithSpace.length).trim();
      break; // Un seul titre à retirer
    }
  }

  // Retirer les surnoms (tout ce qui suit "dit", "alias", etc.)
  for (const marker of NICKNAME_MARKERS) {
    const markerIndex = normalized.indexOf(` ${marker} `);
    if (markerIndex !== -1) {
      normalized = normalized.slice(0, markerIndex).trim();
      break;
    }
  }

  return normalized;
}

/**
 * Vérifie si deux noms sont probablement la même personne
 */
function areSamePerson(name1: string, name2: string): boolean {
  const base1 = extractBaseName(name1);
  const base2 = extractBaseName(name2);

  // Cas 1: Les noms de base sont identiques
  if (base1 === base2) {
    return true;
  }

  // Cas 2: Un nom de base contient entièrement l'autre
  // Ex: "oumou hawa bah" contient "oumou hawa bah" après extraction
  // Ex: "hadja oumou hawa bah" (base: "oumou hawa bah") = "oumou hawa bah"

  // Cas 3: Un nom est entièrement contenu dans l'autre (ordre des mots préservé)
  // Vérifier si tous les mots de base1 sont dans base2 dans le même ordre, ou vice versa
  const words1 = base1.split(/\s+/).filter(w => w.length > 0);
  const words2 = base2.split(/\s+/).filter(w => w.length > 0);

  if (words1.length === 0 || words2.length === 0) {
    return false;
  }

  // Si les deux ont le même nombre de mots et sont identiques
  if (words1.length === words2.length) {
    return words1.every((w, i) => w === words2[i]);
  }

  // Vérifier si le plus court est une sous-séquence contiguë du plus long
  const [shorter, longer] = words1.length < words2.length
    ? [words1, words2]
    : [words2, words1];

  // Le nom court doit avoir au moins 2 mots pour être considéré comme un match partiel
  if (shorter.length < 2) {
    return false;
  }

  // Chercher si shorter est une sous-séquence contiguë de longer
  for (let i = 0; i <= longer.length - shorter.length; i++) {
    let match = true;
    for (let j = 0; j < shorter.length; j++) {
      if (longer[i + j] !== shorter[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return true;
    }
  }

  return false;
}

/**
 * Choisit le nom canonique entre deux variantes
 * Préfère le nom le plus court (sans titre) car c'est souvent le "vrai" nom
 * En cas d'égalité, garde le plus fréquent
 */
function chooseCanonicalName(
  name1: string,
  count1: number,
  name2: string,
  count2: number
): string {
  const base1 = extractBaseName(name1);
  const base2 = extractBaseName(name2);

  // Si les bases sont identiques, prendre le nom normalisé de la base
  if (base1 === base2) {
    return normalizeName(base1);
  }

  // Sinon, prendre le plus court (probablement le nom sans surnom)
  const words1 = base1.split(/\s+/).length;
  const words2 = base2.split(/\s+/).length;

  if (words1 !== words2) {
    return words1 < words2 ? normalizeName(base1) : normalizeName(base2);
  }

  // En cas d'égalité de longueur, prendre celui qui apparaît le plus souvent
  return count1 >= count2 ? normalizeName(name1) : normalizeName(name2);
}

export interface BeneficiaryGroup {
  name: string;           // Nom canonique choisi
  totalAmount: number;    // Montant total (sans frais)
  totalFees: number;      // Total des frais
  count: number;          // Nombre de transferts
  variants: string[];     // Variantes de noms regroupées (pour debug/affichage)
}

interface ReceiptLike {
  receiver_name: string | null;
  amount_eur: number | null;
  fees: number | null;
}

/**
 * Regroupe les bénéficiaires de manière intelligente
 * Détecte et fusionne les variantes d'un même nom
 */
export function groupBeneficiaries(receipts: ReceiptLike[]): BeneficiaryGroup[] {
  // Étape 1: Grouper par nom normalisé (comme avant)
  const rawGroups = new Map<string, {
    originalNames: Map<string, number>; // nom original -> count
    totalAmount: number;
    totalFees: number;
    count: number;
  }>();

  for (const receipt of receipts) {
    const rawName = receipt.receiver_name || "Bénéficiaire inconnu";
    const normalized = normalizeName(rawName);
    const amount = receipt.amount_eur || 0;
    const fees = receipt.fees || 0;

    if (!rawGroups.has(normalized)) {
      rawGroups.set(normalized, {
        originalNames: new Map(),
        totalAmount: 0,
        totalFees: 0,
        count: 0,
      });
    }

    const group = rawGroups.get(normalized)!;
    group.totalAmount += amount;
    group.totalFees += fees;
    group.count += 1;
    group.originalNames.set(
      rawName,
      (group.originalNames.get(rawName) || 0) + 1
    );
  }

  // Étape 2: Convertir en tableau pour fusion
  const groups: BeneficiaryGroup[] = [];

  rawGroups.forEach((data, name) => {
    groups.push({
      name,
      totalAmount: data.totalAmount,
      totalFees: data.totalFees,
      count: data.count,
      variants: [name],
    });
  });

  // Étape 3: Fusionner les groupes qui représentent la même personne
  let merged = true;
  while (merged) {
    merged = false;

    for (let i = 0; i < groups.length && !merged; i++) {
      for (let j = i + 1; j < groups.length && !merged; j++) {
        if (areSamePerson(groups[i].name, groups[j].name)) {
          // Fusionner j dans i
          const canonicalName = chooseCanonicalName(
            groups[i].name,
            groups[i].count,
            groups[j].name,
            groups[j].count
          );

          groups[i].name = canonicalName;
          groups[i].totalAmount += groups[j].totalAmount;
          groups[i].totalFees += groups[j].totalFees;
          groups[i].count += groups[j].count;
          groups[i].variants = Array.from(new Set([...groups[i].variants, ...groups[j].variants]));

          // Supprimer j
          groups.splice(j, 1);
          merged = true;
        }
      }
    }
  }

  // Étape 4: Trier par montant total décroissant
  groups.sort((a, b) => (b.totalAmount + b.totalFees) - (a.totalAmount + a.totalFees));

  return groups;
}

/**
 * Version simplifiée pour le PDF (sans les variantes)
 */
export interface SimpleBeneficiaryTotal {
  name: string;
  total: number;
  count: number;
}

export function groupBeneficiariesSimple(receipts: ReceiptLike[]): SimpleBeneficiaryTotal[] {
  const groups = groupBeneficiaries(receipts);
  return groups.map(g => ({
    name: g.name,
    total: g.totalAmount + g.totalFees,
    count: g.count,
  }));
}
