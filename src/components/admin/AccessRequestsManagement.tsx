import { useState, useEffect } from "react";
import { accessRequestsApi, AccessRequestDto } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, X, UserPlus, Loader2, MessageCircle, Copy, Smartphone, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
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

const sanitizePhone = (phone: string) => phone.replace(/\D/g, "");

const normalizePhone = (phone: string) => {
  let n = sanitizePhone(phone);
  if (!n.startsWith("258") && n.length <= 9) n = "258" + n;
  return n;
};

// wa.me funciona tanto no WhatsApp Web como no app desktop/mobile (deep-link)
const buildWaMeLink = (phone: string, message: string) =>
  `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;

// whatsapp:// abre directamente o WhatsApp Desktop ou App nativa, sem passar pelo browser
const buildWaDesktopLink = (phone: string, message: string) =>
  `whatsapp://send?phone=${normalizePhone(phone)}&text=${encodeURIComponent(message)}`;

const AccessRequestsManagement = () => {
  const [requests, setRequests] = useState<AccessRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await accessRequestsApi.list();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching access requests:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos de acesso.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [sendDialog, setSendDialog] = useState<{
    open: boolean;
    phone: string;
    message: string;
    fullName: string;
  }>({ open: false, phone: "", message: "", fullName: "" });

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (newStatus === "approved") {
      const request = requests.find((r) => r.id === id);
      setProcessingId(id);
      try {
        const data = await accessRequestsApi.approve(id);

        // Abrir diálogo para envio das credenciais via WhatsApp ao morador
        if (data?.password && request) {
          const loginUrl = `${window.location.origin}/auth`;
          // Envolvemos email e password em ``` (monoespaçado WhatsApp) para evitar auto-formatação
          // e garantir que o morador copia exactamente os caracteres gerados.
          const msg =
            `🏠 *Vila Olímpica - Acesso Aprovado*\n\n` +
            `Olá *${data.full_name || request.full_name}*,\n\n` +
            `O seu pedido de acesso à Área do Morador foi *aprovado*.\n\n` +
            `🔐 *Credenciais de acesso* (toque para copiar):\n\n` +
            `Email:\n\`\`\`${data.email}\`\`\`\n\n` +
            `Palavra-passe:\n\`\`\`${data.password}\`\`\`\n\n` +
            `🔗 Aceda em: ${loginUrl}\n\n` +
            `⚠️ Por segurança, será obrigado a alterar a palavra-passe no primeiro acesso.\n\n` +
            `Administração Vila Olímpica`;

          const phoneToUse = data.whatsapp || request.whatsapp || request.phone;
          setSendDialog({
            open: true,
            phone: phoneToUse,
            message: msg,
            fullName: data.full_name || request.full_name,
          });
        }

        toast({
          title: "Pedido aprovado",
          description: "Conta criada. Escolha como enviar as credenciais via WhatsApp ao morador.",
        });
        fetchRequests();
      } catch (err: any) {
        toast({
          title: "Erro ao aprovar",
          description: err.message || "Não foi possível criar a conta do morador.",
          variant: "destructive",
        });
      } finally {
        setProcessingId(null);
      }
    } else {
      try {
        await accessRequestsApi.reject(id);
        toast({
          title: "Sucesso",
          description: "Pedido rejeitado.",
        });
        fetchRequests();
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atualizar o status.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await accessRequestsApi.remove(id);
      toast({ title: "Sucesso", description: "Pedido excluído." });
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o pedido.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pedidos de Acesso</CardTitle>
            <CardDescription>Aprove ou rejeite pedidos de novos moradores</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pedido de acesso encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.full_name}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>Bloco {request.block} · Ed. {request.building}</p>
                      <p className="text-muted-foreground">Apt. {request.apartment}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary rounded text-xs capitalize">
                      {request.resident_type === "proprietario" ? "Proprietário" : "Inquilino"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>{request.phone}</p>
                      <p className="text-muted-foreground">{request.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      request.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    )}>
                      {request.status === "approved" ? "Aprovado" :
                       request.status === "rejected" ? "Rejeitado" : "Pendente"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(request.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {request.status === "pending" && (
                         <>
                           <Button
                             size="sm"
                             className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1"
                             onClick={() => handleUpdateStatus(request.id, "approved")}
                             disabled={processingId === request.id}
                             title="Aprovar e enviar credenciais via WhatsApp"
                           >
                             {processingId === request.id ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                             ) : (
                               <>
                                 <MessageCircle className="w-4 h-4" />
                                 <span className="hidden md:inline text-xs">Aprovar e Enviar</span>
                               </>
                             )}
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                             onClick={() => handleUpdateStatus(request.id, "rejected")}
                             disabled={processingId === request.id}
                             title="Rejeitar pedido"
                           >
                             <X className="w-4 h-4" />
                           </Button>
                         </>
                       )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(request.id)}
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
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

    <Dialog open={sendDialog.open} onOpenChange={(o) => setSendDialog((s) => ({ ...s, open: o }))}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Enviar credenciais via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Para <strong>{sendDialog.fullName}</strong> · {sendDialog.phone}
            <br />
            <span className="text-xs">As credenciais serão entregues exclusivamente ao morador. Nenhuma cópia é guardada após este envio.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="rounded-md border bg-muted/40 p-3 text-xs whitespace-pre-wrap font-mono max-h-48 overflow-auto">
            {sendDialog.message}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
          <Button
            className="w-full justify-start gap-2"
            onClick={() => {
              window.open(buildWaMeLink(sendDialog.phone, sendDialog.message), "_blank", "noopener,noreferrer");
            }}
          >
            <Globe className="w-4 h-4" /> Abrir no WhatsApp Web
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={() => {
              window.location.href = buildWaDesktopLink(sendDialog.phone, sendDialog.message);
            }}
          >
            <Smartphone className="w-4 h-4" /> Abrir no WhatsApp Desktop / App
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await navigator.clipboard.writeText(sendDialog.message);
              toast({ title: "Mensagem copiada", description: "Cole no WhatsApp do morador." });
            }}
          >
            <Copy className="w-4 h-4" /> Copiar mensagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AccessRequestsManagement;
