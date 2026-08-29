import { useState, useEffect, useRef } from "react";
import { newsApi, NewsDto, resolveMediaUrl } from "@/lib/api";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Newspaper, Upload, X, Loader2, Images } from "lucide-react";
import { format } from "date-fns";

const categories = ["Infraestrutura", "Comunicado", "Segurança", "Eventos", "Manutenção"];

const NewsManagement = () => {
  const [news, setNews] = useState<NewsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsDto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Comunicado",
    image_url: "",
  });
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const data = await newsApi.list();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (newsItem?: NewsDto) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        summary: newsItem.summary,
        content: newsItem.content,
        category: newsItem.category,
        image_url: newsItem.image_url || "",
      });
      setImagePreview(resolveMediaUrl(newsItem.image_url));
      setGalleryImages(newsItem.gallery_urls || []);
    } else {
      setEditingNews(null);
      setFormData({
        title: "",
        summary: "",
        content: "",
        category: "Comunicado",
        image_url: "",
      });
      setImagePreview(null);
      setGalleryImages([]);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione um arquivo de imagem válido.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "A imagem deve ter no máximo 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await newsApi.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      setImagePreview(resolveMediaUrl(url));
      toast({ title: "Sucesso", description: "Imagem de capa carregada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível fazer upload da imagem.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - galleryImages.length;
    if (remaining <= 0) {
      toast({ title: "Limite atingido", description: "Máximo de 10 fotos na galeria.", variant: "destructive" });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
      try {
        const { url } = await newsApi.uploadImage(file);
        newUrls.push(url);
      } catch {
        // skip failed uploads
      }
    }

    if (newUrls.length > 0) {
      setGalleryImages(prev => [...prev, ...newUrls]);
      toast({ title: "Sucesso", description: `${newUrls.length} foto(s) adicionada(s) à galeria.` });
    }
    setIsUploading(false);

    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.summary || !formData.content) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const newsData = {
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      category: formData.category,
      image_url: formData.image_url || (galleryImages.length > 0 ? galleryImages[0] : null),
      gallery_urls: galleryImages.length > 0 ? galleryImages : null,
    };

    try {
      if (editingNews) {
        await newsApi.update(editingNews.id, newsData);
        toast({ title: "Sucesso", description: "Notícia atualizada com sucesso." });
      } else {
        await newsApi.create(newsData);
        toast({ title: "Sucesso", description: "Notícia criada com sucesso." });
      }
      setDialogOpen(false);
      fetchNews();
    } catch (error) {
      toast({ title: "Erro", description: editingNews ? "Não foi possível atualizar a notícia." : "Não foi possível criar a notícia.", variant: "destructive" });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;
    try {
      await newsApi.remove(id);
      toast({ title: "Sucesso", description: "Notícia excluída com sucesso." });
      fetchNews();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir a notícia.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestão de Notícias</CardTitle>
            <CardDescription>Crie, edite e exclua notícias do condomínio</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Notícia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNews ? "Editar Notícia" : "Nova Notícia"}</DialogTitle>
                <DialogDescription>
                  {editingNews ? "Atualize as informações da notícia" : "Preencha os dados para criar uma nova notícia"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Título da notícia" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Resumo *</Label>
                  <Textarea id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Breve descrição da notícia" rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo Completo *</Label>
                  <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Conteúdo detalhado da notícia" rows={6} />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-border" />
                      <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Carregando...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Clique para selecionar a imagem de capa</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (máx. 5MB)</p>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Images className="w-4 h-4" />
                      Galeria de Fotos ({galleryImages.length}/10)
                    </Label>
                    {galleryImages.length < 10 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()} disabled={isUploading}>
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {galleryImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={resolveMediaUrl(url)} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={() => handleRemoveGalleryImage(index)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {galleryImages.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => galleryInputRef.current?.click()}>
                      <div className="flex flex-col items-center gap-2">
                        <Images className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Clique para adicionar fotos à galeria</p>
                        <p className="text-xs text-muted-foreground">Selecione até 10 imagens (máx. 5MB cada)</p>
                      </div>
                    </div>
                  )}

                  <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isUploading} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>) : editingNews ? "Salvar Alterações" : "Criar Notícia"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma notícia cadastrada.</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Notícia
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fotos</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={resolveMediaUrl(item.image_url)} alt={item.title} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          <Newspaper className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary rounded text-xs">{item.category}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{item.gallery_urls?.length || 0}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleOpenDialog(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
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
  );
};

export default NewsManagement;
