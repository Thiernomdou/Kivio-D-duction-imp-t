import type { Receipt } from "@/lib/supabase/types";
import { groupBeneficiariesSimple } from "@/lib/name-grouping";

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
}

function formatCurrency(amount: number): string {
  // Format manuel pour éviter les caractères Unicode que jsPDF ne gère pas bien
  const fixed = amount.toFixed(2);
  const [intPart, decPart] = fixed.split(".");

  // Ajouter les séparateurs de milliers (points)
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${withSeparators},${decPart} EUR`;
}

// Utilise groupBeneficiariesSimple de @/lib/name-grouping pour le regroupement intelligent

export async function generateFiscalPDF(data: PDFData): Promise<ArrayBuffer> {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const beneficiaries = groupBeneficiariesSimple(data.receipts);

  // Calculer totaux
  let totalSent = 0;
  let totalFees = 0;
  for (const r of data.receipts) {
    totalSent += r.amount_eur || 0;
    totalFees += r.fees || 0;
  }
  const totalDeductible = totalSent + totalFees;

  let y = margin;

  // ===== HEADER =====
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#a855f7");
  doc.text("KIVIO", margin, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#666666");
  doc.text(`Dossier fiscal ${data.taxYear}`, pageWidth - margin, y, { align: "right" });

  y += 10;
  doc.setDrawColor("#e5e5e5");
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ===== MONTANT À DÉCLARER =====
  doc.setFillColor("#f3e8ff");
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, "F");

  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#7c3aed");
  doc.text("MONTANT A DECLARER - Case 6GU", pageWidth / 2, y, { align: "center" });

  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#666666");
  doc.text("Autres pensions alimentaires versees", pageWidth / 2, y, { align: "center" });

  y += 12;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text(formatCurrency(totalDeductible), pageWidth / 2, y, { align: "center" });

  y += 18;

  // ===== ÉCONOMIE D'IMPÔT =====
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#16a34a");
  doc.text(`Economie d'impot estimee : ${formatCurrency(data.taxReduction)} (TMI ${data.tmiRate}%)`, pageWidth / 2, y, { align: "center" });

  y += 12;

  // ===== COMMENT DÉCLARER =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text("Comment declarer", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");

  const steps = [
    "1. Connectez-vous sur impots.gouv.fr",
    "2. Cliquez sur Declarer mes revenus",
    "3. Etape 3 : Revenus et charges",
    "4. Section 6 - Charges deductibles > Pensions alimentaires",
    `5. Saisissez ${formatCurrency(totalDeductible)} dans la case 6GU`
  ];

  for (const step of steps) {
    doc.text(step, margin, y);
    y += 5;
  }

  y += 8;

  // ===== DÉTAIL PAR BÉNÉFICIAIRE =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text("Detail par beneficiaire", margin, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#666666");
  doc.text("A reporter dans le detail de votre declaration", margin + 55, y);
  y += 6;

  // Tableau compact
  const tableHeight = 8 + beneficiaries.length * 8;
  doc.setFillColor("#f9fafb");
  doc.roundedRect(margin, y, contentWidth, tableHeight, 2, 2, "F");

  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#666666");
  doc.text("Beneficiaire", margin + 4, y);
  doc.text("Montant", pageWidth - margin - 4, y, { align: "right" });

  y += 3;
  doc.setDrawColor("#e5e5e5");
  doc.line(margin + 4, y, pageWidth - margin - 4, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor("#000000");

  for (const b of beneficiaries) {
    doc.text(b.name, margin + 4, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(b.total), pageWidth - margin - 4, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 8;
  }

  y += 6;

  // ===== RÉCAPITULATIF =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text("Recapitulatif", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");

  doc.text("Total envoye", margin, y);
  doc.text(formatCurrency(totalSent), pageWidth - margin, y, { align: "right" });
  y += 5;

  doc.text("Frais de transfert", margin, y);
  doc.text(`+ ${formatCurrency(totalFees)}`, pageWidth - margin, y, { align: "right" });
  y += 4;

  doc.setDrawColor("#e5e5e5");
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor("#7c3aed");
  doc.text("Total deductible", margin, y);
  doc.text(formatCurrency(totalDeductible), pageWidth - margin, y, { align: "right" });

  // ===== FOOTER - Position dynamique =====
  y += 15;

  // S'assurer que le footer ne dépasse pas la page
  const footerY = Math.max(y, pageHeight - 25);

  doc.setDrawColor("#e5e5e5");
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#999999");
  doc.text(`Genere le ${data.generatedDate} pour ${data.userName} | ${data.receipts.length} transfert(s)`, margin, footerY + 5);
  doc.text("Conservez ce document 3 ans | kivio.fr | Art. 156 II-2 du CGI", margin, footerY + 9);

  return doc.output("arraybuffer");
}
