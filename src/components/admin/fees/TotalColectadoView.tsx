import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Taxa, Unidade, CATEGORIAS_LABELS, CATEGORIAS_LIST, CategoriaUnidade, formatCurrency } from "./types";

interface TotalColectadoViewProps {
  taxas: Taxa[];
  unidades: Unidade[];
  anoFiltro: number;
}

const TotalColectadoView = ({ taxas, unidades, anoFiltro }: TotalColectadoViewProps) => {
  const stats = useMemo(() => {
    const byCategoria: Record<string, { arrecadado: number; divida: number; unidades: number; emDia: number; emAtraso: number }> = {};
    
    for (const cat of CATEGORIAS_LIST) {
      const catUnidades = unidades.filter(u => u.categoria === cat);
      const catUnidadeIds = new Set(catUnidades.map(u => u.id));
      const catTaxas = taxas.filter(t => t.ano_referencia === anoFiltro && catUnidadeIds.has(t.unidade_id));
      
      byCategoria[cat] = {
        arrecadado: catTaxas.reduce((s, t) => s + t.valor_pago, 0),
        divida: catTaxas.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
        unidades: catUnidades.length,
        emDia: catTaxas.filter(t => t.status === "em_dia").length,
        emAtraso: catTaxas.filter(t => t.status === "em_atraso").length,
      };
    }

    const taxasAno = taxas.filter(t => t.ano_referencia === anoFiltro);
    const totalArrecadado = taxasAno.reduce((s, t) => s + t.valor_pago, 0);
    const totalDivida = taxasAno.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0);

    return { byCategoria, totalArrecadado, totalDivida };
  }, [taxas, unidades, anoFiltro]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Total Arrecadado</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-emerald-700">{formatCurrency(stats.totalArrecadado)}</p>
          </CardContent>
        </Card>
        <Card className="border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-red-600 font-medium">Total Dívida</p>
            <p className="text-xl font-bold tabular-nums mt-1 text-red-700">{formatCurrency(stats.totalDivida)}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Unidades</p>
            <p className="text-xl font-bold tabular-nums mt-1">{unidades.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Unidades</TableHead>
              <TableHead className="text-right">Arrecadado</TableHead>
              <TableHead className="text-right">Dívida</TableHead>
              <TableHead className="text-center">Em Dia</TableHead>
              <TableHead className="text-center">Em Atraso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CATEGORIAS_LIST.map(cat => {
              const s = stats.byCategoria[cat];
              return (
                <TableRow key={cat}>
                  <TableCell className="font-medium">{CATEGORIAS_LABELS[cat]}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.unidades}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-600 font-medium">{formatCurrency(s.arrecadado)}</TableCell>
                  <TableCell className="text-right tabular-nums text-red-600 font-medium">{formatCurrency(s.divida)}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.emDia}</TableCell>
                  <TableCell className="text-center tabular-nums">{s.emAtraso}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-center tabular-nums">{unidades.length}</TableCell>
              <TableCell className="text-right tabular-nums text-emerald-700">{formatCurrency(stats.totalArrecadado)}</TableCell>
              <TableCell className="text-right tabular-nums text-red-700">{formatCurrency(stats.totalDivida)}</TableCell>
              <TableCell className="text-center tabular-nums">
                {Object.values(stats.byCategoria).reduce((s, c) => s + c.emDia, 0)}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {Object.values(stats.byCategoria).reduce((s, c) => s + c.emAtraso, 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TotalColectadoView;
