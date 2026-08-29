import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ResidentArea from "./pages/ResidentArea";
import AboutPage from "./pages/AboutPage";
import AdministrationPage from "./pages/AdministrationPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import MarketplacePage from "./pages/MarketplacePage";
import RegisterServicePage from "./pages/RegisterServicePage";
import NewsPage from "./pages/NewsPage";
import ArchivePage from "./pages/ArchivePage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ReservationsPage from "./pages/ReservationsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccessRequestPage from "./pages/AccessRequestPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import UserGuidePage from "./pages/UserGuidePage";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import MyServicesPage from "./pages/MyServicesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/area-morador" element={<ResidentArea />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/administracao" element={<AdministrationPage />} />
          <Route path="/imoveis" element={<PropertiesPage />} />
          <Route path="/imoveis/:id" element={<PropertyDetailsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/cadastrar" element={<RegisterServicePage />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/arquivo" element={<ArchivePage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reservas" element={<ReservationsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/pedido-acesso" element={<AccessRequestPage />} />
          <Route path="/alterar-senha" element={<ChangePasswordPage />} />
          <Route path="/guia" element={<UserGuidePage />} />
          <Route path="/meus-imoveis" element={<MyPropertiesPage />} />
          <Route path="/meus-servicos" element={<MyServicesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
