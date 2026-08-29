import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, KeyRound, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Senha muito curta", description: "Mínimo de 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não coincidem", description: "Verifique a confirmação.", variant: "destructive" });
      return;
    }
    if (!user?.email) return;

    setIsChangingPwd(true);
    try {
      // Re-validar a senha atual
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email, password: currentPassword,
      });
      if (signInErr) {
        toast({ title: "Senha atual incorreta", description: signInErr.message, variant: "destructive" });
        setIsChangingPwd(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Senha alterada", description: "A sua nova senha está ativa." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao alterar senha", variant: "destructive" });
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setIsChangingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-admin-email", {
        body: { email: newEmail.trim() },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast({ title: "Email atualizado", description: `Novo email: ${newEmail}. Faça login novamente.` });
      setNewEmail("");
      setTimeout(() => supabase.auth.signOut(), 1500);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao atualizar email", variant: "destructive" });
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Minha Conta de Administrador
          </CardTitle>
          <CardDescription>
            Email atual: <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Introduza a senha atual e defina uma nova.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pwd">Senha atual</Label>
            <div className="relative">
              <Input id="current-pwd" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar/ocultar senha">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pwd">Nova senha</Label>
            <div className="relative">
              <Input id="new-pwd" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar/ocultar senha">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pwd">Confirmar nova senha</Label>
            <div className="relative">
              <Input id="confirm-pwd" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar/ocultar senha">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={isChangingPwd || !currentPassword || !newPassword || !confirmPassword}>
            {isChangingPwd ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Alterar Email do Administrador
          </CardTitle>
          <CardDescription>O email é alterado imediatamente. Será necessário fazer login novamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">Novo email</Label>
            <Input
              id="new-email" type="email" placeholder="exemplo@dominio.com"
              value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleChangeEmail} disabled={isChangingEmail || !newEmail.trim()} variant="outline">
            {isChangingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Atualizar Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsManagement;
