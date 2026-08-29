import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Smartphone,
  CreditCard,
  CheckCircle,
  Loader2,
  Phone,
  ArrowLeft,
  Shield,
  Receipt,
  Clock,
  Building2,
  Upload,
  FileImage,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Fee {
  id: string;
  reference_month: string;
  reference_year: number;
  amount: number;
  due_date: string;
  status: string;
}

interface PaymentDialogProps {
  fee: Fee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

type PaymentMethod = "mpesa" | "emola" | "card" | "bank_transfer" | null;
type Step = "method" | "form" | "processing" | "success";

const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(value);

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const PaymentMethodCard = ({
  name, description, icon: Icon, color, bgColor, borderColor, selected, onClick,
}: {
  name: string; description: string; icon: React.ElementType;
  color: string; bgColor: string; borderColor: string;
  selected: boolean; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
      "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
      selected ? `${bgColor} ${borderColor} shadow-md` : "border-border hover:border-muted-foreground/30"
    )}
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
      <Icon className={cn("w-6 h-6", color)} />
    </div>
    <div className="text-left flex-1">
      <p className="font-semibold text-foreground">{name}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className={cn(
      "w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
      selected ? "border-primary bg-primary" : "border-muted-foreground/30"
    )}>
      {selected && <div className="w-full h-full flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
      </div>}
    </div>
  </button>
);

