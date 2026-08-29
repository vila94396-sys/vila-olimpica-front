import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut,
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Store,
  Check,
  X,
  Newspaper,
  Download,
  Building,
  Megaphone,
  Receipt,
  UserPlus,
  Shield,
  MessageSquare
} from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";
import NewsManagement from "@/components/admin/NewsManagement";
import DocumentsManagement from "@/components/admin/DocumentsManagement";
import DocumentDownloadsStats from "@/components/admin/DocumentDownloadsStats";
import PropertiesManagement from "@/components/admin/PropertiesManagement";
import NoticesManagement from "@/components/admin/NoticesManagement";
import FeesManagement from "@/components/admin/FeesManagement";
import AccessRequestsManagement from "@/components/admin/AccessRequestsManagement";
import AdminsManagement from "@/components/admin/AdminsManagement";
import AboutGalleryManagement from "@/components/admin/AboutGalleryManagement";
import ReservationsManagement from "@/components/admin/ReservationsManagement";
import ResidentsManagement from "@/components/admin/ResidentsManagement";
import MessagesManagement from "@/components/admin/MessagesManagement";
import NotificationBell from "@/components/admin/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { accessRequestsApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

interface Reservation {
  id: string;
  user_id: string;
  area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
  common_areas?: {
    name: string;
  };
}

