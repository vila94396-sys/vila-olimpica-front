import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentDialog from "./PaymentDialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2, CheckCircle, Clock, AlertCircle, Receipt, History, TrendingDown, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Fee {
  id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  valor_pago?: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
}

interface UnidadeInfo {
  id: string;
  divida_anterior: number;
  pagamentos_historicos: number;
}

const MONTHS: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v);

const methodLabel = (m: string | null) => {
  switch (m) {
    case "mpesa": return "M-Pesa";
    case "emola": return "e-Mola";
    case "card": return "Cartão Visa";
    case "bank_transfer": return "Transferência Bancária";
    default: return m || "—";
  }
};

const FeesSection = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [unidade, setUnidade] = useState<UnidadeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentFee, setPaymentFee] = useState<Fee | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    const [{ data: unidadeData }, { data: feesData }] = await Promise.all([
      supabase.from("unidades").select("id, divida_anterior, pagamentos_historicos").eq("user_id", user.id).maybeSingle(),
      supabase.from("condominium_fees").select("*").eq("user_id", user.id)
        .order("reference_year", { ascending: false })
        .order("reference_month", { ascending: false }),
    ]);

    setUnidade(unidadeData ? {
      id: unidadeData.id,
      divida_anterior: Number(unidadeData.divida_anterior || 0),
      pagamentos_historicos: Number(unidadeData.pagamentos_historicos || 0),
    } : null);
    setFees(feesData || []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (isLoading) {
    return (
      <Card><CardContent className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </CardContent></Card>
    );
  }

  // ===== Cálculos =====
  const dividaAcumulada = unidade ? Math.max(0, unidade.divida_anterior - unidade.pagamentos_historicos) : 0;

  const dividaSistema = fees.reduce((sum, f) => {
    const valor = Number(f.amount || 0);
    const pago = Number(f.valor_pago || 0);
    if (f.status === "paid") return sum;
    return sum + Math.max(0, valor - pago);
  }, 0);

  const dividaTotal = dividaAcumulada + dividaSistema;

  const pagas = fees.filter(f => f.status === "paid");
  const totalPago = pagas.reduce((s, f) => s + Number(f.amount || 0), 0);

  const metodosUsados = Array.from(new Set(pagas.map(f => f.payment_method).filter(Boolean))) as string[];

  const dividas = fees
    .filter(f => f.status !== "paid" && Number(f.amount || 0) - Number(f.valor_pago || 0) > 0)
    .map(f => ({ ...f, divida: Number(f.amount || 0) - Number(f.valor_pago || 0) }));

  const statusBadge = (s: string) => {
    const map: Record<string, { lbl: string; cls: string; icon: JSX.Element }> = {
      paid: { lbl: "Pago", cls: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
      pending_verification: { lbl: "Em Verificação", cls: "bg-blue-100 text-blue-700", icon: <Clock className="w-3.5 h-3.5" /> },
      overdue: { lbl: "Vencido", cls: "bg-red-100 text-red-700", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    };
    const v = map[s] || { lbl: "Pendente", cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> };
    return <span className={cn("px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", v.cls)}>{v.icon}{v.lbl}</span>;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Cards de resumo de dívida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-amber-700">
                <History className="w-4 h-4" /> Dívida Acumulada
              </CardDescription>
              <CardTitle className="text-2xl text-amber-700">{formatCurrency(dividaAcumulada)}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-amber-600">Saldo herdado anterior ao sistema</p></CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-yellow-700">
                <TrendingDown className="w-4 h-4" /> Dívida do Sistema
              </CardDescription>
              <CardTitle className="text-2xl text-yellow-700">{formatCurrency(dividaSistema)}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-yellow-600">Mensalidades em aberto no sistema</p></CardContent>
          </Card>

          <Card className="border-red-300 bg-red-50 border-2">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-red-700">
                <Wallet className="w-4 h-4" /> Dívida Atual (Total)
              </CardDescription>
              <CardTitle className="text-3xl text-red-700">{formatCurrency(dividaTotal)}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xs text-red-600">Acumulada + Sistema</p></CardContent>
          </Card>
        </div>

        {!unidade && (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              A sua unidade ainda não está associada a um registo de Taxas.
              Aguarde a confirmação da administração ou contacte o condomínio.
            </CardContent>
          </Card>
        )}

        {/* Tabs com históricos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Detalhes das Taxas
            </CardTitle>
            <CardDescription>Consulte as suas dívidas, pagamentos e métodos utilizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dividas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="dividas">Dívidas</TabsTrigger>
                <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
                <TabsTrigger value="metodos">Métodos</TabsTrigger>
                <TabsTrigger value="todas">Histórico Completo</TabsTrigger>
              </TabsList>

              {/* Dívidas em aberto */}
              <TabsContent value="dividas">
                {dividas.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Sem dívidas no sistema. 🎉</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Referência</TableHead><TableHead>Valor</TableHead>
                      <TableHead>Pago</TableHead><TableHead>Em Dívida</TableHead>
                      <TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {dividas.map(f => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{MONTHS[f.reference_month]}/{f.reference_year}</TableCell>
                          <TableCell>{formatCurrency(Number(f.amount))}</TableCell>
                          <TableCell className="text-green-700">{formatCurrency(Number(f.valor_pago || 0))}</TableCell>
                          <TableCell className="text-red-700 font-semibold">{formatCurrency(f.divida)}</TableCell>
                          <TableCell>{format(new Date(f.due_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{statusBadge(f.status)}</TableCell>
                          <TableCell>
                            {f.status !== "pending_verification" && (
                              <Button size="sm" onClick={() => { setPaymentFee(f); setPaymentDialogOpen(true); }}>Pagar</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* Pagamentos realizados — com saldo devedor evolutivo */}
              <TabsContent value="pagamentos">
                {pagas.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Sem pagamentos registados.</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Total pago: <span className="font-bold text-foreground">{formatCurrency(totalPago)}</span>
                    </p>
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Saldo Inicial</TableHead>
                        <TableHead>Valor Pago</TableHead>
                        <TableHead>Saldo Após</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Método</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {(() => {
                          // Ordenar por data de pagamento (asc) para calcular o saldo devedor mês a mês
                          const ordered = [...pagas].sort((a, b) => {
                            const da = a.paid_at ? new Date(a.paid_at).getTime() : 0;
                            const db = b.paid_at ? new Date(b.paid_at).getTime() : 0;
                            return da - db;
                          });
                          // Saldo devedor inicial = dívida acumulada + soma de todos os valores pagos no sistema
                          let saldo = dividaAcumulada + pagas.reduce((s, f) => s + Number(f.amount || 0), 0);
                          return ordered.map(f => {
                            const valor = Number(f.amount || 0);
                            const saldoInicial = saldo;
                            saldo = Math.max(0, saldo - valor);
                            return (
                              <TableRow key={f.id}>
                                <TableCell className="font-medium">{MONTHS[f.reference_month]}/{f.reference_year}</TableCell>
                                <TableCell className="text-muted-foreground">{formatCurrency(saldoInicial)}</TableCell>
                                <TableCell className="text-green-700 font-semibold">{formatCurrency(valor)}</TableCell>
                                <TableCell className="text-foreground font-semibold">{formatCurrency(saldo)}</TableCell>
                                <TableCell>{f.paid_at ? format(new Date(f.paid_at), "dd/MM/yyyy") : "—"}</TableCell>
                                <TableCell>{methodLabel(f.payment_method)}</TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </>
                )}
              </TabsContent>

              {/* Métodos de pagamento disponíveis */}
              <TabsContent value="metodos">
                <div className="space-y-4">
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Wallet className="w-5 h-5" /> NEDBANK — Transferência Bancária
                      </CardTitle>
                      <CardDescription>
                        Realize a transferência para a conta oficial do condomínio e envie o comprovativo via janela de mensagens.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground uppercase tracking-wide">Denominação</dt>
                          <dd className="font-semibold text-foreground">COM DE MORAD DO COND VILA OLIMPICA</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground uppercase tracking-wide">Banco</dt>
                          <dd className="font-semibold text-foreground">NEDBANK</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground uppercase tracking-wide">Número da Conta</dt>
                          <dd className="font-mono font-semibold text-foreground">0003676890746</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground uppercase tracking-wide">IBAN</dt>
                          <dd className="font-mono font-semibold text-foreground">004300000003676890746</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground uppercase tracking-wide">SWIFT</dt>
                          <dd className="font-mono font-semibold text-foreground">UNICMZMX</dd>
                        </div>
                      </dl>
                      <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        ⚠️ Após efectuar a transferência, envie o comprovativo (PDF ou imagem) através da aba <strong>Mensagens</strong> para validação pela administração.
                      </div>
                    </CardContent>
                  </Card>

                  {metodosUsados.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">Métodos já utilizados</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {metodosUsados.map(m => {
                          const count = pagas.filter(p => p.payment_method === m).length;
                          const total = pagas.filter(p => p.payment_method === m).reduce((s, p) => s + Number(p.amount || 0), 0);
                          return (
                            <Card key={m}>
                              <CardContent className="p-4">
                                <p className="font-semibold">{methodLabel(m)}</p>
                                <p className="text-xs text-muted-foreground mt-1">{count} pagamento(s)</p>
                                <p className="text-sm font-bold text-primary mt-2">{formatCurrency(total)}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Histórico completo */}
              <TabsContent value="todas">
                {fees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma taxa registrada.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Referência</TableHead><TableHead>Valor</TableHead>
                      <TableHead>Pago</TableHead><TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead><TableHead>Método</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {fees.map(f => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{MONTHS[f.reference_month]}/{f.reference_year}</TableCell>
                          <TableCell>{formatCurrency(Number(f.amount))}</TableCell>
                          <TableCell>{formatCurrency(Number(f.valor_pago || 0))}</TableCell>
                          <TableCell>{format(new Date(f.due_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{statusBadge(f.status)}</TableCell>
                          <TableCell>{methodLabel(f.payment_method)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <PaymentDialog
        fee={paymentFee}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onPaymentSuccess={fetchAll}
      />
    </>
  );
};

export default FeesSection;
