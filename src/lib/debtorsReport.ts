import jsPDF from "jspdf";

export interface DebtorRow {
  idLegivel: string;
  nome: string;
  contacto: string;
  categoriaLabel: string;
  dividaAcumulada: number; // antes do sistema
  dividaPosSistema: number; // gerada pelo sistema
  dividaTotal: number;
}

export interface DebtorsReportPayload {
  system: "FFH" | "FPD";
  title: string;
  subtitle?: string;
  filterLabel: string;
  groupByCategoria?: boolean;
  rows: DebtorRow[];
}

const LOGO_URL = "/FHGCJ.png";
const PRIMARY: [number, number, number] = [22, 101, 52];
const ACCENT: [number, number, number] = [180, 130, 40];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + " MT";

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateDebtorsPdf(payload: DebtorsReportPayload): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  const logo = await loadLogo();
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, 10, 18, 18); } catch { /* ignore */ }
  }

  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(payload.title, margin + 22, 17);
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.setFont("helvetica", "normal");
  doc.text(`Sistema: ${payload.system} — Vila Olímpica Zimpeto`, margin + 22, 22);
  if (payload.subtitle) doc.text(payload.subtitle, margin + 22, 26.5);

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.4);
  doc.line(margin, 32, pageW - margin, 32);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Filtro: ${payload.filterLabel}`, margin, 38);
  doc.text(`Data: ${new Date().toLocaleString("pt-MZ")}`, pageW - margin, 38, { align: "right" });

  let y = 46;

  const grouped: Record<string, DebtorRow[]> = {};
  if (payload.groupByCategoria) {
    for (const r of payload.rows) (grouped[r.categoriaLabel] ||= []).push(r);
  } else {
    grouped["Todos"] = payload.rows;
  }

  const totalGeral = { rows: 0, acumulada: 0, pos: 0, total: 0 };

  const drawHeaderRow = () => {
    doc.setFillColor(...PRIMARY);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.rect(margin, y, pageW - margin * 2, 7, "F");
    doc.text("#", margin + 2, y + 4.8);
    doc.text("ID", margin + 10, y + 4.8);
    doc.text("Nome", margin + 30, y + 4.8);
    doc.text("Contacto", margin + 82, y + 4.8);
    doc.text("Acumulada", pageW - margin - 60, y + 4.8, { align: "right" });
    doc.text("Pós-sistema", pageW - margin - 30, y + 4.8, { align: "right" });
    doc.text("Total", pageW - margin - 2, y + 4.8, { align: "right" });
    y += 7;
  };

  const checkPageBreak = () => {
    if (y > pageH - 25) {
      doc.addPage();
      y = 18;
      drawHeaderRow();
    }
  };

  for (const [categoria, list] of Object.entries(grouped)) {
    if (!list.length) continue;
    checkPageBreak();
    if (payload.groupByCategoria) {
      doc.setFillColor(240, 235, 220);
      doc.setTextColor(...PRIMARY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.rect(margin, y, pageW - margin * 2, 7, "F");
      doc.text(`${categoria}  •  ${list.length} morador(es)`, margin + 2, y + 4.8);
      y += 8;
    }
    drawHeaderRow();

    let sub = { acumulada: 0, pos: 0, total: 0 };
    doc.setFont("helvetica", "normal");
    doc.setTextColor(35, 35, 35);
    doc.setFontSize(8);
    list.forEach((r, i) => {
      checkPageBreak();
      const zebra = i % 2 === 0;
      if (zebra) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y, pageW - margin * 2, 6, "F");
      }
      doc.text(String(i + 1), margin + 2, y + 4.2);
      doc.text(r.idLegivel, margin + 10, y + 4.2);
      doc.text((r.nome || "—").slice(0, 32), margin + 30, y + 4.2);
      doc.text((r.contacto || "—").slice(0, 18), margin + 82, y + 4.2);
      doc.text(fmt(r.dividaAcumulada), pageW - margin - 60, y + 4.2, { align: "right" });
      doc.text(fmt(r.dividaPosSistema), pageW - margin - 30, y + 4.2, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(fmt(r.dividaTotal), pageW - margin - 2, y + 4.2, { align: "right" });
      doc.setFont("helvetica", "normal");
      sub.acumulada += r.dividaAcumulada;
      sub.pos += r.dividaPosSistema;
      sub.total += r.dividaTotal;
      y += 6;
    });

    // Subtotal
    checkPageBreak();
    doc.setFillColor(...ACCENT);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.rect(margin, y, pageW - margin * 2, 6.5, "F");
    doc.text(`Subtotal ${categoria}`, margin + 2, y + 4.5);
    doc.text(fmt(sub.acumulada), pageW - margin - 60, y + 4.5, { align: "right" });
    doc.text(fmt(sub.pos), pageW - margin - 30, y + 4.5, { align: "right" });
    doc.text(fmt(sub.total), pageW - margin - 2, y + 4.5, { align: "right" });
    y += 9;

    totalGeral.rows += list.length;
    totalGeral.acumulada += sub.acumulada;
    totalGeral.pos += sub.pos;
    totalGeral.total += sub.total;
  }

  // Total geral
  checkPageBreak();
  doc.setFillColor(...PRIMARY);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.rect(margin, y, pageW - margin * 2, 8, "F");
  doc.text(`TOTAL GERAL  •  ${totalGeral.rows} morador(es)`, margin + 2, y + 5.4);
  doc.text(fmt(totalGeral.acumulada), pageW - margin - 60, y + 5.4, { align: "right" });
  doc.text(fmt(totalGeral.pos), pageW - margin - 30, y + 5.4, { align: "right" });
  doc.text(fmt(totalGeral.total), pageW - margin - 2, y + 5.4, { align: "right" });
  y += 11;

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(`Página ${i} de ${pageCount}`, pageW - margin, pageH - 8, { align: "right" });
    doc.text("Vila Olímpica Zimpeto — Relatório de Devedores", margin, pageH - 8);
  }

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