interface MarketplaceService {
  id: string;
  owner_name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string;
  location: string | null;
  description: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

interface Stats {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  totalAreas: number;
  reservationsThisMonth: number;
  pendingServices: number;
  approvedServices: number;
  pendingAccessRequests: number;
  totalDebt: number;
}

const AdminDashboard = () => {
  const { user, session, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    pendingReservations: 0,
    totalAreas: 0,
    reservationsThisMonth: 0,
    pendingServices: 0,
    approvedServices: 0,
    pendingAccessRequests: 0,
    totalDebt: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive",
        });
        navigate("/area-morador");
      } else {
        fetchData();
      }
    }
  }, [authLoading, session, isAdmin, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchReservations(), fetchServices(), fetchStats()]);
    setIsLoading(false);
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, common_areas(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reservations:", error);
    } else {
      setReservations(data || []);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("marketplace_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching services:", error);
    } else {
      setServices(data || []);
    }
  };

  const fetchAllPaged = async <T,>(
    table: "condominium_fees" | "fpd_fees" | "unidades" | "fpd_unidades",
    columns: string
  ): Promise<T[]> => {
    const PAGE = 1000;
    let from = 0;
    const out: T[] = [];
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .range(from, from + PAGE - 1);
      if (error || !data || data.length === 0) break;
      out.push(...(data as unknown as T[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
    return out;
  };

  const fetchStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const anoHoje = now.getFullYear();
    const mesHoje = now.getMonth() + 1;

    const [
      allReservations,
      areasCountRes,
      allServices,
      accessRequests,
      ffhFees,
      fpdFees,
      unidades,
      fpdUnidades,
    ] = await Promise.all([
      supabase.from("reservations").select("status, created_at"),
      supabase.from("common_areas").select("*", { count: "exact", head: true }),
      supabase.from("marketplace_services").select("status"),
      accessRequestsApi.list().catch(() => []),
      fetchAllPaged<{ amount: number; valor_pago: number; reference_year: number; reference_month: string }>("condominium_fees", "amount, valor_pago, reference_year, reference_month"),
      fetchAllPaged<{ amount: number; valor_pago: number; reference_year: number; reference_month: string }>("fpd_fees", "amount, valor_pago, reference_year, reference_month"),
      fetchAllPaged<{ divida_anterior: number; divida_inicial: number; pagamentos_historicos: number }>("unidades", "divida_anterior, divida_inicial, pagamentos_historicos"),
      fetchAllPaged<{ divida_anterior: number; divida_inicial: number; pagamentos_historicos: number }>("fpd_unidades", "divida_anterior, divida_inicial, pagamentos_historicos"),
    ]);

    const pendingServices = allServices.data?.filter((s: any) => s.status === "pending").length || 0;
    const approvedServices = allServices.data?.filter((s: any) => s.status === "approved").length || 0;

    const sumFeesDebt = (rows: { amount: number; valor_pago: number; reference_year: number; reference_month: string }[]) =>
      rows.reduce((acc, r) => {
        const ano = Number(r.reference_year);
        const mes = Number(r.reference_month);
        if (ano > anoHoje) return acc;
        if (ano === anoHoje && mes > mesHoje) return acc;
        return acc + Math.max(0, Number(r.amount || 0) - Number(r.valor_pago || 0));
      }, 0);

    const sumHistoric = (rows: { divida_anterior: number; divida_inicial: number; pagamentos_historicos: number }[]) =>
      rows.reduce((acc, r) => {
        const da = Number(r.divida_anterior ?? r.divida_inicial ?? 0);
        const ph = Number(r.pagamentos_historicos ?? 0);
        return acc + Math.max(0, da - ph);
      }, 0);

    const totalDebt =
      sumFeesDebt(ffhFees) + sumFeesDebt(fpdFees) + sumHistoric(unidades) + sumHistoric(fpdUnidades);

    const reservList = allReservations.data || [];
    const thisMonth = reservList.filter((r: any) => new Date(r.created_at) >= startOfMonth);

    setStats({
      totalReservations: reservList.length,
      confirmedReservations: reservList.filter((r: any) => r.status === "confirmed").length,
      cancelledReservations: reservList.filter((r: any) => r.status === "cancelled").length,
      pendingReservations: reservList.filter((r: any) => r.status === "pending").length,
      totalAreas: areasCountRes.count || 0,
      reservationsThisMonth: thisMonth.length,
      pendingServices,
      approvedServices,
      pendingAccessRequests: accessRequests.filter((r) => r.status === "pending").length,
      totalDebt,
    });
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", reservationId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
      fetchData();
    }
  };

  const handleUpdateServiceStatus = async (serviceId: string, newStatus: string) => {
    const { error } = await supabase
      .from("marketplace_services")
      .update({ status: newStatus })
      .eq("id", serviceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: newStatus === 'approved' ? "Serviço aprovado!" : "Status atualizado.",
      });
      fetchData();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const { error } = await supabase
      .from("marketplace_services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Serviço excluído.",
      });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredReservations = statusFilter === "all" 
    ? reservations 
    : reservations.filter((r) => r.status === statusFilter);

  const filteredServices = serviceFilter === "all"
    ? services
    : services.filter((s) => s.status === serviceFilter);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
    { icon: Building, label: "Imóveis", section: "properties" },
    { icon: Megaphone, label: "Avisos", section: "notices" },
    { icon: Receipt, label: "Taxas", section: "fees" },
    { icon: Calendar, label: "Reservas", section: "reservations" },
    { icon: Store, label: "Marketplace", section: "services" },
    { icon: Newspaper, label: "Notícias", section: "news" },
    { icon: FileText, label: "Documentos", section: "documents" },
    { icon: Download, label: "Estatísticas", section: "downloads" },
    { icon: Users, label: "Moradores", section: "residents" },
    { icon: MessageSquare, label: "Mensagens", section: "messages" },
    { icon: UserPlus, label: "Pedidos Acesso", section: "access-requests" },
    { icon: ImageIcon, label: "Galeria Sobre", section: "about-gallery" },
    { icon: Shield, label: "Minha Conta", section: "admins" },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0 h-screen flex-shrink-0 z-40",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoVilaOlimpica} 
              alt="Logo Vila Olímpica" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-foreground leading-tight">Vila Olímpica</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.section}>
                <button
                  onClick={() => setActiveSection(item.section)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
                    activeSection === item.section
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">Síndico</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn("w-full mt-3", sidebarCollapsed && "px-0")}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie o condomínio Vila Olímpica</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell onNavigate={setActiveSection} />
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Ver Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("access-requests")}>
                  <CardHeader className="pb-2">
                    <CardDescription>Pedidos de Acesso</CardDescription>
                    <CardTitle className="text-3xl text-primary">{stats.pendingAccessRequests}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">pendentes de aprovação</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("reservations")}>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Reservas</CardDescription>
                    <CardTitle className="text-3xl">{stats.totalReservations}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {stats.reservationsThisMonth} este mês · {stats.pendingReservations} pendentes
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("services")}>
                  <CardHeader className="pb-2">
                    <CardDescription>Serviços Pendentes</CardDescription>
                    <CardTitle className="text-3xl text-accent">{stats.pendingServices}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stats.approvedServices} aprovados</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("fees")}>
                  <CardHeader className="pb-2">
                    <CardDescription>Valor Total em Dívida</CardDescription>
                    <CardTitle className="text-3xl text-destructive tabular-nums">
                      {new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", maximumFractionDigits: 0 }).format(stats.totalDebt)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Histórico + meses vencidos (FFH + FDP)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("news")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Notícias</CardTitle>
                        <CardDescription>Gerenciar publicações</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("documents")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Documentos</CardTitle>
                        <CardDescription>Arquivo do condomínio</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("downloads")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Estatísticas</CardTitle>
                        <CardDescription>Downloads de documentos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </>
          )}

          {/* Properties Section */}
          {activeSection === "properties" && (
            <PropertiesManagement />
          )}

          {/* Notices Section */}
          {activeSection === "notices" && (
            <NoticesManagement />
          )}

          {/* Fees Section */}
          {activeSection === "fees" && (
            <FeesManagement />
          )}

          {/* Reservations Section */}
          {activeSection === "reservations" && (
            <ReservationsManagement />
          )}

          {/* Marketplace Services Section */}
          {activeSection === "services" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Serviços do Marketplace</CardTitle>
                      <CardDescription>Aprove ou rejeite serviços cadastrados</CardDescription>
                    </div>
                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
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
                  {filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum serviço encontrado.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Negócio</TableHead>
                          <TableHead>Proprietário</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {service.image_url && (
                                  <img
                                    src={service.image_url}
                                    alt={service.business_name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{service.business_name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{service.owner_name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-secondary rounded text-xs">
                                {service.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p>{service.phone}</p>
                                <p className="text-muted-foreground">{service.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                service.status === "approved"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : service.status === "rejected"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              )}>
                                {service.status === "approved" ? "Aprovado" :
                                 service.status === "rejected" ? "Rejeitado" : "Pendente"}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(service.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {service.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => handleUpdateServiceStatus(service.id, 'approved')}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleUpdateServiceStatus(service.id, 'rejected')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteService(service.id)}
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
          )}

          {/* News Section */}
          {activeSection === "news" && (
            <NewsManagement />
          )}

          {/* Documents Section */}
          {activeSection === "documents" && (
            <DocumentsManagement />
          )}

          {/* Downloads Stats Section */}
          {activeSection === "downloads" && (
            <DocumentDownloadsStats />
          )}
          {/* Residents Section */}
          {activeSection === "residents" && (
            <ResidentsManagement />
          )}
          {/* Access Requests Section */}
          {activeSection === "access-requests" && (
            <AccessRequestsManagement />
          )}
          {/* Messages Section */}
          {activeSection === "messages" && (
            <MessagesManagement />
          )}
          {/* About Gallery Section */}
          {activeSection === "about-gallery" && (
            <AboutGalleryManagement />
          )}
          {/* Admins Section */}
          {activeSection === "admins" && (
            <AdminsManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
