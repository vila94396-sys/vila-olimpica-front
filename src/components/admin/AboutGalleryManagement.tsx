import { useState, useEffect } from "react";
import { aboutGalleryApi, resolveMediaUrl, GalleryImageDto } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, GripVertical, Upload, Image } from "lucide-react";

const AboutGalleryManagement = () => {
  const [images, setImages] = useState<GalleryImageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await aboutGalleryApi.list();
      setImages(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar imagens", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast({ title: `${f.name} excede 10MB`, variant: "destructive" });
        return false;
      }
      return f.type.startsWith("image/");
    });

    setSelectedFiles(validFiles);
    setPreviews(validFiles.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    try {
      const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.display_order)) : -1;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const uploadRes = await aboutGalleryApi.uploadImage(file);
        
        await aboutGalleryApi.create({
          image_url: uploadRes.url,
          title: title || null,
          display_order: maxOrder + 1 + i,
        });
      }

      toast({ title: "Imagens adicionadas com sucesso!" });
      setSelectedFiles([]);
      setPreviews([]);
      setTitle("");
      fetchImages();
    } catch (error: any) {
      toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await aboutGalleryApi.remove(id);
      toast({ title: "Imagem removida!" });
      fetchImages();
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    try {
      await aboutGalleryApi.update(id, { title: newTitle || null });
      fetchImages();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Galeria da Página Sobre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Adicionar Imagens
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Legenda (opcional)</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Legenda da imagem"
                />
              </div>
              <div>
                <Label>Imagens</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {previews.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                ))}
              </div>
            )}

            <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Adicionar {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
            </Button>
          </div>

          {/* Gallery List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Imagens Actuais ({images.length})</h3>
            {images.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma imagem adicionada ainda.</p>
            ) : (
              <div className="grid gap-3">
                {images.map((image) => (
                  <div key={image.id} className="flex items-center gap-4 bg-secondary/50 p-3 rounded-lg border">
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <img
                      src={resolveMediaUrl(image.image_url) || ""}
                      alt={image.title || ""}
                      className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    <Input
                      defaultValue={image.title || ""}
                      placeholder="Legenda"
                      className="flex-1"
                      onBlur={e => handleUpdateTitle(image.id, e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutGalleryManagement;
