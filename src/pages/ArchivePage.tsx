import { FileText, Download, Eye, Calendar, Search, FolderArchive, BarChart3, Users, Shield, Loader2, Folder, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicDocumentsApi, resolveMediaUrl } from "@/lib/api";
import WhatsAppButton from "@/components/WhatsAppButton";
import DocumentPreviewDialog from "@/components/DocumentPreviewDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const ArchivePage = () => {
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [selectedYear, setSelectedYear] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const documentTypes = ["Todos", "Financeiro", "Ata", "Regulamento", "Relatório", "Contrato"];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await publicDocumentsApi.list();
      setDocuments(data);
      // Expand all folders by default
      const folders = [...new Set(data.map(d => d.folder || "Geral"))];
      setExpandedFolders(new Set(folders));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const stats = [
    { icon: FileText, label: "Documentos Disponíveis", value: documents.length.toString() },
    { icon: BarChart3, label: "Relatórios Financeiros", value: documents.filter(d => d.category === "Financeiro").length.toString() },
    { icon: Users, label: "Atas de Assembleia", value: documents.filter(d => d.category === "Ata").length.toString() },
    { icon: Shield, label: "Contratos", value: documents.filter(d => d.category === "Contrato").length.toString() },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = selectedType === "Todos" || doc.category === selectedType;
    const matchesYear = selectedYear === "Todos" || doc.year?.toString() === selectedYear;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesType && matchesYear && matchesSearch;
  });

  // Group documents by folder
  const documentsByFolder = filteredDocuments.reduce((acc, doc) => {
    const folder = doc.folder || "Geral";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Get unique years from documents
  const availableYears = [...new Set(documents.map(d => d.year).filter(Boolean))] as number[];
  availableYears.sort((a, b) => b - a);

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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Arquivo</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Documentos e Relatórios</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Acesso completo a toda documentação oficial do condomínio, organizada por pastas e anos.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border text-center">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-wrap gap-2">
                {documentTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                    size="sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos Anos</SelectItem>
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    years.slice(0, 5).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredDocuments.length}</span> documentos
              {selectedType !== "Todos" && ` do tipo ${selectedType}`}
              {selectedYear !== "Todos" && ` de ${selectedYear}`}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-24">
                <FolderArchive className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Nenhum documento disponível no momento.</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-24">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Nenhum documento encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(documentsByFolder).map(([folder, docs]) => (
                  <Collapsible
                    key={folder}
                    open={expandedFolders.has(folder)}
                    onOpenChange={() => toggleFolder(folder)}
                  >
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                      <CollapsibleTrigger asChild>
                        <button className="w-full px-6 py-4 flex items-center justify-between bg-primary/10 hover:bg-primary/15 transition-colors">
                          <div className="flex items-center gap-3">
                            <Folder className="w-6 h-6 text-accent" />
                            <span className="font-semibold text-foreground text-lg">{folder}</span>
                            <span className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
                              {docs.length} documento{docs.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ChevronRight className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform",
                            expandedFolders.has(folder) && "rotate-90"
                          )} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="divide-y divide-border">
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-6 hover:bg-secondary/50 transition-colors group"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                  <FileText className="w-6 h-6 text-accent" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-bold text-foreground mb-1">{doc.title}</h4>
                                  {doc.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
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
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(doc.created_at)}
                                    </span>
                                    {doc.file_size && <span>{doc.file_size}</span>}
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    title="Visualizar"
                                    onClick={() => handlePreview(doc)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Download"
                                    onClick={() => handleDownload(doc)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Request Document CTA */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Não Encontrou o Documento?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Solicite qualquer documento ou informação adicional através do nosso canal de atendimento.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => window.open('https://wa.me/258843001234?text=Olá! Gostaria de solicitar um documento do condomínio.', '_blank')}
          >
            Solicitar Documento
          </Button>
        </div>
      </section>

      <DocumentPreviewDialog
        document={selectedDocument}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ArchivePage;
