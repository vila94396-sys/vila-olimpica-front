import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptData {
  id: string;
  referenceMonth: string;
  referenceYear: number;
  amount: number;
  paidAt: string | null;
  paymentMethod: string;
  residentEmail: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(value);

export const generatePaymentReceipt = (data: ReceiptData) => {
  const paidDate = data.paidAt
    ? format(new Date(data.paidAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : "—";
  const receiptNumber = `REC-${data.referenceYear}${data.referenceMonth?.slice(0, 3).toUpperCase()}-${data.id.slice(0, 6).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Comprovativo de Pagamento - ${receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .receipt { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .header { background: #1a365d; color: #fff; padding: 30px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .badge { display: inline-block; background: #22c55e; color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; letter-spacing: 1px; }
    .body { padding: 30px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 13px; }
    .value { font-weight: 600; color: #1f2937; font-size: 14px; text-align: right; }
    .amount-row .value { font-size: 22px; color: #1a365d; }
    .footer { background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 11px; color: #9ca3af; }
    .receipt-id { font-family: monospace; font-size: 11px; color: #9ca3af; margin-top: 8px; }
    @media print { body { padding: 0; background: #fff; } .receipt { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Vila Olímpica</h1>
      <p>Condomínio Residencial</p>
      <div class="badge">PAGO ✓</div>
    </div>
    <div class="body">
      <h2 style="font-size:16px; color:#374151; margin-bottom:20px; text-align:center;">Comprovativo de Pagamento</h2>
      <div class="row">
        <span class="label">Nº Comprovativo</span>
        <span class="value">${receiptNumber}</span>
      </div>
      <div class="row">
        <span class="label">Referência</span>
        <span class="value">${data.referenceMonth} de ${data.referenceYear}</span>
      </div>
      <div class="row amount-row">
        <span class="label">Valor Pago</span>
        <span class="value">${formatCurrency(data.amount)}</span>
      </div>
      <div class="row">
        <span class="label">Data do Pagamento</span>
        <span class="value">${paidDate}</span>
      </div>
      <div class="row">
        <span class="label">Método de Pagamento</span>
        <span class="value">${data.paymentMethod}</span>
      </div>
      <div class="row">
        <span class="label">Morador</span>
        <span class="value">${data.residentEmail}</span>
      </div>
    </div>
    <div class="footer">
      <p>Este documento serve como comprovativo de pagamento da taxa condominial.</p>
      <p class="receipt-id">ID: ${data.id}</p>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onafterprint = () => {
      URL.revokeObjectURL(url);
    };
  }
};
