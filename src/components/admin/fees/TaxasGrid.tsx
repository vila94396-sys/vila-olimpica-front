import { useState, useMemo, useCallback, memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Receipt, Eye, CreditCard, History, Pencil } from "lucide-react";
import StatusBadge from "./StatusBadge";
import FeesPaymentDialog from "./PaymentDialog";
import EditUnidadeDialog from "./EditUnidadeDialog";
import PaymentHistoryDialog from "./PaymentHistoryDialog";
import { Taxa, Unidade, PaymentStatus, MESES_SHORT, formatCurrency, getDividaHistorica } from "./types";
import { cn } from "@/lib/utils";
import { ffhApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TaxasGridProps {
  taxas: Taxa[];
  unidades: Unidade[];
  anoFiltro: number;
  mesFiltro: number | null;
  onRefresh: () => void;
  onUpdateTaxaLocal?: (taxaId: string, patch: Partial<Taxa>) => void;
  onDeleteUnidade?: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

const PAGE_INCREMENT = 200;

const STATUS_MAP: Record<PaymentStatus, "PENDING" | "PAID" | "OVERDUE"> = {
  em_dia: "PAID",
  pendente: "PENDING",
  em_atraso: "OVERDUE",
  arquivado: "PENDING",
};

interface RowProps {
  taxa: Taxa;
  unidade: Unidade;
  onStatusChange: (id: string | number, status: PaymentStatus) => void;
  onOpenPayment: (taxa: Taxa, divida: number) => void;
  onViewReceipt: (url: string) => void;
  onViewHistory: (u: Unidade) => void;
  onEditUnidade: (u: Unidade) => void;
  dividaTotalUnidade: number;
  dividaHistoricaUnidade: number;
}

const TaxaRow = memo(({ taxa, unidade, onStatusChange, onOpenPayment, onViewReceipt, onViewHistory, onEditUnidade, dividaTotalUnidade, dividaHistoricaUnidade }: RowProps) => {
  const divida = Math.max(0, taxa.valor - taxa.valor_pago);
  const idMorador = `${unidade.bloco}-${unidade.edificio}-${unidade.apartamento}`;
  return (
    <TableRow className="group hover:bg-accent/50">
      <TableCell className="text-xs text-muted-foreground tabular-nums">{unidade.ord}</TableCell>
      <TableCell className="font-medium text-xs">{MESES_SHORT[taxa.mes_referencia]}</TableCell>
      <TableCell className="font-mono text-xs font-semibold">{idMorador}</TableCell>
      <TableCell className="max-w-[180px] truncate text-sm font-medium">{unidade.nome}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{unidade.contacto || "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(taxa.valor)}</TableCell>
      <TableCell className="text-right tabular-nums text-sm text-emerald-600 font-medium">{formatCurrency(taxa.valor_pago)}</TableCell>
      <TableCell className={cn("text-right tabular-nums text-sm font-medium", divida > 0 ? "text-destructive" : "")}>
        {divida > 0 ? formatCurrency(divida) : "—"}
      </TableCell>
      <TableCell
        className={cn("text-right tabular-nums text-sm font-semibold", dividaHistoricaUnidade > 0 ? "text-destructive" : "text-muted-foreground")}
        title="Dívida histórica herdada do Excel (anterior ao sistema)"
      >
        {dividaHistoricaUnidade > 0 ? formatCurrency(dividaHistoricaUnidade) : "—"}
      </TableCell>
      <TableCell
        className={cn("text-right tabular-nums text-sm font-bold", dividaTotalUnidade > 0 ? "text-destructive" : "text-muted-foreground")}
        title="Dívida total acumulada do inquilino até hoje (histórica + meses vencidos)"
      >
        {dividaTotalUnidade > 0 ? formatCurrency(dividaTotalUnidade) : "—"}
      </TableCell>
      <TableCell>
        <StatusBadge status={taxa.status} onStatusChange={(s) => onStatusChange(taxa.id, s)} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenPayment(taxa, divida)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Registar Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewHistory(unidade)}>
              <History className="w-4 h-4 mr-2" />
              Ver Histórico de Pagamentos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditUnidade(unidade)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar Unidade
            </DropdownMenuItem>
            {taxa.receipt_url && (
              <DropdownMenuItem onClick={() => onViewReceipt(taxa.receipt_url!)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Comprovativo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
TaxaRow.displayName = "TaxaRow";

const TaxasGrid = ({ taxas, unidades, anoFiltro, mesFiltro, onRefresh, onUpdateTaxaLocal, onViewReceipt }: TaxasGridProps) => {
  const [statusFiltro, setStatusFiltro] = useState<PaymentStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<Taxa | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editUnidade, setEditUnidade] = useState<Unidade | null>(null);
  const [historyUnidade, setHistoryUnidade] = useState<Unidade | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_INCREMENT);
  const { toast } = useToast();

  const unidadeMap = useMemo(() => {
    const map: Record<string, Unidade> = {};
    unidades.forEach(u => { map[u.id] = u; });
    return map;
  }, [unidades]);

  /** Dívida histórica (anterior ao sistema) por unidade — max(divida_anterior - pagamentos_historicos, 0) */
  const dividaHistoricaPorUnidade = useMemo(() => {
    const map: Record<string, number> = {};
    unidades.forEach(u => { map[u.id] = getDividaHistorica(u); });
    return map;
  }, [unidades]);

  /** Dívida total acumulada por unidade (até hoje): histórica + Σ meses vencidos não pagos */
  const dividaTotalPorUnidade = useMemo(() => {
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth() + 1;
    const map: Record<string, number> = { ...dividaHistoricaPorUnidade };
    taxas.forEach(t => {
      if (t.ano_referencia > anoHoje) return;
      if (t.ano_referencia === anoHoje && t.mes_referencia > mesHoje) return;
      const d = Math.max(0, t.valor - t.valor_pago);
      if (d > 0) map[t.unidade_id] = (map[t.unidade_id] ?? 0) + d;
    });
    return map;
  }, [dividaHistoricaPorUnidade, taxas]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return taxas
      .filter(t => {
        if (t.ano_referencia !== anoFiltro) return false;
        if (mesFiltro !== null && t.mes_referencia !== mesFiltro) return false;
        if (statusFiltro !== "todos" && t.status !== statusFiltro) return false;
        if (search) {
          const u = unidadeMap[t.unidade_id];
          if (!u) return false;
          const idMorador = `${u.bloco}-${u.edificio}-${u.apartamento}`;
          const text = `${u.nome} ${u.contacto} ${idMorador}`.toLowerCase();
          if (!text.includes(searchLower)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.mes_referencia !== b.mes_referencia) return a.mes_referencia - b.mes_referencia;
        const uA = unidadeMap[a.unidade_id];
        const uB = unidadeMap[b.unidade_id];
        return (uA?.ord || 0) - (uB?.ord || 0);
      });
  }, [taxas, anoFiltro, mesFiltro, statusFiltro, search, unidadeMap]);

  // Reset pagination when filters change
  const visibleSlice = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const handleStatusChange = useCallback(async (taxaId: string, newStatus: PaymentStatus) => {
    // Optimistic update
    onUpdateTaxaLocal?.(taxaId, { status: newStatus });
    try {
      await ffhApi.fees.updateStatus(Number(taxaId), STATUS_MAP[newStatus]);
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
      onRefresh();
    }
  }, [onUpdateTaxaLocal, onRefresh, toast]);

  const handleOpenPayment = useCallback((taxa: Taxa, _divida: number) => {
    setPaymentDialog(taxa);
    setPaymentDialogOpen(true);
  }, []);

  const handlePaymentSuccess = useCallback((taxaId: string, patch: any) => {
    onUpdateTaxaLocal?.(taxaId, {
      valor_pago: patch.valor_pago,
      status: patch.status,
      data_pagamento: patch.data_pagamento,
      payment_method: patch.payment_method,
    });
  }, [onUpdateTaxaLocal]);

  const statusChips: { value: PaymentStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "em_dia", label: "Em Dia" },
    { value: "pendente", label: "Pendente" },
    { value: "em_atraso", label: "Em Atraso" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1.5 flex-wrap">
          {statusChips.map(chip => (
            <button
              key={chip.value}
              onClick={() => { setStatusFiltro(chip.value); setVisibleCount(PAGE_INCREMENT); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                statusFiltro === chip.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {chip.label}
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
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma taxa encontrada.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>ID Morador</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Dívida (mês)</TableHead>
                  <TableHead className="text-right" title="Dívida histórica anterior ao sistema (importada do Excel)">Dív. Acum.</TableHead>
                  <TableHead className="text-right" title="Dívida total acumulada do inquilino até hoje (histórica + meses vencidos)">Dívida total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSlice.map((taxa) => {
                  const u = unidadeMap[taxa.unidade_id];
                  if (!u) return null;
                  return (
                    <TaxaRow
                      key={taxa.id}
                      taxa={taxa}
                      unidade={u}
                      onStatusChange={handleStatusChange}
                      onOpenPayment={handleOpenPayment}
                      onViewReceipt={onViewReceipt}
                      onViewHistory={setHistoryUnidade}
                      onEditUnidade={setEditUnidade}
                      dividaHistoricaUnidade={dividaHistoricaPorUnidade[u.id] ?? 0}
                      dividaTotalUnidade={dividaTotalPorUnidade[u.id] ?? 0}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>A mostrar {Math.min(visibleCount, filtered.length)} de {filtered.length}</span>
            {visibleCount < filtered.length && (
              <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + PAGE_INCREMENT)}>
                Carregar mais
              </Button>
            )}
          </div>
        </>
      )}

      {/* Payment Dialog (com via + histórico) */}
      <FeesPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={(o) => { setPaymentDialogOpen(o); if (!o) setPaymentDialog(null); }}
        taxa={paymentDialog}
        inquilinoNome={paymentDialog ? unidadeMap[paymentDialog.unidade_id]?.nome : undefined}
        inquilinoSubtitulo={
          paymentDialog && unidadeMap[paymentDialog.unidade_id]
            ? `Bloco ${unidadeMap[paymentDialog.unidade_id].bloco} · Ed ${unidadeMap[paymentDialog.unidade_id].edificio} / Apt ${unidadeMap[paymentDialog.unidade_id].apartamento}`
            : undefined
        }
        dividaInicial={paymentDialog ? unidadeMap[paymentDialog.unidade_id]?.divida_inicial ?? 0 : 0}
        taxasInquilino={
          paymentDialog
            ? taxas.filter((t) => t.unidade_id === paymentDialog.unidade_id)
            : []
        }
        table="condominium_fees"
        onSuccess={handlePaymentSuccess}
      />

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
      />
    </div>
  );
};

export default TaxasGrid;
