import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Pencil, Trash2, Loader2 } from "lucide-react";
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

interface ServiceRow {
  id: string;
  owner_name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string | null;
  location: string | null;
  description: string;
  full_description: string | null;
  hours: string | null;
  image_url: string | null;
  status: string;
}

const CATEGORIES = [
  "Alimentação", "Comércio", "Serviços", "Moda", "Transporte",
  "Agricultura", "Tecnologia", "Saúde", "Educação", "Outro",
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const MyServicesPage = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
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
      .from("marketplace_services")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setRows((data as ServiceRow[]) || []);
    }
    setLoading(false);
  };

  const remove = async (row: ServiceRow) => {
    const { error } = await supabase.from("marketplace_services").delete().eq("id", row.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Serviço apagado" });
      load();
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, status, ...updates } = editing;
    const { error } = await supabase.from("marketplace_services").update(updates).eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Alterações salvas" });
      setEditing(null);
      load();
    }
  };

  const setField = <K extends keyof ServiceRow>(k: K, v: ServiceRow[K]) =>
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
                <Store className="w-7 h-7 text-primary" /> Meus Serviços
              </h1>
              <p className="text-muted-foreground">Gerencie as suas publicações no marketplace.</p>
            </div>
            <Link to="/marketplace/cadastrar">
              <Button>Publicar novo serviço</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não publicou nenhum serviço.
                </p>
                <Link to="/marketplace/cadastrar">
                  <Button>Cadastrar Serviço</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{row.business_name}</CardTitle>
                      <Badge variant={row.status === "approved" ? "default" : row.status === "pending" ? "secondary" : "destructive"}>
                        {STATUS_LABEL[row.status] || row.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {row.image_url && (
                      <img src={row.image_url} alt={row.business_name} className="w-full h-40 object-cover rounded-md" />
                    )}
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {row.description || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div><strong>Categoria:</strong> {row.category}</div>
                      <div><strong>Telefone:</strong> {row.phone}</div>
                      {row.location && <div><strong>Local:</strong> {row.location}</div>}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button size="sm" onClick={() => setEditing(row)}>
                        <Pencil className="w-4 h-4 mr-1" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" /> Apagar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apagar serviço?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. "{row.business_name}" será removido permanentemente.
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
            <DialogTitle>Editar serviço</DialogTitle>
            <DialogDescription>Atualize as informações do seu negócio.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nome do proprietário *</Label>
                <Input value={editing.owner_name} onChange={(e) => setField("owner_name", e.target.value)} />
              </div>
              <div>
                <Label>Nome do negócio *</Label>
                <Input value={editing.business_name} onChange={(e) => setField("business_name", e.target.value)} />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={editing.category} onValueChange={(v) => setField("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input value={editing.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={editing.email ?? ""} onChange={(e) => setField("email", e.target.value)} />
              </div>
              <div>
                <Label>Localização</Label>
                <Input value={editing.location ?? ""} onChange={(e) => setField("location", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Horário</Label>
                <Input value={editing.hours ?? ""} onChange={(e) => setField("hours", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição curta *</Label>
                <Textarea rows={2} value={editing.description} onChange={(e) => setField("description", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição completa</Label>
                <Textarea rows={5} value={editing.full_description ?? ""} onChange={(e) => setField("full_description", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>URL da imagem</Label>
                <Input value={editing.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value)} />
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

export default MyServicesPage;
