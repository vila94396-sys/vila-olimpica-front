import { useState, useEffect, useMemo, useCallback } from "react";
import { ffhApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableProperties, BarChart3, Plus, Loader2 } from "lucide-react";
import { Unidade, Taxa, PaymentStatus, CategoriaUnidade, MESES_LABELS, CATEGORIAS_LABELS, CATEGORIAS_LIST, formatCurrency, calcStatus, getDividaHistorica } from "./types";
import MoradoresGrid from "./MoradoresGrid";
import ReportsView from "./ReportsView";
import TotalColectadoView from "./TotalColectadoView";
import GerarTaxasDialog from "./GerarTaxasDialog";
import AddRecordSheet from "./AddRecordSheet";
import { cn } from "@/lib/utils";
import { feesCache } from "./feesCache";

type TabValue = CategoriaUnidade | "total_colectado";

const mapFeeStatus = (status: string, amount: number, valorPago: number): PaymentStatus => {
  if (status === "em_dia" || status === "paid") return "em_dia";
  if (status === "pendente" || status === "pending_verification") return "pendente";
  if (status === "em_atraso" || status === "overdue") return "em_atraso";
  if (status === "pending") return valorPago > 0 ? "pendente" : "em_atraso";
  return calcStatus(amount, valorPago);
};

const TAB_LIST: { value: TabValue; label: string }[] = [
  ...CATEGORIAS_LIST.map(c => ({ value: c as TabValue, label: CATEGORIAS_LABELS[c] })),
  { value: "total_colectado", label: "Total Colectado" },
];

