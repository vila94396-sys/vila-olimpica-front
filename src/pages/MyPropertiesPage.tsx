import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Pencil, Trash2, Loader2, Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PropertyRow {
  id: string;
  title: string;
  description: string | null;
  full_description: string | null;
  property_type: string;
  transaction_type: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  owner_name: string | null;
  owner_whatsapp: string | null;
  image_url: string | null;
  is_active: boolean;
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "commercial", label: "Comercial" },
  { value: "land", label: "Terreno" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Cobertura" },
];

const TRANSACTION_TYPES = [
  { value: "sale", label: "Venda" },
  { value: "rent", label: "Aluguel" },
  { value: "seasonal", label: "Temporada" },
];

const MyPropertiesPage = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth");
      return;
    }
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setRows((data as PropertyRow[]) || []);
    }
    setLoading(false);
  };

  const toggleActive = async (row: PropertyRow) => {
    const { error } = await supabase
      .from("properties")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: row.is_active ? "Ocultado" : "Publicado" });
      load();
    }
  };

  const remove = async (row: PropertyRow) => {
    const { error } = await supabase.from("properties").delete().eq("id", row.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Imóvel apagado" });
      load();
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...updates } = editing;
    const { error } = await supabase.from("properties").update(updates).eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Alterações salvas" });
      setEditing(null);
      load();
    }
  };

  const setField = <K extends keyof PropertyRow>(k: K, v: PropertyRow[K]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <Link to="/area-morador" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Home className="w-7 h-7 text-primary" /> Meus Imóveis
              </h1>
              <p className="text-muted-foreground">Gerencie as suas publicações de imóveis.</p>
            </div>
            <Link to="/imoveis">
              <Button variant="outline">Ver Marketplace de Imóveis</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não publicou nenhum imóvel.
                </p>
                <p className="text-sm text-muted-foreground">
                  Para publicar, entre em contacto com a administração.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{row.title}</CardTitle>
                      <Badge variant={row.is_active ? "default" : "secondary"}>
                        {row.is_active ? "Publicado" : "Oculto"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {row.image_url && (
                      <img src={row.image_url} alt={row.title} className="w-full h-40 object-cover rounded-md" />
                    )}
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {row.description || row.full_description || "—"}
                    </div>
                    <div className="text-sm">
                      <strong>Preço:</strong>{" "}
                      {row.price
                        ? new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", maximumFractionDigits: 0 }).format(row.price)
                        : "Consulte"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      WhatsApp: {row.owner_whatsapp || <span className="italic">não definido</span>}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button size="sm" onClick={() => setEditing(row)}>
                        <Pencil className="w-4 h-4 mr-1" /> Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(row)}>
                        {row.is_active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        {row.is_active ? "Ocultar" : "Publicar"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" /> Apagar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apagar imóvel?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. "{row.title}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(row)}>Apagar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar imóvel</DialogTitle>
            <DialogDescription>Atualize as informações do seu imóvel.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Título *</Label>
                  <Input value={editing.title} onChange={(e) => setField("title", e.target.value)} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={editing.property_type} onValueChange={(v) => setField("property_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transação</Label>
                  <Select value={editing.transaction_type} onValueChange={(v) => setField("transaction_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preço (MZN)</Label>
                  <Input type="number" value={editing.price ?? ""} onChange={(e) => setField("price", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <Label>Área (m²)</Label>
                  <Input type="number" value={editing.area ?? ""} onChange={(e) => setField("area", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <Label>Quartos</Label>
                  <Input type="number" value={editing.bedrooms ?? ""} onChange={(e) => setField("bedrooms", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <Label>Casas de banho</Label>
                  <Input type="number" value={editing.bathrooms ?? ""} onChange={(e) => setField("bathrooms", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <Label>Estacionamento</Label>
                  <Input type="number" value={editing.parking_spots ?? ""} onChange={(e) => setField("parking_spots", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={editing.address ?? ""} onChange={(e) => setField("address", e.target.value)} />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input value={editing.neighborhood ?? ""} onChange={(e) => setField("neighborhood", e.target.value)} />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={editing.city ?? ""} onChange={(e) => setField("city", e.target.value)} />
                </div>
                <div>
                  <Label>Nome do proprietário</Label>
                  <Input value={editing.owner_name ?? ""} onChange={(e) => setField("owner_name", e.target.value)} />
                </div>
                <div>
                  <Label>WhatsApp do proprietário</Label>
                  <Input placeholder="+258 84 000 0000" value={editing.owner_whatsapp ?? ""} onChange={(e) => setField("owner_whatsapp", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição curta</Label>
                  <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setField("description", e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição completa</Label>
                  <Textarea rows={5} value={editing.full_description ?? ""} onChange={(e) => setField("full_description", e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyPropertiesPage;
