import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Taxa, Unidade, MESES_LABELS, MESES_SHORT, formatCurrency } from "./types";
import { generateReceiptPdf, downloadBlob } from "@/lib/paymentReceipt";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  unidade: Unidade | null;
  taxas: Taxa[];
  adminUserId?: string | null;
  residentUserId?: string | null;
  system?: "FFH" | "FPD";
}

interface PaidRow {
  taxa: Taxa;
  saldoInicial: number;
  pago: number;
  saldoFinal: number;
}

const PaymentHistoryDialog = ({
  open,
  onOpenChange,
  unidade,
  taxas,
  adminUserId,
  residentUserId,
  system = "FFH",
}: Props) => {
  const { toast } = useToast();
  const [anoFiltro, setAnoFiltro] = useState<string>("todos");
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [sendingId, setSendingId] = useState<string | number | null>(null);

  const dadosMorador = useMemo(() => {
    if (!unidade) return { rows: [] as PaidRow[], anos: [] as number[] };
    const todas = taxas
      .filter((t) => t.unidade_id === unidade.id)
      .sort((a, b) =>
        a.ano_referencia !== b.ano_referencia
          ? a.ano_referencia - b.ano_referencia
          : a.mes_referencia - b.mes_referencia
      );

    let saldoCorrente = Math.max(0, (unidade.divida_anterior ?? unidade.divida_inicial ?? 0) - (unidade.pagamentos_historicos ?? 0));
    const allRows: PaidRow[] = todas.map((t) => {
      const saldoInicial = saldoCorrente + t.valor;
      const pago = t.valor_pago;
      const saldoFinal = Math.max(0, saldoInicial - pago);
      saldoCorrente = saldoFinal;
      return { taxa: t, saldoInicial, pago, saldoFinal };
    });

    // Apenas meses pagos (com pagamento registado)
    const rows = allRows.filter((r) => r.pago > 0);
    const anos = Array.from(new Set(rows.map((r) => r.taxa.ano_referencia))).sort((a, b) => b - a);
    return { rows, anos };
  }, [unidade, taxas]);

  const filteredRows = useMemo(() => {
    return dadosMorador.rows
      .filter((r) => anoFiltro === "todos" || r.taxa.ano_referencia === Number(anoFiltro))
      .filter((r) => mesFiltro === "todos" || r.taxa.mes_referencia === Number(mesFiltro))
      .reverse();
  }, [dadosMorador.rows, anoFiltro, mesFiltro]);

  const handleResendReceipt = async (row: PaidRow) => {
    if (!unidade) return;
    setSendingId(row.taxa.id);
    try {
      const receiptNumber = `REC-${system}-${String(row.taxa.id).slice(0, 8).toUpperCase()}`;
      const fileName = `${receiptNumber}.pdf`;
      const pdf = await generateReceiptPdf({
        receiptNumber,
        system,
        residentName: unidade.nome,
        residentId: `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`,
        contacto: unidade.contacto,
        allocations: [
          { period: `${MESES_LABELS[row.taxa.mes_referencia]}/${row.taxa.ano_referencia}`, amount: row.pago },
        ],
        totalPago: row.pago,
        paymentMethod: row.taxa.payment_method || "—",
        paymentDate: row.taxa.data_pagamento ? new Date(row.taxa.data_pagamento) : new Date(),
        saldoRemanescente: row.saldoFinal,
      });
      downloadBlob(pdf, fileName);
      toast({ title: "Recibo gerado", description: "O recibo PDF foi descarregado." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao gerar recibo.", variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  if (!unidade) return null;
  const idMorador = system === "FPD" ? `Apt ${unidade.apartamento}` : `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos — {unidade.nome}</DialogTitle>
          <DialogDescription>
            ID Morador: <span className="font-mono">{idMorador}</span> · Contacto: {unidade.contacto || "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={anoFiltro} onValueChange={setAnoFiltro}>
            <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Ano" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {dadosMorador.anos.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={mesFiltro} onValueChange={setMesFiltro}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Mês" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {Object.entries(MESES_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredRows.length} pagamento(s)
          </span>
        </div>

        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês/Ano</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead>Data do Pagamento</TableHead>
                <TableHead className="text-right">Saldo após Pagamento</TableHead>
                <TableHead>Via</TableHead>
                <TableHead className="text-right">Acção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sem pagamentos registados.</TableCell></TableRow>
              ) : filteredRows.map((r) => (
                <TableRow key={r.taxa.id}>
                  <TableCell className="text-xs font-medium">{MESES_SHORT[r.taxa.mes_referencia]}/{r.taxa.ano_referencia}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-emerald-600 font-medium">{formatCurrency(r.pago)}</TableCell>
                  <TableCell className="text-xs">{r.taxa.data_pagamento ? new Date(r.taxa.data_pagamento).toLocaleDateString("pt-PT") : "—"}</TableCell>
                  <TableCell className={`text-right tabular-nums text-xs font-medium ${r.saldoFinal > 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {formatCurrency(r.saldoFinal)}
                  </TableCell>
                  <TableCell className="text-xs">{r.taxa.payment_method || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={sendingId === r.taxa.id}
                      onClick={() => handleResendReceipt(r)}
                      title="Gerar e descarregar recibo"
                    >
                      {sendingId === r.taxa.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                      Baixar Recibo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentHistoryDialog;
