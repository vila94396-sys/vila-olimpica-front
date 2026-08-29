import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export interface ReceiptPayload {
  /** Identificador do recibo (será usado no nome do ficheiro) */
  receiptNumber: string;
  /** Sistema: FFH ou FPD (apenas usado no nº de recibo) */
  system: "FFH" | "FPD" | "FDP";
  residentName: string;
  residentId: string; // ex: "1-2-3" ou "Apt 12"
  contacto?: string;
  /** Categoria do morador (ex: Quitadas, 1ª Fase via Cedsif...) */
  categoria?: string;
  /** Distribuição do pagamento (uma linha por taxa coberta) */
  allocations: Array<{
    period: string; // ex: "Janeiro/2025" ou "Dívida histórica"
    amount: number;
  }>;
  /** Lista de meses efetivamente pagos (ex: ["Janeiro/2025", "Fevereiro/2025"]) */
  paidMonths?: string[];
  totalPago: number;
  paymentMethod: string;
  paymentDate: Date;
  saldoRemanescente: number;
}

const LOGO_URL = "/FHGCJ.png";

const formatMt = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + " MT";

const loadLogoDataUrl = async (): Promise<string | null> => {
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateReceiptPdf = async (data: ReceiptPayload): Promise<Blob> => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 15;
  let y = margin;

  const logo = await loadLogoDataUrl();
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, y, 20, 20); } catch { /* ignore */ }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Vila Olímpica", W - margin, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Taxa de Condomínio", W - margin, y + 12, { align: "right" });
  doc.text("Recibo de Pagamento", W - margin, y + 17, { align: "right" });

  y += 28;
  doc.setDrawColor(180);
  doc.line(margin, y, W - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(String(`Recibo Nº: ${data.receiptNumber}`), margin, y);
  doc.text(String(`Data: ${data.paymentDate.toLocaleDateString("pt-PT")}`), W - margin, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Morador: ${data.residentName}`, margin, y); y += 5;
  doc.text(`ID: ${data.residentId}`, margin, y); y += 5;
  if (data.contacto) { doc.text(`Contacto: ${data.contacto}`, margin, y); y += 5; }
  if (data.categoria) { doc.text(`Categoria: ${data.categoria}`, margin, y); y += 5; }
  doc.text(`Via de pagamento: ${data.paymentMethod}`, margin, y); y += 8;

  // Tabela de distribuição
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, W - margin * 2, 7, "F");
  doc.text("Período / Item", margin + 2, y + 5);
  doc.text("Valor (MT)", W - margin - 2, y + 5, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "normal");
  data.allocations.forEach((a) => {
    doc.text(a.period, margin + 2, y + 5);
    doc.text(formatMt(a.amount), W - margin - 2, y + 5, { align: "right" });
    y += 6;
  });

  y += 4;
  doc.setDrawColor(180);
  doc.line(margin, y, W - margin, y);
  y += 6;

  // Meses pagos (resumo explícito)
  if (data.paidMonths && data.paidMonths.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Meses pagos:", margin, y);
    doc.setFont("helvetica", "normal");
    const txt = data.paidMonths.join(", ");
    const lines = doc.splitTextToSize(txt, W - margin * 2 - 30);
    doc.text(lines, margin + 28, y);
    y += Math.max(6, lines.length * 5) + 2;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Pago:", margin, y);
  doc.text(formatMt(data.totalPago), W - margin, y, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Saldo remanescente (total):", margin, y);
  doc.setTextColor(data.saldoRemanescente > 0 ? 200 : 30, data.saldoRemanescente > 0 ? 30 : 130, 30);
  doc.text(formatMt(data.saldoRemanescente), W - margin, y, { align: "right" });
  doc.setTextColor(0);
  y += 14;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Documento emitido eletronicamente pelo sistema de gestão de condomínio.", W / 2, 285, { align: "center" });
  doc.text("Desenvolvido por EFATA SERVICES SU LDA", W / 2, 290, { align: "center" });

  return doc.output("blob");
};

/** Envia o recibo (PDF) para o morador via janela de comunicação. */
export const sendReceiptToResident = async (params: {
  pdf: Blob;
  fileName: string;
  adminUserId: string;
  residentUserId: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> => {
  const { pdf, fileName, adminUserId, residentUserId, message } = params;
  const path = `${adminUserId}/${Date.now()}-${fileName}`;
  const upload = await supabase.storage
    .from("message-attachments")
    .upload(path, pdf, { contentType: "application/pdf" });
  if (upload.error) return { ok: false, error: upload.error.message };

  const signed = await supabase.storage
    .from("message-attachments")
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  const { error } = await supabase.from("messages").insert({
    sender_id: adminUserId,
    recipient_id: residentUserId,
    is_from_admin: true,
    content: message,
    attachment_url: signed.data?.signedUrl || path,
    attachment_name: fileName,
    attachment_type: "application/pdf",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
