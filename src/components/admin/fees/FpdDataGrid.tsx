import { useState, useEffect, useMemo, useCallback, memo } from "react";

import { fpdApi, resolveMediaUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Loader2, Eye, Search, MoreVertical, Receipt } from "lucide-react";
import StatusBadge from "./StatusBadge";
import FeesPaymentDialog from "./PaymentDialog";
import { PaymentStatus, MESES_SHORT, MESES_LABELS, formatCurrency, calcStatus } from "./types";
import { cn } from "@/lib/utils";
import { feesCache } from "./feesCache";
import FpdMoradoresGrid from "./FpdMoradoresGrid";

interface FpdUnidade {
  id: string | number;
  ord: number;
  apartamento: number;
  nome: string;
  contacto: string;
  taxa: number;
  user_id?: string | number | null;
  divida_anterior?: number;
  pagamentos_historicos?: number;
}

interface FpdTaxa {
  id: string | number;
  unidade_id: string | number;
  mes_referencia: number;
  ano_referencia: number;
  valor: number;
  valor_pago: number;
  status: PaymentStatus;
  due_date: string;
  receipt_url?: string | null;
  payment_method?: string | null;
  data_pagamento?: string;
}

const PAGE_INCREMENT = 200;

const mapFeeStatus = (status: string, amount: number, valorPago: number): PaymentStatus => {
  if (status === "paid" || status === "em_dia") return "em_dia";
  if (status === "pending_verification" || status === "pendente") return "pendente";
  if (status === "overdue" || status === "em_atraso") return "em_atraso";
  if (status === "pending") return valorPago > 0 ? "pendente" : "em_atraso";
  return calcStatus(amount, valorPago);
};

