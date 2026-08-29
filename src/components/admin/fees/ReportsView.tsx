import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Taxa, Unidade, MESES_SHORT, formatCurrency } from "./types";

interface ReportsViewProps {
  taxas: Taxa[];
  unidades: Unidade[];
}

const ReportsView = ({ taxas, unidades }: ReportsViewProps) => {
  const anosData = useMemo(() => {
    const anos = [...new Set(taxas.map(t => t.ano_referencia))].sort((a, b) => b - a);
    return anos.map(ano => {
      const taxasAno = taxas.filter(t => t.ano_referencia === ano);
      const arrecadado = taxasAno.reduce((s, t) => s + t.valor_pago, 0);
      const divida = taxasAno.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0);
      const emDia = taxasAno.filter(t => t.status === "em_dia").length;
      const emAtraso = taxasAno.filter(t => t.status === "em_atraso").length;
      return { ano, total: taxasAno.length, arrecadado, divida, emDia, emAtraso };
    });
  }, [taxas]);

  const totalArrecadado = taxas.reduce((s, t) => s + t.valor_pago, 0);
  const totalDivida = taxas.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0);

  const chartData = anosData.map(d => ({
    name: String(d.ano),
    Arrecadado: d.arrecadado,
    Dívida: d.divida,
  }));

  const anoMaisRecente = anosData[0]?.ano;
  const monthlyData = useMemo(() => {
    if (!anoMaisRecente) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const taxasMes = taxas.filter(t => t.ano_referencia === anoMaisRecente && t.mes_referencia === mes);
      return {
        name: MESES_SHORT[mes],
        Arrecadado: taxasMes.reduce((s, t) => s + t.valor_pago, 0),
        Dívida: taxasMes.reduce((s, t) => s + Math.max(0, t.valor - t.valor_pago), 0),
      };
    });
  }, [taxas, anoMaisRecente]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Total Arrecadado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalArrecadado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Dívida Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 tabular-nums">{formatCurrency(totalDivida)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Anos Registados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{anosData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">Total Taxas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{taxas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparação por Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="Arrecadado" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dívida" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento Mensal — {anoMaisRecente}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="Arrecadado" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dívida" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Year Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo por Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead>Taxas</TableHead>
                <TableHead className="text-right">Arrecadado</TableHead>
                <TableHead className="text-right">Dívida</TableHead>
                <TableHead className="text-center">Em Dia</TableHead>
                <TableHead className="text-center">Em Atraso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anosData.map(d => (
                <TableRow key={d.ano}>
                  <TableCell className="font-semibold">{d.ano}</TableCell>
                  <TableCell>{d.total}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-medium tabular-nums">{formatCurrency(d.arrecadado)}</TableCell>
                  <TableCell className="text-right text-red-600 font-medium tabular-nums">{formatCurrency(d.divida)}</TableCell>
                  <TableCell className="text-center">{d.emDia}</TableCell>
                  <TableCell className="text-center">{d.emAtraso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
