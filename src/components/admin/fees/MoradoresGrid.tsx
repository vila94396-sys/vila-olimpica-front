import { useMemo, useState, memo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, CreditCard, History, Pencil, CheckCircle2, AlertCircle, Printer, FileText } from "lucide-react";
import EditUnidadeDialog from "./EditUnidadeDialog";
import PaymentHistoryDialog from "./PaymentHistoryDialog";
import CascadePaymentDialog from "./CascadePaymentDialog";
import { Taxa, Unidade, formatCurrency, MESES_LABELS, CATEGORIAS_LABELS, CATEGORIAS_LIST } from "./types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { generateReceiptPdf, downloadBlob } from "@/lib/paymentReceipt";
import { generateDebtorsPdf } from "@/lib/debtorsReport";
import { useToast } from "@/hooks/use-toast";

interface Props {
  taxas: Taxa[];
  unidades: Unidade[];
  anoFiltro: number;
  onRefresh: () => void;
}

interface MoradorRow {
  unidade: Unidade;
  idLegivel: string;
  dividaAcumulada: number;
  dividaPosSistema: number;
  dividaMes: number;
  dividaTotal: number;
  pagouMesActual: boolean;
}

const PAGE_INCREMENT = 100;
type DebtFilter = "todos" | "acumuladas" | "pos_sistema";

