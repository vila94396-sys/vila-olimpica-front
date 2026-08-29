import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, Loader2, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generatePaymentReceipt } from "@/lib/receiptGenerator";

interface Transaction {
  id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(value);

const getPaymentMethodLabel = (method: string | null) => {
  switch (method) {
    case "mpesa": return "M-Pesa";
    case "emola": return "e-Mola";
    case "card": return "Cartão Visa";
    default: return method || "—";
  }
};

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchTransactions();
  }, [user?.id]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("condominium_fees")
      .select("*")
      .eq("user_id", user?.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setIsLoading(false);
  };

  const handleDownloadReceipt = (tx: Transaction) => {
    generatePaymentReceipt({
      id: tx.id,
      referenceMonth: MONTH_NAMES[tx.reference_month] || tx.reference_month,
      referenceYear: tx.reference_year,
      amount: Number(tx.amount),
      paidAt: tx.paid_at,
      paymentMethod: getPaymentMethodLabel(tx.payment_method),
      residentEmail: user?.email || "",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Histórico de Transações
        </CardTitle>
        <CardDescription>
          Consulte os seus pagamentos concluídos e descarregue os comprovativos em PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação concluída.</p>
            <p className="text-sm mt-2">Os pagamentos concluídos aparecerão aqui.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Comprovativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {MONTH_NAMES[tx.reference_month]} / {tx.reference_year}
                  </TableCell>
                  <TableCell>{formatCurrency(Number(tx.amount))}</TableCell>
                  <TableCell>
                    {tx.paid_at
                      ? format(new Date(tx.paid_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "—"}
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(tx.payment_method)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(tx)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