const DataGrid = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [taxas, setTaxas] = useState<Taxa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("quitadas");
  const [vista, setVista] = useState<"tabela" | "relatorios">("tabela");
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [gerarOpen, setGerarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  const [availableYears, setAvailableYearsState] = useState<number[]>([new Date().getFullYear()]);

  const fetchData = useCallback(async (opts: { force?: boolean } = {}) => {
    const cacheKey = `ffh:${anoFiltro}`;
    const cached = !opts.force ? feesCache.get<{ unidades: Unidade[]; taxas: Taxa[]; years: number[] }>(cacheKey) : null;

    if (cached) {
      setUnidades(cached.unidades);
      setTaxas(cached.taxas);
      setAvailableYearsState(cached.years);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [unidadesData, taxasData, years] = await Promise.all([
        ffhApi.unidades.list(),
        ffhApi.fees.listByYear(anoFiltro),
        ffhApi.fees.listYears(),
      ]);

      const mappedUnidades: Unidade[] = unidadesData.map((u) => ({
        id: u.id,
        ord: u.ord,
        bloco: u.bloco,
        edificio: u.edificio,
        apartamento: u.apartamento,
        nome: u.nome,
        contacto: u.contacto,
        via: u.via,
        categoria: (u.categoria || "quitadas") as CategoriaUnidade,
        divida_anterior: u.divida_anterior,
        pagamentos_historicos: u.pagamentos_historicos,
        user_id: u.user_id,
      }));

      const mappedTaxas: Taxa[] = taxasData.map((t) => {
        const valor = Number(t.amount);
        const valorPago = Number(t.valor_pago || 0);
        return {
          id: t.id,
          unidade_id: t.unidade_id,
          mes_referencia: t.reference_month,
          ano_referencia: t.reference_year,
          valor,
          valor_pago: valorPago,
          data_pagamento: t.paid_at || undefined,
          status: mapFeeStatus(t.status, valor, valorPago),
          due_date: t.due_date,
          receipt_url: t.receipt_url,
          payment_method: t.payment_method || undefined,
        };
      });

      setAvailableYearsState(years);
      setUnidades(mappedUnidades);
      setTaxas(mappedTaxas);
      feesCache.set(cacheKey, { unidades: mappedUnidades, taxas: mappedTaxas, years });
    } catch (error) {
      console.error("Erro ao carregar taxas:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as taxas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, anoFiltro]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => {
    feesCache.invalidate("ffh:");
    fetchData({ force: true });
  }, [fetchData]);


  // Optimistic local update — avoids full refetch on row edits
  const updateTaxaLocal = useCallback((taxaId: string, patch: Partial<Taxa>) => {
    setTaxas(prev => prev.map(t => t.id === taxaId ? { ...t, ...patch } : t));
  }, []);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>(availableYears);
    const cur = new Date().getFullYear();
    for (let y = cur - 10; y <= cur + 30; y++) set.add(y);
    return [...set].sort((a, b) => b - a);
  }, [availableYears]);

  // Filter unidades and taxas by active category
  const filteredUnidades = useMemo(() => {
    if (activeTab === "total_colectado") return unidades;
    return unidades.filter(u => u.categoria === activeTab);
  }, [unidades, activeTab]);

  const filteredUnidadeIds = useMemo(() => new Set(filteredUnidades.map(u => u.id)), [filteredUnidades]);

  const filteredTaxas = useMemo(() => {
    if (activeTab === "total_colectado") return taxas;
    return taxas.filter(t => filteredUnidadeIds.has(t.unidade_id));
  }, [taxas, activeTab, filteredUnidadeIds]);

  const taxasAnoAtual = useMemo(() => filteredTaxas.filter(t => t.ano_referencia === anoFiltro), [filteredTaxas, anoFiltro]);

  const stats = useMemo(() => {
    const arr = taxasAnoAtual;
    return {
      total: arr.length,
      arrecadado: arr.reduce((s, t) => s + t.valor_pago, 0),
      divida: arr.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
      emDia: arr.filter(t => t.status === "em_dia").length,
      emAtraso: arr.filter(t => t.status === "em_atraso").length,
    };
  }, [taxasAnoAtual]);

  // Dívida acumulada histórica do escopo activo (categoria filtrada)
  const dividaAcumulada = useMemo(() => {
    let total = 0;
    let unidadesComDivida = 0;
    for (const u of filteredUnidades) {
      const d = getDividaHistorica(u);
      if (d > 0) { total += d; unidadesComDivida++; }
    }
    return { total, unidadesComDivida };
  }, [filteredUnidades]);

  const dataHoje = useMemo(() => new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }), []);

  const handleGerarTaxas = async (mes: number | null, ano: number, valor: number) => {
    const targetUnidades = activeTab !== "total_colectado" ? filteredUnidades : unidades;
    if (targetUnidades.length === 0) {
      toast({ title: "Erro", description: "Adicione unidades primeiro.", variant: "destructive" });
      return;
    }

    try {
      const { created, skipped } = await ffhApi.fees.generate({
        month: mes,
        year: ano,
        amount: valor,
        unidadeIds: targetUnidades.map((u) => Number(u.id)),
      });
      if (created === 0) {
        toast({ title: "Aviso", description: "Todas as taxas já existem para este período." });
      } else {
        toast({ title: "Sucesso", description: `${created} taxa(s) gerada(s)${skipped > 0 ? ` (${skipped} já existiam)` : ""}.` });
        refresh();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível gerar as taxas.", variant: "destructive" });
    }
  };

  const handleAddUnidade = async (data: { nome: string; bloco: number; edificio: number; apartamento: number; contacto: string; via: string; categoria: CategoriaUnidade }) => {
    try {
      await ffhApi.unidades.create(data);
      toast({ title: "Sucesso", description: "Unidade adicionada." });
      refresh();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar a unidade.", variant: "destructive" });
    }
  };

  const handleDeleteUnidade = async (id: string | number) => {
    try {
      await ffhApi.unidades.remove(Number(id));
      toast({ title: "Sucesso", description: "Unidade e taxas associadas removidas." });
      refresh();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover a unidade.", variant: "destructive" });
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Taxa de Condomínio</h2>
          <p className="text-muted-foreground text-sm">Sistema de gestão de pagamentos FFH</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-0.5 border">
            <button
              onClick={() => setVista("tabela")}
              className={cn(
                "p-2 rounded-md transition-colors",
                vista === "tabela" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableProperties className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista("relatorios")}
              className={cn(
                "p-2 rounded-md transition-colors",
                vista === "relatorios" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b">
        {TAB_LIST.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2",
              activeTab === tab.value
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
            {tab.value !== "total_colectado" && (
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full tabular-nums">
                {unidades.filter(u => u.categoria === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={String(anoFiltro)} onValueChange={(v) => setAnoFiltro(Number(v))}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map(a => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab !== "total_colectado" && (
          <Select value={mesFiltro === null ? "todos" : String(mesFiltro)} onValueChange={(v) => setMesFiltro(v === "todos" ? null : Number(v))}>
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
        )}

        <div className="flex-1" />

        {activeTab !== "total_colectado" && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nova Unidade
          </Button>
        )}
      </div>

      {/* Highlighted: Dívida acumulada histórica */}
      {vista === "tabela" && activeTab !== "total_colectado" && dividaAcumulada.total > 0 && (
        <Card className="border-2 border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 px-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-destructive font-semibold">
                Dívida Acumulada até {dataHoje}
              </p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-destructive">
                {formatCurrency(dividaAcumulada.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Unidades</p>
              <p className="text-xl font-semibold tabular-nums text-foreground">{dividaAcumulada.unidadesComDivida}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards (tabela view, not total_colectado) */}
      {vista === "tabela" && activeTab !== "total_colectado" && (
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
      )}

      {/* Main Content */}
      {activeTab === "total_colectado" ? (
        <TotalColectadoView taxas={taxas} unidades={unidades} anoFiltro={anoFiltro} />
      ) : vista === "tabela" ? (
        <MoradoresGrid
          taxas={filteredTaxas}
          unidades={filteredUnidades}
          anoFiltro={anoFiltro}
          onRefresh={refresh}
        />
      ) : (
        <ReportsView taxas={filteredTaxas} unidades={filteredUnidades} />
      )}

      {/* Dialogs */}
      <GerarTaxasDialog
        open={gerarOpen}
        onOpenChange={setGerarOpen}
        anosDisponiveis={anosDisponiveis}
        onGerar={handleGerarTaxas}
      />
      <AddRecordSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddUnidade}
        defaultCategoria={activeTab !== "total_colectado" ? activeTab : "quitadas"}
      />
    </div>
  );
};

export default DataGrid;
