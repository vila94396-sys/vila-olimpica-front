import { useEffect, useState, useCallback } from "react";
import { institutionApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Wallet, AlertCircle } from "lucide-react";

const fmtMZN = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", minimumFractionDigits: 2 }).format(v || 0);

interface RecentPayment {
  id: number;
  institution: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  created_at: string;
}

const InstitutionsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ valor: 0, pago: 0, saldo: 0 });
  const [byInstitution, setByInstitution] = useState<Record<string, { valor: number; pago: number }>>({});
  const [recent, setRecent] = useState<RecentPayment[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionApi.dashboard();
      setTotals(data.totals);
      setByInstitution(data.byInstitution);
      setRecent(data.recent as RecentPayment[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Total a Cobrar
          </div>
          <p className="text-2xl font-bold mt-1">{fmtMZN(totals.valor)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-600">
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <Wallet className="w-4 h-4" /> Total Pago
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{fmtMZN(totals.pago)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-600">
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <AlertCircle className="w-4 h-4" /> Saldo Devedor
          </div>
          <p className="text-2xl font-bold text-red-700 mt-1">{fmtMZN(totals.saldo)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Resumo por Instituição</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instituição</TableHead>
              <TableHead className="text-right">A Cobrar</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(byInstitution).length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Sem dados</TableCell></TableRow>
            ) : Object.entries(byInstitution).map(([k, v]) => {
              const saldo = Math.max(0, v.valor - v.pago);
              return (
                <TableRow key={k}>
                  <TableCell className="font-medium">{k}</TableCell>
                  <TableCell className="text-right">{fmtMZN(v.valor)}</TableCell>
                  <TableCell className="text-right text-green-700">{fmtMZN(v.pago)}</TableCell>
                  <TableCell className={`text-right font-bold ${saldo > 0 ? "text-red-700" : "text-green-700"}`}>{fmtMZN(saldo)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Últimos Pagamentos</h3>
        {recent.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">Nenhum pagamento registado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Montante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.payment_date).toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell><Badge variant="outline">{p.institution}</Badge></TableCell>
                  <TableCell className="text-xs">{p.payment_method}</TableCell>
                  <TableCell className="text-right font-semibold">{fmtMZN(Number(p.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default InstitutionsDashboard;
