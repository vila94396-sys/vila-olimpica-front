import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { getLocalAuthSession, setLocalAuthSession } from "@/lib/localAuth";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(12, "A senha deve ter pelo menos 12 caracteres").max(72, "A senha não pode exceder 72 caracteres");

type AuthView = "login" | "forgot-password" | "password-reset-sent";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = () => {
      if (getLocalAuthSession()) {
        navigate("/area-morador");
      }
    };
    checkSession();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (view === "login") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (view === "login") {
        try {
          const { user, token } = await authApi.login(email.trim(), password);
          setLocalAuthSession({ token, user });
          
          if (user.status === 'LOCKED') {
            toast({
              title: "Conta bloqueada",
              description: "Sua conta foi bloqueada. Contacte a administração.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
          navigate("/area-morador");
        } catch (backendError: unknown) {
          toast({
            title: "Erro de Login",
            description: backendError instanceof Error ? backendError.message : "Email ou senha incorretos. Verifique suas credenciais.",
            variant: "destructive",
          });
        }
      } else if (view === "forgot-password") {
        toast({
          title: "Funcionalidade indisponível",
          description: "Por favor, contacte a administração para redefinir sua senha.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setErrors({});
  };

  const renderPasswordResetSentView = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Email Enviado</h2>
      <p className="text-muted-foreground mb-6">
        Enviamos instruções para redefinir sua senha para <strong className="text-foreground">{email}</strong>.
      </p>
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground text-left">
            Se não encontrar o email, verifique sua pasta de spam ou lixo eletrônico.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          resetForm();
          setView("login");
        }}
        className="w-full"
      >
        Voltar ao Login
      </Button>
    </div>
  );

  const renderForgotPasswordView = () => (
    <>
      <div className="text-center mb-8">
        <img 
          src={logoVilaOlimpica} 
          alt="Logo Vila Olímpica" 
          className="w-20 h-20 object-contain mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-foreground">Recuperar Senha</h1>
        <p className="text-muted-foreground mt-2">
          Digite seu email para receber as instruções
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              disabled={isLoading}
              required
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Email de Recuperação"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            resetForm();
            setView("login");
          }}
          className="text-primary font-semibold hover:underline"
        >
          Voltar ao Login
        </button>
      </div>
    </>
  );

  const renderLoginView = () => (
    <>
      <div className="text-center mb-8">
        <img 
          src={logoVilaOlimpica} 
          alt="Logo Vila Olímpica" 
          className="w-20 h-20 object-contain mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-foreground">Área do Morador</h1>
        <p className="text-muted-foreground mt-2">
          Faça login para acessar sua área
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              disabled={isLoading}
              required
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password}</p>
          )}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setView("forgot-password");
            }}
            className="text-sm text-primary hover:underline"
          >
            Esqueceu sua senha?
          </button>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Ainda não tem acesso?{" "}
          <Link to="/pedido-acesso" className="text-primary font-semibold hover:underline">
            Solicitar acesso
          </Link>
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoVilaOlimpica} 
                alt="Logo Vila Olímpica" 
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Condomínio</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-elegant">
            {view === "password-reset-sent" && renderPasswordResetSentView()}
            {view === "forgot-password" && renderForgotPasswordView()}
            {view === "login" && renderLoginView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
