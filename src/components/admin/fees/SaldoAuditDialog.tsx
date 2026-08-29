import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Loader2, Check } from "lucide-react";
import { formatCurrency } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

interface DiffRow {
  id: string;
  nome: string;
  atual: number;
  novo: number;
  delta: number;
}

/** Configuração das folhas do Excel: nome da folha, índice da coluna do nome e do "Saldo Actual", linha de dados inicial */
const SHEETS = [
  { match: "quitadas", nome: 4, saldo: 11, dataStart: 2 },
  { match: "cedsif", nome: 4, saldo: 10, dataStart: 2 },
  { match: "1a fase via nedbank", nome: 1, saldo: 6, dataStart: 1 },
  { match: "2a fase via nedbank", nome: 4, saldo: 11, dataStart: 2 },
];

function norm(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(v: unknown): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/\s/g, "").replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

const SaldoAuditDialog = ({ open, onOpenChange, onApplied }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [diffs, setDiffs] = useState<DiffRow[]>([]);
  const [search, setSearch] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const handleFile = async (file: File) => {
    setLoading(true);
    setDiffs([]);
    setFileName(file.name);
    try {
      // 1. Ler Excel
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });

      const saldoMap = new Map<string, number>();
      for (const sheetName of wb.SheetNames) {
        const cfg = SHEETS.find((s) => norm(sheetName).includes(s.match));
        if (!cfg) continue;
        const ws = wb.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        for (let i = cfg.dataStart; i < rows.length; i++) {
          const r = rows[i];
          if (!r) continue;
          const nome = r[cfg.nome];
          if (!nome || typeof nome !== "string" || !nome.trim()) continue;
          const saldo = Math.max(0, toNumber(r[cfg.saldo]));
          const k = norm(nome);
          saldoMap.set(k, Math.max(saldoMap.get(k) ?? 0, saldo));
        }
      }

      // 2. Buscar unidades atuais (paginar por segurança)
      const todas: { id: string; nome: string; divida_anterior: number; divida_inicial: number; pagamentos_historicos: number }[] = [];
      let from = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("unidades")
          .select("id, nome, divida_anterior, divida_inicial, pagamentos_historicos")
          .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        todas.push(...data.map((d: any) => ({
          id: d.id,
          nome: d.nome,
          divida_anterior: Number(d.divida_anterior ?? 0),
          divida_inicial: Number(d.divida_inicial ?? 0),
          pagamentos_historicos: Number(d.pagamentos_historicos ?? 0),
        })));
        if (data.length < PAGE) break;
        from += PAGE;
      }

      // 3. Calcular diferenças (saldo "actual" do Excel == saldo histórico em aberto líquido)
      const result: DiffRow[] = [];
      for (const u of todas) {
        const k = norm(u.nome);
        if (!saldoMap.has(k)) continue;
        const novo = saldoMap.get(k) ?? 0;
        const atual = Math.max(0, u.divida_anterior - u.pagamentos_historicos);
        if (Math.abs(novo - atual) > 0.01) {
          result.push({ id: u.id, nome: u.nome, atual, novo, delta: novo - atual });
        }
      }
      result.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
      setDiffs(result);

      toast({
        title: "Análise concluída",
        description: `${result.length} unidades com diferenças (de ${todas.length} total).`,
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message ?? "Falha a ler o ficheiro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return diffs;
    const s = norm(search);
    return diffs.filter((d) => norm(d.nome).includes(s));
  }, [diffs, search]);

  const totals = useMemo(() => {
    const subiu = diffs.filter((d) => d.delta > 0);
    const desceu = diffs.filter((d) => d.delta < 0);
    return {
      total: diffs.length,
      subiu: subiu.length,
      desceu: desceu.length,
      somaDelta: diffs.reduce((s, d) => s + d.delta, 0),
    };
  }, [diffs]);

  const handleApplyAll = async () => {
    if (diffs.length === 0) return;
    setApplying(true);
    try {
      // Aplicar em lotes via update individuais (Supabase não tem batch update nativo)
      let ok = 0;
      for (const d of diffs) {
        const { error } = await supabase
          .from("unidades")
          .update({ divida_anterior: d.novo, divida_inicial: d.novo, pagamentos_historicos: 0 })
          .eq("id", d.id);
        if (!error) ok++;
      }
      toast({ title: "Aplicado", description: `${ok}/${diffs.length} atualizações concluídas.` });
      setDiffs([]);
      onApplied?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Auditoria de Saldos (FFH)</DialogTitle>
          <DialogDescription>
            Carregue o Excel mais recente. Mostramos as unidades cujo "Saldo Actual" mudou em relação à dívida no sistema.
          </DialogDescription>
        </DialogHeader>

        {/* Upload */}
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <input
            id="audit-file"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <label htmlFor="audit-file">
            <Button variant="outline" asChild disabled={loading}>
              <span>{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />A processar…</> : "Escolher Excel FFH"}</span>
            </Button>
          </label>
          {fileName && <p className="text-xs text-muted-foreground mt-2">{fileName}</p>}
        </div>

        {/* Resumo */}
        {diffs.length > 0 && (
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground">Diferenças</div>
              <div className="text-lg font-bold">{totals.total}</div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <div className="text-xs text-muted-foreground">Subiu</div>
              <div className="text-lg font-bold text-red-700">{totals.subiu}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <div className="text-xs text-muted-foreground">Desceu</div>
              <div className="text-lg font-bold text-emerald-700">{totals.desceu}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground">Δ Total</div>
              <div className={cn("text-lg font-bold tabular-nums", totals.somaDelta >= 0 ? "text-red-700" : "text-emerald-700")}>
                {totals.somaDelta >= 0 ? "+" : ""}{formatCurrency(totals.somaDelta)}
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {diffs.length > 0 && (
          <>
            <Input placeholder="Pesquisar nome…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9" />
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Atual (sistema)</TableHead>
                    <TableHead className="text-right">Novo (Excel)</TableHead>
                    <TableHead className="text-right">Δ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-medium">{d.nome}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(d.atual)}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-semibold">{formatCurrency(d.novo)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums text-sm font-bold", d.delta > 0 ? "text-red-700" : "text-emerald-700")}>
                        {d.delta > 0 ? "+" : ""}{formatCurrency(d.delta)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-muted-foreground">{filtered.length} de {diffs.length} a mostrar</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDiffs([])}>Limpar</Button>
                <Button onClick={handleApplyAll} disabled={applying}>
                  {applying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />A aplicar…</> : <><Check className="w-4 h-4 mr-2" />Aplicar todas ({diffs.length})</>}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaldoAuditDialog;
