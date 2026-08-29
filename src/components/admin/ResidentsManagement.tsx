import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Loader2, UserX, UserCheck, Trash2, Lock, KeyRound, Copy, MessageCircle } from "lucide-react";
import { residentsApi, ResidentDto } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const ResidentsManagement = () => {
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{ resident: ResidentDto; action: "deactivate" | "reactivate" | "remove" | "unlock" } | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [unlockResult, setUnlockResult] = useState<{ email: string; password: string; full_name: string; whatsapp: string } | null>(null);

  const moradorId = (r: ResidentDto) => {
    const b = String(r.block || "").replace(/\D/g, "");
    const e = String(r.building || "").replace(/\D/g, "");
    const a = String(r.apartment || "").replace(/\D/g, "");
    return `${parseInt(b || "0", 10)}${parseInt(e || "0", 10)}${parseInt(a || "0", 10)}`;
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const data = await residentsApi.list();
      setResidents(data);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
    setIsLoading(false);
  };

  const filtered = residents.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.full_name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      (r.phone || "").toLowerCase().includes(term) ||
      r.block.toLowerCase().includes(term) ||
      r.building.toLowerCase().includes(term) ||
      r.apartment.toLowerCase().includes(term) ||
      moradorId(r).includes(term.replace(/\D/g, ""))
    );
  });

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { resident, action } = confirmTarget;
    setProcessingId(resident.id);
    try {
      if (action === "remove") {
        await residentsApi.remove(resident.id);
        toast.success("Morador removido com sucesso");
      } else if (action === "unlock") {
        const res = await residentsApi.unlock(resident.id);
        setUnlockResult({
          email: res.email,
          password: res.password,
          full_name: res.full_name || resident.full_name,
          whatsapp: res.whatsapp || resident.phone,
        });
        toast.success("Nova senha gerada. Envie ao morador pelo WhatsApp.");
      } else if (action === "deactivate") {
        await residentsApi.deactivate(resident.id);
        toast.success("Morador desativado com sucesso");
      } else {
        await residentsApi.reactivate(resident.id);
        toast.success("Morador reativado com sucesso");
      }
      setConfirmTarget(null);
      await fetchResidents();
    } catch (e: any) {
      toast.error(e.message || "Erro ao processar pedido");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = residents.filter((r) => r.status === "approved").length;
  const inactiveCount = residents.filter((r) => r.status === "deactivated").length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Moradores ({residents.length})
              </CardTitle>
              <CardDescription>
                {activeCount} ativos · {inactiveCount} desativados
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar morador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum morador encontrado para esta pesquisa." : "Nenhum morador aprovado ainda."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Morador</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Bloco</TableHead>
                    <TableHead>Edifício</TableHead>
                    <TableHead>Apartamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data de Registo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((resident) => {
                    const isInactive = resident.status === "deactivated";
                    const isLocked = resident.is_locked;
                    return (
                      <TableRow key={resident.id} className={isInactive ? "opacity-60" : ""}>
                        <TableCell className="font-mono font-semibold text-primary">{moradorId(resident)}</TableCell>
                        <TableCell className="font-medium">{resident.full_name}</TableCell>
                        <TableCell>{resident.phone}</TableCell>
                        <TableCell>{resident.email}</TableCell>
                        <TableCell>{resident.block}</TableCell>
                        <TableCell>{resident.building}</TableCell>
                        <TableCell>{resident.apartment}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {resident.resident_type === "owner" ? "Proprietário" :
                             resident.resident_type === "tenant" ? "Inquilino" : resident.resident_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {isInactive ? (
                              <Badge variant="destructive">Desativado</Badge>
                            ) : (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">Ativo</Badge>
                            )}
                            {isLocked && (
                              <Badge variant="destructive" className="gap-1">
                                <Lock className="w-3 h-3" />
                                Bloqueado
                              </Badge>
                            )}
                            {!isLocked && resident.failed_login_count > 0 && (
                              <span className="text-xs text-muted-foreground">{resident.failed_login_count} tentativa(s)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(resident.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {isLocked && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={processingId === resident.id}
                                onClick={() => setConfirmTarget({ resident, action: "unlock" })}
                              >
                                <KeyRound className="w-4 h-4 mr-1" />
                                Desbloquear + Nova Senha
                              </Button>
                            )}
                            {isInactive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === resident.id}
                                onClick={() => setConfirmTarget({ resident, action: "reactivate" })}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Reativar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === resident.id}
                                onClick={() => setConfirmTarget({ resident, action: "deactivate" })}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Desativar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === resident.id}
                              onClick={() => setConfirmTarget({ resident, action: "remove" })}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.action === "deactivate" ? "Desativar morador?" :
               confirmTarget?.action === "reactivate" ? "Reativar morador?" :
               confirmTarget?.action === "unlock" ? "Desbloquear e gerar nova senha?" : "Remover morador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.action === "deactivate" ? (
                <>Tem certeza que deseja desativar <strong>{confirmTarget?.resident.full_name}</strong>? O morador deixará de poder iniciar sessão. Os dados são preservados.</>
              ) : confirmTarget?.action === "reactivate" ? (
                <>Reativar <strong>{confirmTarget?.resident.full_name}</strong>? O morador voltará a poder aceder ao sistema.</>
              ) : confirmTarget?.action === "unlock" ? (
                <>Vai desbloquear <strong>{confirmTarget?.resident.full_name}</strong> e gerar uma <strong>nova senha temporária</strong>. A senha antiga deixará de funcionar. O morador será obrigado a alterá-la no primeiro login (uso único). Deverá enviar as credenciais por WhatsApp.</>
              ) : (
                <>Esta ação <strong>removerá permanentemente</strong> o registo de <strong>{confirmTarget?.resident.full_name}</strong>. Esta operação não pode ser revertida.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={!!processingId}>
              {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!unlockResult} onOpenChange={(o) => !o && setUnlockResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Novas credenciais geradas
            </DialogTitle>
            <DialogDescription>
              Envie estas credenciais ao morador por WhatsApp. A senha só funciona uma vez — o morador será obrigado a definir uma nova ao entrar.
            </DialogDescription>
          </DialogHeader>
          {unlockResult && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{unlockResult.full_name}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-mono text-sm">{unlockResult.email}</p>
              </div>
              <div className="rounded-lg border bg-primary/10 border-primary/30 p-3">
                <p className="text-xs text-muted-foreground">Senha temporária (uso único)</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-lg font-semibold flex-1">{unlockResult.password}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(unlockResult.password);
                      toast.success("Senha copiada");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {unlockResult?.whatsapp && (
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá ${unlockResult.full_name},\n\nA sua conta foi desbloqueada. Novas credenciais de acesso (uso único — será obrigado a alterar a senha no primeiro login):\n\nEmail: ${unlockResult.email}\nSenha: ${unlockResult.password}\n\nAdministração Vila Olímpica`,
                  );
                  const phone = unlockResult.whatsapp.replace(/\D/g, "");
                  const normalized = phone.startsWith("258") ? phone : `258${phone}`;
                  window.open(`https://wa.me/${normalized}?text=${msg}`, "_blank");
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar por WhatsApp
              </Button>
            )}
            <Button variant="outline" onClick={() => setUnlockResult(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResidentsManagement;
