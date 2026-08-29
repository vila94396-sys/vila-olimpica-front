import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ffhApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Unidade, CategoriaUnidade, CATEGORIAS_LABELS, CATEGORIAS_LIST, getDividaHistorica } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  unidade: Unidade | null;
  onSaved: () => void;
}

const EditUnidadeDialog = ({ open, onOpenChange, unidade, onSaved }: Props) => {
  const [form, setForm] = useState({ nome: "", bloco: "1", edificio: "1", apartamento: "1", contacto: "", divida_acumulada: "0", categoria: "quitadas" as CategoriaUnidade });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (unidade) {
      setForm({
        nome: unidade.nome,
        bloco: String(unidade.bloco),
        edificio: String(unidade.edificio),
        apartamento: String(unidade.apartamento),
        contacto: unidade.contacto || "",
        divida_acumulada: String(getDividaHistorica(unidade)),
        categoria: unidade.categoria,
      });
    }
  }, [unidade]);

  const handleSave = async () => {
    if (!unidade) return;
    setSaving(true);
    const dividaAcum = Math.max(0, parseFloat(form.divida_acumulada) || 0);
    try {
      await ffhApi.unidades.update(Number(unidade.id), {
        nome: form.nome,
        bloco: parseInt(form.bloco) || 1,
        edificio: parseInt(form.edificio) || 1,
        apartamento: parseInt(form.apartamento) || 1,
        contacto: form.contacto,
        categoria: form.categoria,
        divida_acumulada: dividaAcum,
      });
      toast({ title: "Sucesso", description: "Unidade actualizada." });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar a unidade.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
          <DialogDescription>Actualize os dados da unidade.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Morador</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaUnidade })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS_LIST.map(cat => (
                  <SelectItem key={cat} value={cat}>{CATEGORIAS_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Bloco</Label>
              <Input type="number" min="1" value={form.bloco} onChange={(e) => setForm({ ...form, bloco: e.target.value })} />
            </div>
            <div>
              <Label>Edifício</Label>
              <Input type="number" min="1" value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} />
            </div>
            <div>
              <Label>Apartamento</Label>
              <Input type="number" min="1" value={form.apartamento} onChange={(e) => setForm({ ...form, apartamento: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Contacto</Label>
            <Input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="+258..." />
          </div>
          <div>
            <Label>Dívida acumulada da unidade (MT)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.divida_acumulada}
              onChange={(e) => setForm({ ...form, divida_acumulada: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Valor histórico em dívida desta unidade. Pagamentos futuros abaterão este valor.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.nome.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUnidadeDialog;
