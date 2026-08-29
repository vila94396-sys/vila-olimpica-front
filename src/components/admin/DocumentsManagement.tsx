import { useState, useEffect, useRef } from "react";
import { documentsApi, resolveMediaUrl } from "@/lib/api";
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
import { Plus, Pencil, Trash2, FileText, Upload, X, Loader2, Eye, Folder, FolderPlus } from "lucide-react";
import { format } from "date-fns";

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
  updated_at: string;
}

const categories = ["Financeiro", "Ata", "Regulamento", "Relatório", "Contrato"];
const defaultFolders = ["Geral", "Assembleias", "Financeiro", "Contratos", "Regulamentos", "Manutenção"];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [folders, setFolders] = useState<string[]>(defaultFolders);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("Todos");
  const [selectedYear, setSelectedYear] = useState<string>("Todos");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Financeiro",
    folder: "Geral",
    year: currentYear,
    file_url: "",
    file_name: "",
    file_size: "",
    file_type: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Extract unique folders from documents
    const uniqueFolders = [...new Set(documents.map(d => d.folder).filter(Boolean))] as string[];
    const allFolders = [...new Set([...defaultFolders, ...uniqueFolders])];
    setFolders(allFolders);
  }, [documents]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentsApi.list();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (doc?: Document) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        title: doc.title,
        description: doc.description || "",
        category: doc.category,
        folder: doc.folder || "Geral",
        year: doc.year || currentYear,
        file_url: doc.file_url,
        file_name: doc.file_name,
        file_size: doc.file_size || "",
        file_type: doc.file_type || "",
      });
    } else {
      setEditingDocument(null);
      setFormData({
        title: "",
        description: "",
        category: "Financeiro",
        folder: "Geral",
        year: currentYear,
        file_url: "",
        file_name: "",
        file_size: "",
        file_type: "",
      });
    }
    setDialogOpen(true);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    if (folders.includes(newFolderName.trim())) {
      toast({
        title: "Erro",
        description: "Esta pasta já existe.",
        variant: "destructive",
      });
      return;
    }
    setFolders([...folders, newFolderName.trim()]);
    setFormData({ ...formData, folder: newFolderName.trim() });
    setNewFolderName("");
    setFolderDialogOpen(false);
    toast({
      title: "Sucesso",
      description: "Pasta criada com sucesso.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 20MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { url } = await documentsApi.uploadFile(file);

      setFormData({
        ...formData,
        file_url: url,
        file_name: file.name,
        file_size: formatFileSize(file.size),
        file_type: file.type,
      });

      toast({
        title: "Sucesso",
        description: "Arquivo carregado com sucesso.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      file_url: "",
      file_name: "",
      file_size: "",
      file_type: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.file_url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e faça upload de um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const docData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      folder: formData.folder,
      year: formData.year,
      file_url: formData.file_url,
      file_name: formData.file_name,
      file_size: formData.file_size || null,
      file_type: formData.file_type || null,
    };

    try {
      if (editingDocument) {
        await documentsApi.update(editingDocument.id, docData);
        toast({
          title: "Sucesso",
          description: "Documento atualizado com sucesso.",
        });
      } else {
        await documentsApi.create(docData);
        toast({
          title: "Sucesso",
          description: "Documento criado com sucesso.",
        });
      }
      setDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: editingDocument ? "Não foi possível atualizar o documento." : "Não foi possível criar o documento.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;

    try {
      await documentsApi.remove(id);
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso.",
      });
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (doc: Document) => {
    window.open(resolveMediaUrl(doc.file_url) || undefined, "_blank");
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesFolder = selectedFolder === "Todos" || doc.folder === selectedFolder;
    const matchesYear = selectedYear === "Todos" || doc.year?.toString() === selectedYear;
    return matchesFolder && matchesYear;
  });

  const documentsByFolder = filteredDocuments.reduce((acc, doc) => {
    const folder = doc.folder || "Geral";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Gestão de Documentos</CardTitle>
            <CardDescription>Organize documentos em pastas e por ano</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Pasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas Pastas</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos Anos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDocument ? "Editar Documento" : "Novo Documento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDocument
                      ? "Atualize as informações do documento"
                      : "Faça upload de um novo documento para o arquivo"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Título do documento"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Ano *</Label>
                      <Select
                        value={formData.year.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, year: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="folder">Pasta</Label>
                      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="ghost" size="sm">
                            <FolderPlus className="w-4 h-4 mr-1" />
                            Nova Pasta
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Criar Nova Pasta</DialogTitle>
                            <DialogDescription>
                              Digite o nome da nova pasta
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              placeholder="Nome da pasta"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFolderDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button type="button" onClick={handleAddFolder}>
                                Criar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.folder}
                      onValueChange={(value) =>
                        setFormData({ ...formData, folder: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder} value={folder}>
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4" />
                              {folder}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descrição do documento"
                      rows={3}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label>Arquivo *</Label>
                    {formData.file_url ? (
                      <div className="border border-border rounded-lg p-4 bg-secondary/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formData.file_name}</p>
                              {formData.file_size && (
                                <p className="text-xs text-muted-foreground">{formData.file_size}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Carregando...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para selecionar um arquivo
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC, XLS, etc. (máx. 20MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isUploading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : editingDocument ? (
                        "Salvar Alterações"
                      ) : (
                        "Criar Documento"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum documento cadastrado.</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Documento
            </Button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum documento encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByFolder).map(([folder, docs]) => (
              <div key={folder} className="border border-border rounded-lg overflow-hidden">
                <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-accent" />
                  <span className="font-semibold">{folder}</span>
                  <span className="text-sm text-muted-foreground">({docs.length})</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{doc.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {doc.file_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-secondary rounded text-xs">
                            {doc.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.year || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.file_size || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(doc.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handlePreview(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenDialog(doc)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsManagement;