const AmountSummary = ({ fee }: { fee: Fee }) => (
  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Condominial</p>
        <p className="text-sm font-medium text-foreground mt-0.5">
          {MONTH_NAMES[fee.reference_month]} / {fee.reference_year}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(fee.amount))}</p>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ step }: { step: Step }) => {
  const steps = [
    { key: "method", label: "Método" },
    { key: "form", label: "Dados" },
    { key: "processing", label: "Confirmação" },
  ];
  const currentIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
            i <= currentIndex
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {i < currentIndex ? "✓" : i + 1}
          </div>
          <span className={cn(
            "text-xs hidden sm:inline",
            i <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground"
          )}>{s.label}</span>
          {i < steps.length - 1 && (
            <div className={cn(
              "w-6 h-0.5 rounded",
              i < currentIndex ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

const MONTH_NAMES_FULL: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case "mpesa": return "M-Pesa";
    case "emola": return "e-Mola";
    case "card": return "Cartão Visa";
    case "bank_transfer": return "Transferência Bancária";
    default: return "—";
  }
};

const BankDetailsCard = () => (
  <div className="p-4 rounded-xl bg-accent/50 border border-border space-y-2">
    <div className="flex items-center gap-2 mb-1">
      <Building2 className="w-4 h-4 text-primary" />
      <p className="text-sm font-semibold text-foreground">Dados Bancários</p>
    </div>
    <div className="grid grid-cols-1 gap-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Banco:</span>
        <span className="font-medium text-foreground">NEDBANK</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Titular:</span>
        <span className="font-medium text-foreground text-right text-xs">COM. DE MORAD. DO COND. VILA OLÍMPICA</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Nº Conta:</span>
        <span className="font-mono font-medium text-foreground">00036768907</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">NIB:</span>
        <span className="font-mono font-medium text-foreground text-xs">004300000003676890746</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">IBAN:</span>
        <span className="font-mono font-medium text-foreground text-xs">004300000003676890746</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">SWIFT:</span>
        <span className="font-mono font-medium text-foreground">UNICMZMX</span>
      </div>
    </div>
  </div>
);

const PaymentDialog = ({ fee, open, onOpenChange, onPaymentSuccess }: PaymentDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [step, setStep] = useState<Step>("method");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const resetState = () => {
    setSelectedMethod(null);
    setStep("method");
    setPhoneNumber("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setIsProcessing(false);
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep("form");
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setStep("method");
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: "Ficheiro muito grande", description: "O tamanho máximo é 10MB.", variant: "destructive" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Envie uma imagem (JPG, PNG, WebP) ou PDF.", variant: "destructive" });
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadReceipt = async (feeId: string): Promise<string | null> => {
    if (!receiptFile || !user) return null;

    const ext = receiptFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${feeId}.${ext}`;

    const { error } = await supabase.storage
      .from("payment-receipts")
      .upload(filePath, receiptFile, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    return filePath;
  };

  const handlePayment = async () => {
    if (!fee || !selectedMethod) return;

    if ((selectedMethod === "mpesa" || selectedMethod === "emola") && phoneNumber.length < 9) {
      toast({ title: "Número inválido", description: "Introduza um número de telefone válido com 9 dígitos.", variant: "destructive" });
      return;
    }
    if (selectedMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast({ title: "Dados incompletos", description: "Preencha todos os dados do cartão.", variant: "destructive" });
      return;
    }
    if (selectedMethod === "bank_transfer" && !receiptFile) {
      toast({ title: "Comprovativo em falta", description: "Anexe o comprovativo de transferência bancária.", variant: "destructive" });
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    if (selectedMethod === "bank_transfer") {
      // Upload receipt + registar como pendente de verificação
      const receiptUrl = await uploadReceipt(fee.id);
      if (!receiptUrl) {
        setIsProcessing(false);
        setStep("form");
        toast({ title: "Erro no upload", description: "Não foi possível enviar o comprovativo. Tente novamente.", variant: "destructive" });
        return;
      }

      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("condominium_fees")
        .update({
          status: "pending_verification",
          payment_method: selectedMethod,
          receipt_url: receiptUrl,
          updated_at: now,
        })
        .eq("id", fee.id);

      if (updateError) {
        console.error("Error updating fee:", updateError);
        setIsProcessing(false);
        setStep("method");
        toast({ title: "Erro no pagamento", description: "Não foi possível registar o comprovativo. Tente novamente.", variant: "destructive" });
        return;
      }
    } else {
      // Pagamento online (M-Pesa / e-Mola / Cartão) via edge function
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          feeId: fee.id,
          method: selectedMethod,
          amount: Number(fee.amount),
          phone: (selectedMethod === "mpesa" || selectedMethod === "emola") ? `258${phoneNumber}` : undefined,
          cardNumber: selectedMethod === "card" ? cardNumber : undefined,
          cardExpiry: selectedMethod === "card" ? cardExpiry : undefined,
          cardCvv: selectedMethod === "card" ? cardCvv : undefined,
          cardName: selectedMethod === "card" ? cardName : undefined,
        },
      });

      if (error || !data?.success) {
        console.error("Payment error:", error, data);
        setIsProcessing(false);
        setStep("form");
        toast({
          title: "Falha no pagamento",
          description: (data?.error || error?.message) ?? "Não foi possível processar o pagamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
    }

    const now = new Date().toISOString();
    setIsProcessing(false);
    setStep("success");

    // Send email notification (fire-and-forget) - only for non-bank-transfer
    if (selectedMethod !== "bank_transfer") {
      const paidDate = format(new Date(now), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
      supabase.functions.invoke("send-payment-notification", {
        body: {
          referenceMonth: MONTH_NAMES_FULL[fee.reference_month] || fee.reference_month,
          referenceYear: fee.reference_year,
          amount: Number(fee.amount),
          paymentMethod: getPaymentMethodLabel(selectedMethod),
          paidAt: paidDate,
          receiptId: fee.id,
        },
      }).catch((err) => console.error("Email notification error:", err));
    }

    const successMessage = selectedMethod === "bank_transfer"
      ? "O comprovativo foi enviado com sucesso. A administração irá verificar e confirmar o seu pagamento."
      : selectedMethod === "card"
        ? "O pagamento foi processado com sucesso. Receberá um email de confirmação."
        : `Pagamento via ${selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"} processado. Receberá um email de confirmação.`;

    toast({ title: selectedMethod === "bank_transfer" ? "Comprovativo enviado!" : "Pagamento processado!", description: successMessage });

    setTimeout(() => {
      onPaymentSuccess();
      handleClose(false);
    }, 2500);
  };

  const paymentMethods = [
    { id: "bank_transfer" as const, name: "Transferência Bancária", description: "Transfira e envie o comprovativo", icon: Building2, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/20", borderColor: "border-emerald-300 dark:border-emerald-800" },
    { id: "mpesa" as const, name: "M-Pesa", description: "Pague com Vodacom M-Pesa", icon: Smartphone, color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/20", borderColor: "border-red-300 dark:border-red-800" },
    { id: "emola" as const, name: "e-Mola", description: "Pague com Movitel e-Mola", icon: Phone, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/20", borderColor: "border-orange-300 dark:border-orange-800" },
    { id: "card" as const, name: "Cartão Visa", description: "Pagamento com cartão Visa", icon: CreditCard, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/20", borderColor: "border-blue-300 dark:border-blue-800" },
  ];

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 text-primary" />
              Pagamento de Taxa Condominial
            </DialogTitle>
            <DialogDescription>
              {MONTH_NAMES[fee.reference_month]} de {fee.reference_year}
            </DialogDescription>
          </DialogHeader>
          {step !== "success" && <div className="mt-4"><StepIndicator step={step} /></div>}
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Success State */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {selectedMethod === "bank_transfer" ? "Comprovativo Enviado!" : "Pagamento Iniciado!"}
              </h3>
              <p className="text-muted-foreground text-center text-sm max-w-xs">
                {selectedMethod === "bank_transfer"
                  ? "O comprovativo foi enviado. A administração irá verificar e confirmar o pagamento em breve."
                  : selectedMethod === "card"
                    ? "O pagamento foi processado com sucesso. O comprovativo será enviado por email."
                    : `Verifique o seu telefone e confirme o pagamento no ${selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"}. Após confirmação, o estado será atualizado automaticamente.`}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3" />
                <span>A fechar automaticamente...</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-foreground font-medium">
                {selectedMethod === "bank_transfer" ? "Enviando comprovativo..." : "Processando pagamento..."}
              </p>
              <p className="text-muted-foreground text-sm text-center">
                {selectedMethod === "bank_transfer"
                  ? "Aguarde enquanto enviamos o seu comprovativo."
                  : selectedMethod === "card"
                    ? "Aguarde enquanto processamos o seu cartão."
                    : `Enviando pedido de pagamento via ${selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"}...`}
              </p>
            </div>
          )}

          {/* Method Selection */}
          {step === "method" && (
            <div className="space-y-4">
              <AmountSummary fee={fee} />

              <div className="space-y-2.5">
                <p className="text-sm font-medium text-foreground">Escolha o método de pagamento:</p>
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    {...method}
                    selected={selectedMethod === method.id}
                    onClick={() => handleSelectMethod(method.id)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Pagamento seguro e encriptado</span>
              </div>
            </div>
          )}

          {/* Bank Transfer Form */}
          {step === "form" && selectedMethod === "bank_transfer" && (
            <div className="space-y-4">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Alterar método
              </button>

              <AmountSummary fee={fee} />

              <BankDetailsCard />

              <div className="space-y-2">
                <Label>Comprovativo de Transferência</Label>
                <p className="text-xs text-muted-foreground">
                  Após efectuar a transferência, anexe aqui o comprovativo (imagem ou PDF, máx. 10MB).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!receiptFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Clique para anexar</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP ou PDF</p>
                    </div>
                  </button>
                ) : (
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileImage className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{receiptFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(receiptFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {receiptPreview && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img src={receiptPreview} alt="Comprovativo" className="w-full max-h-48 object-contain bg-muted/30" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full h-12 text-base"
                onClick={handlePayment}
                disabled={isProcessing || !receiptFile}
              >
                Enviar Comprovativo
              </Button>
            </div>
          )}

          {/* Mobile Money Form */}
          {step === "form" && (selectedMethod === "mpesa" || selectedMethod === "emola") && (
            <div className="space-y-4">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Alterar método
              </button>

              <AmountSummary fee={fee} />

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  {selectedMethod === "mpesa"
                    ? <Smartphone className="w-5 h-5 text-red-600 shrink-0" />
                    : <Phone className="w-5 h-5 text-orange-600 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium">{selectedMethod === "mpesa" ? "M-Pesa" : "e-Mola"}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMethod === "mpesa" ? "Vodacom Moçambique" : "Movitel Moçambique"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground font-mono">
                    +258
                  </span>
                  <Input
                    id="phone"
                    placeholder={selectedMethod === "mpesa" ? "84 xxx xxxx" : "86 xxx xxxx"}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    className="flex-1 font-mono tracking-wider"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receberá um pedido de pagamento no seu telefone. Confirme com o seu PIN.
                </p>
              </div>

              <Button className="w-full h-12 text-base" onClick={handlePayment} disabled={isProcessing || phoneNumber.length < 9}>
                Confirmar Pagamento — {formatCurrency(Number(fee.amount))}
              </Button>
            </div>
          )}

          {/* Card Form */}
          {step === "form" && selectedMethod === "card" && (
            <div className="space-y-4">
              <button onClick={handleBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Alterar método
              </button>

              <AmountSummary fee={fee} />

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input id="cardName" placeholder="Nome completo como no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      className="font-mono tracking-wider pr-12"
                      inputMode="numeric"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                        setCardExpiry(val);
                      }}
                      className="font-mono"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      placeholder="•••"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="font-mono"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-base" onClick={handlePayment} disabled={isProcessing || !cardNumber || !cardExpiry || !cardCvv || !cardName}>
                Confirmar Pagamento — {formatCurrency(Number(fee.amount))}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>Os dados do cartão são encriptados e seguros</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
