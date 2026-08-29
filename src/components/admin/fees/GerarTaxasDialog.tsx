import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MESES_LABELS, VALOR_TAXA_MENSAL } from "./types";
import { Loader2 } from "lucide-react";

interface GerarTaxasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anosDisponiveis: number[];
  onGerar: (mes: number | null, ano: number, valor: number) => Promise<void>;
}

const GerarTaxasDialog = ({ open, onOpenChange, anosDisponiveis, onGerar }: GerarTaxasDialogProps) => {
  const [modo, setModo] = useState<"mes" | "ano">("mes");
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<string>(String(new Date().getFullYear()));
  const [anoCustom, setAnoCustom] = useState<string>("");
  const [valor, setValor] = useState<string>(String(VALOR_TAXA_MENSAL));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNovoAno = anoSelecionado === "novo";
  const anoFinal = isNovoAno ? parseInt(anoCustom) : parseInt(anoSelecionado);
  const isValid = !isNaN(anoFinal) && anoFinal >= 2000 && parseFloat(valor) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    await onGerar(modo === "mes" ? mesSelecionado : null, anoFinal, parseFloat(valor));
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const label = modo === "mes"
    ? `Gerar Taxa — ${MESES_LABELS[mesSelecionado]} ${anoFinal || ""}`
    : `Gerar Taxas para ${anoFinal || ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Taxas</DialogTitle>
          <DialogDescription>Crie taxas para todas as unidades registadas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <span className="text-sm font-medium">
              {modo === "mes" ? "Mês Específico" : "Ano Completo"}
            </span>
            <Switch
              checked={modo === "ano"}
              onCheckedChange={(v) => setModo(v ? "ano" : "mes")}
            />
          </div>

          {modo === "mes" && (
            <div>
              <Label>Mês</Label>
              <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MESES_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Ano</Label>
            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((a) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
                <SelectItem value="novo">+ Novo Ano...</SelectItem>
              </SelectContent>
            </Select>
            {isNovoAno && (
              <Input
                type="number"
                className="mt-2"
                placeholder="Ex: 2027"
                value={anoCustom}
                onChange={(e) => setAnoCustom(e.target.value)}
                min={2000}
              />
            )}
          </div>

          <div>
            <Label>Valor por Unidade (MT)</Label>
            <Input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerarTaxasDialog;