const MoradoresGrid = ({ taxas, unidades, anoFiltro, onRefresh }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_dia" | "em_atraso">("todos");
  const [debtFilter, setDebtFilter] = useState<DebtFilter>("todos");
  const [paymentUnidade, setPaymentUnidade] = useState<Unidade | null>(null);
  const [editUnidade, setEditUnidade] = useState<Unidade | null>(null);
  const [historyUnidade, setHistoryUnidade] = useState<Unidade | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_INCREMENT);

  const handlePrintReceipt = useCallback(async (unidade: Unidade, system: "FFH" | "FPD" = "FFH") => {
    const ts = (taxas || []).filter((t) => t.unidade_id === unidade.id && t.valor_pago > 0)
      .sort((a, b) => (b.ano_referencia - a.ano_referencia) || (b.mes_referencia - a.mes_referencia));
    if (ts.length === 0) {
      toast({ title: "Sem pagamentos", description: "Esta unidade ainda não tem pagamentos registados.", variant: "destructive" });
      return;
    }
    const last = ts[0];
    const receiptNumber = `REC-${system}-${String(last.id).slice(0, 8).toUpperCase()}`;
    const paidMonths = ts
      .sort((a, b) => (a.ano_referencia - b.ano_referencia) || (a.mes_referencia - b.mes_referencia))
      .map((t) => `${MESES_LABELS[t.mes_referencia]}/${t.ano_referencia}`);
    const saldoTotal = (taxas || [])
      .filter((t) => t.unidade_id === unidade.id)
      .reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0)
      + Math.max(0, (unidade.divida_anterior ?? unidade.divida_inicial ?? 0) - (unidade.pagamentos_historicos ?? 0));
    const pdf = await generateReceiptPdf({
      receiptNumber,
      system,
      residentName: unidade.nome,
      residentId: `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`,
      contacto: unidade.contacto,
      categoria: CATEGORIAS_LABELS[unidade.categoria],
      allocations: [{ period: `${MESES_LABELS[last.mes_referencia]}/${last.ano_referencia}`, amount: last.valor_pago }],
      paidMonths,
      totalPago: last.valor_pago,
      paymentMethod: last.payment_method || "—",
      paymentDate: last.data_pagamento ? new Date(last.data_pagamento) : new Date(),
      saldoRemanescente: saldoTotal,
    });
    downloadBlob(pdf, `${receiptNumber}.pdf`);
  }, [taxas, toast]);

  const taxasPorUnidade = useMemo(() => {
    const map: Record<string, Taxa[]> = {};
    for (const t of taxas) {
      (map[t.unidade_id] ||= []).push(t);
    }
    return map;
  }, [taxas]);

  const TAXA_MENSAL = 1000;
  const rows: MoradorRow[] = useMemo(() => {
    const hoje = new Date();
    const anoH = hoje.getFullYear();
    const mesH = hoje.getMonth() + 1;
    return unidades.map((u) => {
      const ts = taxasPorUnidade[u.id] || [];
      const dividaAcumulada = Math.max(0, (u.divida_anterior ?? u.divida_inicial ?? 0) - (u.pagamentos_historicos ?? 0));
      const dividaPosSistema = ts.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0);
      const taxaMes = ts.find((t) => t.ano_referencia === anoH && t.mes_referencia === mesH);
      const pagouMesActual = !!taxaMes && taxaMes.valor_pago >= taxaMes.valor;
      return {
        unidade: u,
        idLegivel: `${u.bloco}-${u.edificio}-${u.apartamento}`,
        dividaAcumulada,
        dividaPosSistema,
        dividaMes: TAXA_MENSAL,
        dividaTotal: dividaAcumulada + dividaPosSistema,
        pagouMesActual,
      };
    });
  }, [unidades, taxasPorUnidade]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s+/g, "");
    return rows.filter((r) => {
      if (statusFilter === "em_dia" && !r.pagouMesActual) return false;
      if (statusFilter === "em_atraso" && r.pagouMesActual) return false;
      if (debtFilter === "acumuladas" && r.dividaAcumulada <= 0) return false;
      if (debtFilter === "pos_sistema" && r.dividaPosSistema <= 0) return false;
      if (!q) return true;
      const hay = `${r.unidade.nome} ${r.unidade.contacto} ${r.idLegivel}`.toLowerCase().replace(/\s+/g, "");
      return hay.includes(q);
    });
  }, [rows, search, statusFilter, debtFilter]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const chips: { value: typeof statusFilter; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "em_dia", label: "Em Dia" },
    { value: "em_atraso", label: "Em Atraso" },
  ];
  const debtChips: { value: DebtFilter; label: string }[] = [
    { value: "todos", label: "Todas as dívidas" },
    { value: "acumuladas", label: "Só acumuladas (antes do sistema)" },
    { value: "pos_sistema", label: "Só depois do sistema" },
  ];

  const handlePrintReport = useCallback(async () => {
    if (!filtered.length) {
      toast({ title: "Sem registos", description: "Nenhum morador corresponde ao filtro actual.", variant: "destructive" });
      return;
    }
    const debtLabel = debtChips.find((c) => c.value === debtFilter)?.label || "Todas";
    const statusLabel = chips.find((c) => c.value === statusFilter)?.label || "Todos";
    const orderedCat = new Map<string, number>();
    CATEGORIAS_LIST.forEach((c, i) => orderedCat.set(CATEGORIAS_LABELS[c], i));
    const rowsOut = [...filtered]
      .sort((a, b) => {
        const ai = orderedCat.get(CATEGORIAS_LABELS[a.unidade.categoria]) ?? 99;
        const bi = orderedCat.get(CATEGORIAS_LABELS[b.unidade.categoria]) ?? 99;
        if (ai !== bi) return ai - bi;
        return a.unidade.nome.localeCompare(b.unidade.nome);
      })
      .map((r) => ({
        idLegivel: r.idLegivel,
        nome: r.unidade.nome,
        contacto: r.unidade.contacto || "",
        categoriaLabel: CATEGORIAS_LABELS[r.unidade.categoria],
        dividaAcumulada: r.dividaAcumulada,
        dividaPosSistema: r.dividaPosSistema,
        dividaTotal: r.dividaTotal,
      }));
    const pdf = await generateDebtorsPdf({
      system: "FFH",
      title: "Relatório de Devedores — FFH",
      subtitle: `Ano de referência: ${anoFiltro}`,
      filterLabel: `${debtLabel}  •  Status: ${statusLabel}`,
      groupByCategoria: true,
      rows: rowsOut,
    });
    downloadBlob(pdf, `devedores-ffh-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [filtered, debtFilter, statusFilter, anoFiltro, toast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1.5 flex-wrap">
            {chips.map((c) => (
              <button
                key={c.value}
                onClick={() => { setStatusFilter(c.value); setVisibleCount(PAGE_INCREMENT); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  statusFilter === c.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por ID (bloco-edif-apt), nome ou contacto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_INCREMENT); }}
              className="pl-10 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handlePrintReport}>
            <FileText className="w-4 h-4 mr-2" />
            Imprimir PDF por Fase
          </Button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {debtChips.map((c) => (
            <button
              key={c.value}
              onClick={() => { setDebtFilter(c.value); setVisibleCount(PAGE_INCREMENT); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                debtFilter === c.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Morador</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Dívida Acumulada</TableHead>
              <TableHead className="text-right">Taxa Mensal</TableHead>
              <TableHead className="text-right">Dívida Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  Nenhum morador encontrado.
                </TableCell>
              </TableRow>
            ) : visible.map((r) => (
              <TableRow key={r.unidade.id} className="hover:bg-accent/50">
                <TableCell className="font-mono text-xs font-semibold">{r.idLegivel}</TableCell>
                <TableCell className="font-medium text-sm max-w-[200px] truncate">{r.unidade.nome}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.unidade.contacto || "—"}</TableCell>
                <TableCell className={cn("text-right tabular-nums text-sm", r.dividaAcumulada > 0 ? "text-destructive font-medium" : "text-muted-foreground")}>
                  {r.dividaAcumulada > 0 ? formatCurrency(r.dividaAcumulada) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {formatCurrency(r.dividaMes)}
                </TableCell>
                <TableCell className={cn("text-right tabular-nums text-sm font-bold", r.dividaTotal > 0 ? "text-destructive" : "text-emerald-600")}>
                  {formatCurrency(r.dividaTotal)}
                </TableCell>
                <TableCell>
                  {r.pagouMesActual ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Em Dia
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" /> Em Atraso
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPaymentUnidade(r.unidade)}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Registar Pagamento
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setHistoryUnidade(r.unidade)}>
                        <History className="w-4 h-4 mr-2" />
                        Ver Histórico de Pagamentos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditUnidade(r.unidade)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar Unidade
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrintReceipt(r.unidade, "FFH")}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Recibo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>A mostrar {Math.min(visibleCount, filtered.length)} de {filtered.length} moradores</span>
        {visibleCount < filtered.length && (
          <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_INCREMENT)}>
            Carregar mais
          </Button>
        )}
      </div>

      {paymentUnidade && (
        <CascadePaymentDialog
          open={!!paymentUnidade}
          onOpenChange={(o) => { if (!o) setPaymentUnidade(null); }}
          system="FFH"
          table="condominium_fees"
          unidade={{
            id: paymentUnidade.id,
            nome: paymentUnidade.nome,
            contacto: paymentUnidade.contacto,
            idLegivel: `${paymentUnidade.bloco}-${paymentUnidade.edificio}-${paymentUnidade.apartamento}`,
            user_id: (paymentUnidade as any).user_id ?? null,
            divida_anterior: paymentUnidade.divida_anterior ?? paymentUnidade.divida_inicial ?? 0,
            pagamentos_historicos: paymentUnidade.pagamentos_historicos ?? 0,
            categoria: CATEGORIAS_LABELS[paymentUnidade.categoria],
          }}
          taxasInquilino={(taxasPorUnidade[paymentUnidade.id] || []).map((t) => ({
            id: t.id,
            unidade_id: t.unidade_id,
            mes_referencia: t.mes_referencia,
            ano_referencia: t.ano_referencia,
            valor: t.valor,
            valor_pago: t.valor_pago,
            status: t.status,
          }))}
          onSuccess={onRefresh}
        />
      )}

      <EditUnidadeDialog
        open={!!editUnidade}
        onOpenChange={(o) => { if (!o) setEditUnidade(null); }}
        unidade={editUnidade}
        onSaved={onRefresh}
      />

      <PaymentHistoryDialog
        open={!!historyUnidade}
        onOpenChange={(o) => { if (!o) setHistoryUnidade(null); }}
        unidade={historyUnidade}
        taxas={taxas}
        adminUserId={user?.id}
        residentUserId={(historyUnidade as any)?.user_id ?? null}
        system="FFH"
      />
    </div>
  );
};

export default MoradoresGrid;