const FpdDataGrid = () => {
  const [unidades, setUnidades] = useState<FpdUnidade[]>([]);
  const [taxas, setTaxas] = useState<FpdTaxa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<PaymentStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<FpdTaxa | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const [gerarOpen, setGerarOpen] = useState(false);
  const [gerarAno, setGerarAno] = useState(String(new Date().getFullYear()));
  const [gerarValor, setGerarValor] = useState("1000");
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  const [visibleCount, setVisibleCount] = useState(PAGE_INCREMENT);
  const { toast } = useToast();

  const fetchData = useCallback(async (opts: { force?: boolean } = {}) => {
    const cacheKey = `fdp:${anoFiltro}`;
    const cached = !opts.force ? feesCache.get<{ unidades: FpdUnidade[]; taxas: FpdTaxa[]; years: number[] }>(cacheKey) : null;
    if (cached) {
      setUnidades(cached.unidades);
      setTaxas(cached.taxas);
      setAvailableYears(cached.years);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [unidadesData, feesData, years] = await Promise.all([
        fpdApi.unidades.list(),
        fpdApi.fees.listByYear(anoFiltro),
        fpdApi.fees.listYears(),
      ]);

      const mappedUnidades: FpdUnidade[] = unidadesData.map((u) => ({
        id: u.id, ord: u.ord, apartamento: u.apartamento,
        nome: u.nome, contacto: u.contacto, taxa: Number(u.taxa),
        user_id: u.user_id,
        divida_anterior: Number(u.divida_anterior ?? 0),
        pagamentos_historicos: Number(u.pagamentos_historicos ?? 0),
      }));

      const mappedTaxas: FpdTaxa[] = feesData.map((t) => {
        const valor = Number(t.amount);
        const valorPago = Number(t.valor_pago || 0);
        return {
          id: t.id, unidade_id: t.unidade_id,
          mes_referencia: t.reference_month,
          ano_referencia: t.reference_year,
          valor, valor_pago: valorPago,
          status: mapFeeStatus(t.status, valor, valorPago),
          due_date: t.due_date, receipt_url: t.receipt_url,
          payment_method: t.payment_method,
          data_pagamento: t.paid_at || undefined,
        };
      });

      setAvailableYears(years);
      setUnidades(mappedUnidades);
      setTaxas(mappedTaxas);
      feesCache.set(cacheKey, { unidades: mappedUnidades, taxas: mappedTaxas, years });
    } catch (error) {
      console.error("Erro ao carregar taxas FPD:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as taxas FPD.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, anoFiltro]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => {
    feesCache.invalidate("fdp:");
    fetchData({ force: true });
  }, [fetchData]);


  // Optimistic local update — avoids full refetch on row edits
  const updateTaxaLocal = useCallback((taxaId: string, patch: Partial<FpdTaxa>) => {
    setTaxas(prev => prev.map(t => t.id === taxaId ? { ...t, ...patch } : t));
  }, []);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>(availableYears);
    const cur = new Date().getFullYear();
    for (let y = cur - 10; y <= cur + 30; y++) set.add(y);
    return [...set].sort((a, b) => b - a);
  }, [availableYears]);

  const unidadeMap = useMemo(() => {
    const map: Record<string, FpdUnidade> = {};
    unidades.forEach(u => { map[u.id] = u; });
    return map;
  }, [unidades]);

  const taxasAno = taxas; // already filtered by year on the server

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return taxasAno
      .filter(t => {
        if (mesFiltro !== null && t.mes_referencia !== mesFiltro) return false;
        if (statusFiltro !== "todos" && t.status !== statusFiltro) return false;
        if (search) {
          const u = unidadeMap[t.unidade_id];
          if (!u) return false;
          const text = `${u.nome} ${u.contacto} ${u.apartamento}`.toLowerCase();
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
  }, [taxasAno, mesFiltro, statusFiltro, search, unidadeMap]);

  const visibleSlice = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const stats = useMemo(() => {
    const arr = taxasAno;
    return {
      total: arr.length,
      arrecadado: arr.reduce((s, t) => s + t.valor_pago, 0),
      divida: arr.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
      emDia: arr.filter(t => t.status === "em_dia").length,
      emAtraso: arr.filter(t => t.status === "em_atraso").length,
    };
  }, [taxasAno]);

  const handlePaymentSuccess = useCallback((taxaId: string, patch: any) => {
    updateTaxaLocal(taxaId, {
      valor_pago: patch.valor_pago,
      status: patch.status,
      payment_method: patch.payment_method,
    });
  }, [updateTaxaLocal]);

  const handleGerarTaxas = async () => {
    const ano = parseInt(gerarAno);
    const valor = parseFloat(gerarValor);
    if (!ano || !valor || unidades.length === 0) return;

    try {
      const { created, skipped } = await fpdApi.fees.generate({
        year: ano,
        amount: valor,
        unidadeIds: unidades.map((u) => Number(u.id)),
      });
      if (created === 0) {
        toast({ title: "Aviso", description: "Todas as taxas já existem para este ano." });
      } else {
        toast({ title: "Sucesso", description: `${created} taxa(s) gerada(s)${skipped > 0 ? ` (${skipped} já existiam)` : ""}.` });
        setGerarOpen(false);
        refresh();
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar as taxas.", variant: "destructive" });
    }
  };

  const handleViewReceipt = async (url: string) => {
    setReceiptLoading(true);
    setReceiptDialogOpen(true);
    setReceiptUrl(null);
    setReceiptIsPdf(url.toLowerCase().endsWith(".pdf"));
    setReceiptUrl(resolveMediaUrl(url));
    setReceiptLoading(false);
  };

  const statusChips: { value: PaymentStatus | "todos"; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "em_dia", label: "Em Dia" },
    { value: "pendente", label: "Pendente" },
    { value: "em_atraso", label: "Em Atraso" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Taxa de Condomínio FPD</h2>
          <p className="text-muted-foreground text-sm">
            {unidades.length} unidades · {taxasAno.length} taxas em {anoFiltro}
          </p>
        </div>
      </div>

      {/* Filtros de ano e mês (igual ao FFH) */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={String(anoFiltro)} onValueChange={(v) => { setAnoFiltro(Number(v)); setVisibleCount(PAGE_INCREMENT); }}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map(a => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Taxas</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">Arrecadado</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-emerald-700 dark:text-emerald-400">{formatCurrency(stats.arrecadado)}</p>
          </CardContent>
        </Card>
        <Card className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 font-medium">Dívida</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-red-700 dark:text-red-400">{formatCurrency(stats.divida)}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Em Dia</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.emDia}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Em Atraso</p>
            <p className="text-xl font-bold tabular-nums mt-1">{stats.emAtraso}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={mesFiltro === null ? "todos" : String(mesFiltro)} onValueChange={(v) => { setMesFiltro(v === "todos" ? null : Number(v)); setVisibleCount(PAGE_INCREMENT); }}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os meses</SelectItem>
            {Object.entries(MESES_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela morador-centric */}
      <FpdMoradoresGrid unidades={unidades} taxas={taxas as any} onRefresh={refresh} />

      {/* Payment Dialog (com via + histórico) */}
      <FeesPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={(o) => { setPaymentDialogOpen(o); if (!o) setPaymentDialog(null); }}
        taxa={paymentDialog}
        inquilinoNome={paymentDialog ? unidadeMap[paymentDialog.unidade_id]?.nome : undefined}
        inquilinoSubtitulo={
          paymentDialog && unidadeMap[paymentDialog.unidade_id]
            ? `Apt ${unidadeMap[paymentDialog.unidade_id].apartamento}`
            : undefined
        }
        taxasInquilino={
          paymentDialog
            ? taxas.filter((t) => t.unidade_id === paymentDialog.unidade_id)
            : []
        }
        table="fpd_fees"
        onSuccess={handlePaymentSuccess}
      />

      {/* Generate Fees Dialog */}
      <Dialog open={gerarOpen} onOpenChange={setGerarOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Taxas FPD</DialogTitle>
            <DialogDescription>Gerar taxas mensais para um novo ano</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ano</Label>
              <Input type="number" value={gerarAno} onChange={(e) => setGerarAno(e.target.value)} />
            </div>
            <div>
              <Label>Valor Mensal (MT)</Label>
              <Input type="number" step="0.01" value={gerarValor} onChange={(e) => setGerarValor(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleGerarTaxas}>
              Gerar Taxas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Comprovativo de Pagamento
            </DialogTitle>
            <DialogDescription>Pré-visualização do comprovativo</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 pt-4 flex items-center justify-center min-h-[300px]">
            {receiptLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : receiptUrl ? (
              receiptIsPdf ? (
                <iframe src={receiptUrl} className="w-full h-[60vh] rounded-lg border" title="Comprovativo PDF" />
              ) : (
                <img src={receiptUrl} alt="Comprovativo" className="max-w-full max-h-[60vh] rounded-lg border object-contain" />
              )
            ) : (
              <p className="text-muted-foreground">Não foi possível carregar.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FpdDataGrid;
