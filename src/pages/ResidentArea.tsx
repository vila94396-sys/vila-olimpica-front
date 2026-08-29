import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Bell, 
  Home,
  ArrowLeft,
  
  MessageCircle,
  LogOut,
  Loader2,
  Shield,
  MessageSquare,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NoticesSection from "@/components/resident/NoticesSection";
import FeesSection from "@/components/resident/FeesSection";
import TransactionHistory from "@/components/resident/TransactionHistory";
import MessagesSection from "@/components/resident/MessagesSection";


const ResidentArea = () => {
  const { user, session, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to auth if not logged in, or to change password if needed
  if (!isLoading && !session) {
    navigate("/auth");
    return null;
  }

  if (!isLoading && session?.user?.user_metadata?.must_change_password) {
    navigate("/alterar-senha");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Portal
            </Link>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Área do Morador</h1>
              <p className="text-primary-foreground/80">
                {user?.email ? `Bem-vindo, ${user.email}` : "Bem-vindo ao seu portal personalizado"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setActiveTab("notices")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">Avisos</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setActiveTab("fees")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">Taxas</p>
            </CardContent>
          </Card>
          
          <Link to="/reservas" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">Reservas</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/arquivo" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">Documentos</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/meus-imoveis" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                  <Home className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">Meus Imóveis</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/meus-servicos" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                  <Store className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">Meus Serviços</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="notices">Avisos</TabsTrigger>
            <TabsTrigger value="fees">Taxas</TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-1 inline md:hidden" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="history">Transações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Notices Preview */}
              <div className="lg:col-span-2">
                <NoticesSection />
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Acesse os documentos do condomínio no arquivo.
                    </p>
                    <Link to="/arquivo">
                      <Button variant="outline" className="w-full">
                        Ver Documentos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Precisa falar com a administração?
                    </p>
                    <Link to="/contato">
                      <Button variant="default" className="w-full">
                        Enviar Mensagem
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('https://wa.me/258843001234', '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notices">
            <NoticesSection />
          </TabsContent>

          <TabsContent value="fees">
            <FeesSection />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesSection />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default ResidentArea;
