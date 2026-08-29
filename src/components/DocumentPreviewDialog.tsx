import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, X, ExternalLink } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api";

interface Document {
  id: number;
  title: string;
  description: string | null;
  category: string;
  folder: string | null;
  year: number | null;
  file_url: string;
  file_name: string;
  file_size: string | null;
  file_type: string | null;
  created_at: string;
}

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentPreviewDialog = ({ document, open, onOpenChange }: DocumentPreviewDialogProps) => {
  if (!document) return null;

  const isPdf = document.file_type?.includes("pdf") || document.file_name.toLowerCase().endsWith(".pdf");
  const isImage = document.file_type?.startsWith("image/") || 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(document.file_name);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const fileUrl = resolveMediaUrl(document.file_url) || undefined;

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                {document.title}
              </DialogTitle>
              {document.description && (
                <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                  {document.category}
                </span>
                <span>{formatDate(document.created_at)}</span>
                {document.file_size && <span>{document.file_size}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-secondary/30 min-h-[400px]">
          {isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full min-h-[500px]"
              title={document.title}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center p-8">
              <img
                src={fileUrl}
                alt={document.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Pré-visualização não disponível
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Este tipo de arquivo não pode ser visualizado diretamente no navegador. 
                Faça o download para visualizar o conteúdo completo.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Documento
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;
