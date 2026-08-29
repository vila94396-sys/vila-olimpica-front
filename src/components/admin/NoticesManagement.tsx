import { useState, useEffect } from "react";
import { noticesApi, NoticeDto } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Megaphone, Loader2, AlertTriangle, Bell, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const NoticesManagement = () => {
  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    is_active: true,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const data = await noticesApi.list();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (notice?: NoticeDto) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        priority: notice.priority,
        is_active: notice.is_active,
      });
    } else {
      setEditingNotice(null);
      setFormData({
        title: "",
        content: "",
        priority: "normal",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingNotice(null);
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingNotice) {
        await noticesApi.update(editingNotice.id, {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          is_active: formData.is_active,
        });
        toast({
          title: "Sucesso",
          description: "Aviso atualizado com sucesso.",
        });
      } else {
        await noticesApi.create({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          is_active: formData.is_active,
        });
        toast({
          title: "Sucesso",
          description: "Aviso criado com sucesso.",
        });
      }
      handleCloseDialog();
      fetchNotices();
    } catch (error) {
      toast({
        title: "Erro",
        description: editingNotice ? "Não foi possível atualizar o aviso." : "Não foi possível criar o aviso.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    try {
      await noticesApi.remove(id);
      toast({
        title: "Sucesso",
        description: "Aviso excluído com sucesso.",
      });
      fetchNotices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aviso.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await noticesApi.update(id, { is_active: !currentStatus });
      fetchNotices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "important":
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "important":
        return "Importante";
      default:
        return "Normal";
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "important":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Avisos
              </CardTitle>
              <CardDescription>
                Gerencie os avisos do condomínio
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Aviso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingNotice ? "Editar Aviso" : "Novo Aviso"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNotice
                      ? "Atualize as informações do aviso"
                      : "Preencha os dados do novo aviso"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Digite o título do aviso"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Digite o conteúdo do aviso"
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            Normal
                          </div>
                        </SelectItem>
                        <SelectItem value="important">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-yellow-500" />
                            Importante
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Urgente
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Ativo</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingNotice ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum aviso cadastrado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro aviso
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{notice.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {notice.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit",
                        getPriorityStyles(notice.priority)
                      )}>
                        {getPriorityIcon(notice.priority)}
                        {getPriorityLabel(notice.priority)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={notice.is_active}
                        onCheckedChange={() => handleToggleActive(notice.id, notice.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(notice.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenDialog(notice)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(notice.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticesManagement;
