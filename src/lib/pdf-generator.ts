import type { Receipt, Profile } from "@/lib/supabase/types";

// Dynamic import for jsPDF to reduce initial bundle size
async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

interface PDFData {
  userName: string;
  taxYear: number;
  generatedDate: string;
  totalDeductible: number;
  taxReduction: number;
  tmiRate: number;
  receipts: Receipt[];
  profile: Profile | null;
  isMarried: boolean;
  annualIncome: number;
}

// Couleurs
const COLORS = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#666666",
  lightGray: "#999999",
  emerald: "#10B981",
  emeraldDark: "#059669",
  blue: "#3B82F6",
};

// Helper pour formater les montants en euros
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Helper pour formater les dates
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Non spécifiée";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Calculer les totaux depuis les reçus
function calculateTotals(receipts: Receipt[]): {
  totalAmountSent: number;
  totalFees: number;
  totalDeductible: number;
} {
  let totalAmountSent = 0;
  let totalFees = 0;

  for (const receipt of receipts) {
    totalAmountSent += receipt.amount_eur || 0;
    totalFees += receipt.fees || 0;
  }

  return {
    totalAmountSent,
    totalFees,
    totalDeductible: totalAmountSent + totalFees,
  };
}

export async function generateFiscalPDF(data: PDFData): Promise<ArrayBuffer> {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const totals = calculateTotals(data.receipts);

  // =========================================
  // PAGE 1 - RÉSUMÉ + INSTRUCTIONS
  // =========================================
  let y = margin;

  // Logo KIVIO
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("KIVIO", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Titre
  doc.setFontSize(18);
  doc.setTextColor(COLORS.black);
  doc.text(`DOSSIER FISCAL ${data.taxYear}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  doc.text("Aide financière aux ascendants", pageWidth / 2, y, { align: "center" });
  y += 15;

  // Ligne de séparation
  doc.setDrawColor(COLORS.lightGray);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Informations de génération
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gray);
  doc.text(`Généré le : ${data.generatedDate}`, margin, y);
  y += 6;
  doc.text(`Pour : ${data.userName}`, margin, y);
  y += 15;

  // Encadré MONTANT À DÉCLARER
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
  doc.setDrawColor(COLORS.emerald);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "S");

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("MONTANT A DECLARER", pageWidth / 2, y, { align: "center" });

  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  doc.text("Case 6GU - \"Autres pensions alimentaires versées\"", pageWidth / 2, y, { align: "center" });

  y += 12;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text(formatCurrency(data.totalDeductible), pageWidth / 2, y, { align: "center" });

  y += 30;

  // Économie d'impôt estimée
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");
  y += 13;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emeraldDark);
  doc.text(`VOTRE ECONOMIE D'IMPOT ESTIMEE : ${formatCurrency(data.taxReduction)}`, pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  doc.text(`(Basée sur votre TMI de ${data.tmiRate}%)`, pageWidth / 2, y, { align: "center" });

  y += 20;

  // Instructions de déclaration
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("COMMENT DECLARER SUR IMPOTS.GOUV.FR", margin, y);
  y += 10;

  const instructions = [
    "1. Connectez-vous sur impots.gouv.fr",
    "2. Cliquez sur \"Déclarer mes revenus\"",
    "3. Avancez jusqu'à l'étape 3 \"Revenus et charges\"",
    "4. Allez dans la rubrique \"6 - Charges déductibles\"",
    "5. Cliquez sur \"Pensions alimentaires\"",
    "6. Trouvez la case 6GU : \"Autres pensions alimentaires versées\"",
    `7. Saisissez le montant : ${formatCurrency(data.totalDeductible)}`,
    "8. Validez et terminez votre déclaration",
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  for (const instruction of instructions) {
    doc.text(instruction, margin + 5, y);
    y += 7;
  }

  y += 10;

  // Avertissement
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#92400E");
  doc.text("IMPORTANT", margin + 5, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Conservez ce dossier pendant 3 ans. En cas de contrôle fiscal, vous devrez justifier ce montant.", margin + 5, y);

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightGray);
  doc.text("Page 1/4", pageWidth / 2, pageHeight - 10, { align: "center" });

  // =========================================
  // PAGE 2 - SITUATION FISCALE
  // =========================================
  doc.addPage();
  y = margin;

  // Titre
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("VOTRE SITUATION FISCALE", margin, y);
  y += 15;

  // Informations personnelles
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 55, 3, 3, "F");

  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("VOS INFORMATIONS", margin + 5, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gray);

  const infoRows = [
    ["Nom :", data.userName],
    ["Situation familiale :", data.isMarried ? "Marié(e)" : "Célibataire"],
    ["Revenus annuels déclarés :", formatCurrency(data.annualIncome)],
    ["Tranche Marginale d'Imposition (TMI) :", `${data.tmiRate}%`],
  ];

  for (const [label, value] of infoRows) {
    doc.setTextColor(COLORS.gray);
    doc.text(label, margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + 80, y);
    doc.setFont("helvetica", "normal");
    y += 8;
  }

  y += 15;

  // Récapitulatif
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("RECAPITULATIF", margin, y);
  y += 10;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  doc.text(`Période : Année ${data.taxYear}`, margin + 5, y);
  y += 7;
  doc.text(`Nombre de transferts : ${data.receipts.length}`, margin + 5, y);
  y += 12;

  // Tableau récapitulatif
  doc.setTextColor(COLORS.gray);
  doc.text("Total envoyé", margin + 10, y);
  doc.setTextColor(COLORS.black);
  doc.text(formatCurrency(totals.totalAmountSent), margin + contentWidth - 50, y);
  y += 7;

  doc.setTextColor(COLORS.gray);
  doc.text("Frais de transfert", margin + 10, y);
  doc.setTextColor(COLORS.black);
  doc.text(`+ ${formatCurrency(totals.totalFees)}`, margin + contentWidth - 50, y);
  y += 7;

  doc.setDrawColor(COLORS.lightGray);
  doc.line(margin + 10, y, margin + contentWidth - 10, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("TOTAL DEDUCTIBLE", margin + 10, y);
  doc.text(formatCurrency(totals.totalDeductible), margin + contentWidth - 50, y);

  y += 25;

  // Base légale
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("BASE LEGALE", margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);

  const legalText = [
    "La déduction des sommes versées à vos ascendants (parents, grands-parents) est prévue par :",
    "",
    "• Articles 205 à 207 du Code civil (obligation alimentaire)",
    "• Article 156 II-2° du Code Général des Impôts",
    "",
    "Ces sommes sont déductibles si elles correspondent aux besoins essentiels de vos",
    "ascendants : nourriture, logement, santé, vêtements.",
  ];

  for (const line of legalText) {
    doc.text(line, margin, y);
    y += 6;
  }

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightGray);
  doc.text("Page 2/4", pageWidth / 2, pageHeight - 10, { align: "center" });

  // =========================================
  // PAGE 3 - DÉTAIL DES TRANSFERTS
  // =========================================
  doc.addPage();
  y = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("DETAIL DES TRANSFERTS", margin, y);
  y += 15;

  // Afficher chaque transfert
  for (let i = 0; i < data.receipts.length; i++) {
    const receipt = data.receipts[i];

    // Vérifier si on a besoin d'une nouvelle page
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black);
      doc.text("DETAIL DES TRANSFERTS (suite)", margin, y);
      y += 15;
    }

    // Encadré du transfert
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 55, 3, 3, "F");
    doc.setDrawColor(COLORS.lightGray);
    doc.roundedRect(margin, y, contentWidth, 55, 3, 3, "S");

    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black);
    doc.text(`TRANSFERT #${i + 1}`, margin + 5, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Date et service
    doc.setTextColor(COLORS.gray);
    doc.text("Date :", margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.text(formatDate(receipt.transfer_date), margin + 40, y);

    doc.setTextColor(COLORS.gray);
    doc.text("Service :", margin + 100, y);
    doc.setTextColor(COLORS.black);
    doc.text(receipt.provider || "Non spécifié", margin + 130, y);
    y += 7;

    // Expéditeur / Bénéficiaire
    doc.setTextColor(COLORS.gray);
    doc.text("Expéditeur :", margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.text(receipt.sender_name || data.userName, margin + 40, y);
    y += 7;

    doc.setTextColor(COLORS.gray);
    doc.text("Bénéficiaire :", margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.text(receipt.receiver_name || "Non spécifié", margin + 40, y);
    y += 10;

    // Montants
    doc.setTextColor(COLORS.gray);
    doc.text("Montant envoyé :", margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.text(formatCurrency(receipt.amount_eur || 0), margin + 60, y);
    y += 6;

    doc.setTextColor(COLORS.gray);
    doc.text("Frais de transfert :", margin + 10, y);
    doc.setTextColor(COLORS.black);
    doc.text(formatCurrency(receipt.fees || 0), margin + 60, y);
    y += 6;

    const subtotal = (receipt.amount_eur || 0) + (receipt.fees || 0);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.emerald);
    doc.text("Sous-total :", margin + 10, y);
    doc.text(formatCurrency(subtotal), margin + 60, y);

    y += 15;
  }

  // Total général
  y += 10;
  doc.setDrawColor(COLORS.black);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("TOTAL GENERAL", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.setTextColor(COLORS.gray);
  doc.text("Total envoyé :", margin + 50, y);
  doc.setTextColor(COLORS.black);
  doc.text(formatCurrency(totals.totalAmountSent), margin + contentWidth - 50, y);
  y += 7;

  doc.setTextColor(COLORS.gray);
  doc.text("Total frais :", margin + 50, y);
  doc.setTextColor(COLORS.black);
  doc.text(formatCurrency(totals.totalFees), margin + contentWidth - 50, y);
  y += 10;

  doc.setDrawColor(COLORS.emerald);
  doc.line(margin + 40, y, pageWidth - margin - 40, y);
  y += 8;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("TOTAL DEDUCTIBLE :", margin + 50, y);
  doc.text(formatCurrency(totals.totalDeductible), margin + contentWidth - 50, y);

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightGray);
  doc.text("Page 3/4", pageWidth / 2, pageHeight - 10, { align: "center" });

  // =========================================
  // PAGE 4 - ATTESTATION SUR L'HONNEUR
  // =========================================
  doc.addPage();
  y = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text("ATTESTATION SUR L'HONNEUR", pageWidth / 2, y, { align: "center" });
  y += 20;

  // Contenu de l'attestation
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black);

  doc.text("Je soussigné(e),", margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text(`Nom : ${data.userName}`, margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.text("Atteste sur l'honneur que :", margin, y);
  y += 15;

  // Cases à cocher
  const attestations = [
    "Les transferts d'argent listés dans ce document ont été effectués au bénéfice de mes",
    "ascendants directs (parents, grands-parents).",
    "",
    "Ces sommes ont été versées pour subvenir à leurs besoins essentiels :",
    "nourriture, logement, santé.",
    "",
    "Les informations fournies sont exactes.",
    "",
    "Je suis en mesure de fournir un justificatif de lien de parenté (livret de famille,",
    "acte de naissance) en cas de contrôle fiscal.",
  ];

  doc.setFontSize(10);
  let checkY = y;

  // Premier check
  doc.setDrawColor(COLORS.emerald);
  doc.rect(margin, checkY - 4, 4, 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("X", margin + 0.8, checkY - 0.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black);
  doc.text(attestations[0], margin + 8, checkY);
  checkY += 5;
  doc.text(attestations[1], margin + 8, checkY);
  checkY += 12;

  // Deuxième check
  doc.rect(margin, checkY - 4, 4, 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("X", margin + 0.8, checkY - 0.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black);
  doc.text(attestations[3], margin + 8, checkY);
  checkY += 5;
  doc.text(attestations[4], margin + 8, checkY);
  checkY += 12;

  // Troisième check
  doc.rect(margin, checkY - 4, 4, 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("X", margin + 0.8, checkY - 0.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black);
  doc.text(attestations[6], margin + 8, checkY);
  checkY += 12;

  // Quatrième check
  doc.rect(margin, checkY - 4, 4, 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.emerald);
  doc.text("X", margin + 0.8, checkY - 0.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black);
  doc.text(attestations[8], margin + 8, checkY);
  checkY += 5;
  doc.text(attestations[9], margin + 8, checkY);

  y = checkY + 25;

  // Date et signature
  doc.setFontSize(11);
  doc.text(`Fait le : ${data.generatedDate}`, margin, y);
  y += 15;

  doc.text("Signature :", margin, y);
  y += 5;
  doc.setDrawColor(COLORS.lightGray);
  doc.line(margin + 25, y, margin + 100, y);

  // Footer
  y = pageHeight - 40;
  doc.setDrawColor(COLORS.lightGray);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray);
  doc.text("Document généré par Kivio", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("www.kivio.fr | contact.kivio@gmail.com", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(8);
  doc.text("Conformité : Art. 205-208 du Code civil | Art. 156 II-2° du CGI", pageWidth / 2, y, { align: "center" });

  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightGray);
  doc.text("Page 4/4", pageWidth / 2, pageHeight - 10, { align: "center" });

  // Retourner le PDF en ArrayBuffer
  return doc.output("arraybuffer");
}
