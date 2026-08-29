import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Loader2, FolderArchive } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicDocumentsApi, resolveMediaUrl } from "@/lib/api";
import DocumentPreviewDialog from "./DocumentPreviewDialog";

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

const Archive = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await publicDocumentsApi.list();
      setDocuments(data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleDownload = async (doc: Document) => {
    // Track download
    await publicDocumentsApi.trackDownload(doc.id);
    window.open(resolveMediaUrl(doc.file_url) || undefined, "_blank");
  };

  return (
    <section id="arquivo" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Arquivo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Documentos e Relatórios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acesso completo a toda documentação oficial do condomínio. 
            Visualize antes de baixar.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md">
            <div className="bg-primary p-6">
              <div className="flex items-center gap-3">
                <FolderArchive className="w-8 h-8 text-primary-foreground" />
                <div>
                  <h3 className="text-2xl font-bold text-primary-foreground">
                    Documentação Oficial
                  </h3>
                  <p className="text-primary-foreground/90 mt-1">
                    Todos os documentos estão disponíveis para consulta e download
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento disponível no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-foreground mb-1">
                          {doc.title}
                        </h4>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                            {doc.category}
                          </span>
                          {doc.year && (
                            <span className="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary">
                              {doc.year}
                            </span>
                          )}
                          <span>{formatDate(doc.created_at)}</span>
                          {doc.file_size && <span>{doc.file_size}</span>}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/arquivo">
              <Button variant="hero" size="lg">
                <FolderArchive className="mr-2" />
                Ver Arquivo Completo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <DocumentPreviewDialog
        document={selectedDocument}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </section>
  );
};

export default Archive;
