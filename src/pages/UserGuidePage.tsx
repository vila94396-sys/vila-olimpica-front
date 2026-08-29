import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  UserPlus,
  LogIn,
  Home,
  CalendarDays,
  ShoppingBag,
  ShieldCheck,
  Navigation,
  MessageCircle,
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  Users,
  Building,
  Newspaper,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const UserGuidePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Guia de Utilizador</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Tudo o que precisa saber para utilizar o Portal Vila Olímpica. Seleccione uma secção abaixo para expandir as instruções.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Accordion type="multiple" className="space-y-4">

          {/* 1. Navegação no Portal */}
          <AccordionItem value="navegacao" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Navegação no Portal</p>
                  <p className="text-sm text-muted-foreground font-normal">Área pública e menu principal</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p>O portal possui um menu de navegação no topo da página com acesso a todas as secções públicas:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Início", "Sobre", "Administração", "Imóveis", "Marketplace", "Notícias", "Arquivo", "Contato"].map((item) => (
                  <Badge key={item} variant="secondary" className="justify-center py-2">{item}</Badge>
                ))}
              </div>
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Botão WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      No canto inferior direito encontra um botão flutuante do WhatsApp para contacto rápido com a administração do condomínio.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">
                O botão <strong>"Área do Morador"</strong> no canto superior direito permite aceder à zona restrita (requer login).
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Pedido de Acesso */}
          <AccordionItem value="acesso" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Pedido de Acesso (Registo)</p>
                  <p className="text-sm text-muted-foreground font-normal">Como solicitar acesso ao portal</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p>Para aceder à Área do Morador, precisa primeiro solicitar acesso:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Aceda à página <strong>/pedido-acesso</strong> (link disponível na página de login)</li>
                <li>Preencha o formulário com os seus dados:</li>
              </ol>
              <div className="grid grid-cols-2 gap-2 pl-6">
                {["Nome completo", "Bloco", "Edifício", "Apartamento", "Tipo de morador", "Telefone", "Email"].map((field) => (
                  <Badge key={field} variant="outline" className="justify-start">{field}</Badge>
                ))}
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm" start={3}>
                <li>Submeta o formulário e aguarde a aprovação da administração</li>
                <li>Receberá um email com as credenciais de acesso após a aprovação</li>
              </ol>
              <Card className="bg-accent/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    Todos os campos são obrigatórios. O pedido será analisado pela administração e poderá ser aprovado ou rejeitado.
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Login e Recuperação de Senha */}
          <AccordionItem value="login" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Login e Recuperação de Senha</p>
                  <p className="text-sm text-muted-foreground font-normal">Autenticação e gestão de credenciais</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Como fazer login:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Clique em <strong>"Área do Morador"</strong> no menu principal</li>
                  <li>Introduza o seu email e palavra-passe fornecidos pela administração</li>
                  <li>Clique em <strong>"Entrar"</strong></li>
                </ol>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Primeiro acesso:</h4>
                <p className="text-sm">
                  No primeiro login, será solicitado a <strong>alterar a palavra-passe temporária</strong> fornecida pela administração. Escolha uma nova senha segura.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Esqueceu a senha?</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Na página de login, clique em <strong>"Esqueceu sua senha?"</strong></li>
                  <li>Introduza o email associado à sua conta</li>
                  <li>Receberá um link para redefinir a sua palavra-passe</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Área do Morador */}
          <AccordionItem value="morador" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Área do Morador</p>
                  <p className="text-sm text-muted-foreground font-normal">Painel personalizado para moradores</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <p>Após o login, terá acesso ao seu painel com as seguintes funcionalidades:</p>
              <div className="space-y-3">
                {[
                  { icon: <Navigation className="w-4 h-4" />, title: "Resumo", desc: "Visão geral com avisos recentes, atalhos rápidos para taxas, reservas e documentos." },
                  { icon: <Bell className="w-4 h-4" />, title: "Avisos", desc: "Consulte os avisos activos publicados pela administração do condomínio. Avisos urgentes aparecem em destaque." },
                  { icon: <CreditCard className="w-4 h-4" />, title: "Taxas", desc: "Visualize as taxas condominiais pendentes e efectue pagamentos. Para cada pagamento, seleccione o método (M-Pesa, e-Mola ou Cartão Visa) e introduza os dados necessários." },
                  { icon: <FileText className="w-4 h-4" />, title: "Transações", desc: "Consulte o histórico completo dos seus pagamentos com datas, valores, métodos e estado (pendente, confirmado)." },
                  { icon: <CalendarDays className="w-4 h-4" />, title: "Reservas", desc: "Aceda ao sistema de reservas de áreas comuns através do atalho rápido ou do menu." },
                  { icon: <FolderOpen className="w-4 h-4" />, title: "Documentos", desc: "Aceda ao arquivo de documentos do condomínio (actas, regulamentos, comunicados)." },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="text-primary mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Sistema de Reservas */}
          <AccordionItem value="reservas" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Sistema de Reservas</p>
                  <p className="text-sm text-muted-foreground font-normal">Áreas comuns e termos de uso</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Como criar uma reserva:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Aceda a <strong>Reservas</strong> na Área do Morador</li>
                  <li>Seleccione a <strong>área comum</strong> desejada (Aparelhagem, Pula Pula, Alpendres, Jardins, etc.)</li>
                  <li>Escolha a <strong>data</strong> e o <strong>horário</strong> (início e fim)</li>
                  <li>Adicione notas adicionais (opcional)</li>
                  <li>Leia o <strong>Termo de Uso</strong> com as regras obrigatórias</li>
                  <li>Marque a <strong>checkbox de aceitação</strong> das regras</li>
                  <li>Clique em <strong>"Confirmar Reserva"</strong></li>
                </ol>
              </div>
              <Card className="bg-accent/50">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Regras do Termo de Uso (obrigatórias):
                  </p>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Respeitar o horário reservado (máx. 4 horas)</li>
                    <li>Manter a área limpa após o uso</li>
                    <li>Não perturbar outros moradores com ruído excessivo</li>
                    <li>Comunicar qualquer dano à administração</li>
                    <li>Número máx. de convidados conforme capacidade da área</li>
                    <li>Reservas canceladas com menos de 24h poderão ter restrições futuras</li>
                  </ol>
                </CardContent>
              </Card>
              <div className="space-y-3">
                <h4 className="font-semibold">Gerir reservas:</h4>
                <p className="text-sm">
                  Na secção <strong>"Minhas Reservas"</strong> pode consultar todas as suas reservas e cancelar as que estiverem pendentes. O estado pode ser: <Badge variant="outline">Pendente</Badge> <Badge variant="secondary">Confirmada</Badge> <Badge variant="destructive">Cancelada</Badge>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Marketplace */}
          <AccordionItem value="marketplace" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Marketplace</p>
                  <p className="text-sm text-muted-foreground font-normal">Serviços e empreendedores locais</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Navegar serviços:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Aceda à página <strong>Marketplace</strong> no menu principal</li>
                  <li>Utilize os <strong>filtros por categoria</strong> para encontrar o serviço desejado</li>
                  <li>Clique num serviço para ver detalhes, contactos e horário de funcionamento</li>
                  <li>Contacte o empreendedor directamente por telefone ou email</li>
                </ol>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Cadastrar o seu serviço:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Na página do Marketplace, clique em <strong>"Cadastrar Serviço"</strong></li>
                  <li>Preencha os dados: nome do negócio, categoria, descrição, contactos, localização e horário</li>
                  <li>Submeta o formulário para análise da administração</li>
                  <li>O serviço ficará visível após aprovação</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Painel Administrativo */}
          <AccordionItem value="admin" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Painel Administrativo</p>
                  <p className="text-sm text-muted-foreground font-normal">Apenas para administradores</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <Card className="bg-accent/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">
                    O painel administrativo é acessível apenas a utilizadores com permissões de administrador. Aceda clicando no botão <strong>"Admin"</strong> na Área do Morador.
                  </p>
                </CardContent>
              </Card>
              <p>O painel inclui as seguintes secções de gestão:</p>
              <div className="space-y-3">
                {[
                  { icon: <BarChart3 className="w-4 h-4" />, title: "Dashboard", desc: "Visão geral com estatísticas: total de moradores, reservas do mês, taxas pendentes e receitas." },
                  { icon: <Building className="w-4 h-4" />, title: "Imóveis", desc: "Criar, editar e gerir propriedades do condomínio com fotos, descrições e características." },
                  { icon: <Bell className="w-4 h-4" />, title: "Avisos", desc: "Criar, editar e eliminar avisos. Definir prioridade (normal, importante, urgente) e estado activo/inactivo." },
                  { icon: <CreditCard className="w-4 h-4" />, title: "Taxas", desc: "Lançar taxas condominiais para moradores, seleccionar meses de referência e enviar notificações por email." },
                  { icon: <CalendarDays className="w-4 h-4" />, title: "Reservas", desc: "Visualizar todas as reservas, aprovar, confirmar ou cancelar pedidos de utilização de áreas comuns." },
                  { icon: <ShoppingBag className="w-4 h-4" />, title: "Marketplace", desc: "Aprovar ou rejeitar serviços cadastrados por moradores no marketplace." },
                  { icon: <Newspaper className="w-4 h-4" />, title: "Notícias", desc: "Publicar e gerir notícias do condomínio com título, resumo, conteúdo, categoria e imagem." },
                  { icon: <FolderOpen className="w-4 h-4" />, title: "Documentos", desc: "Upload e gestão de documentos (actas, regulamentos, comunicados). Organizar por pasta, categoria e ano." },
                  { icon: <BarChart3 className="w-4 h-4" />, title: "Estatísticas", desc: "Acompanhar downloads de documentos com gráficos e ranking dos mais consultados." },
                  { icon: <Users className="w-4 h-4" />, title: "Moradores", desc: "Lista completa de moradores registados com bloco, edifício, apartamento, telefone e tipo de morador." },
                  { icon: <UserPlus className="w-4 h-4" />, title: "Pedidos de Acesso", desc: "Aprovar ou rejeitar pedidos de novos moradores. Ao aprovar, é criada uma conta com senha temporária." },
                  { icon: <ShieldCheck className="w-4 h-4" />, title: "Administradores", desc: "Atribuir ou remover permissões de administrador a moradores registados." },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="text-primary mt-0.5 shrink-0">{item.icon}</div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. FAQ */}
          <AccordionItem value="faq" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">Perguntas Frequentes (FAQ)</p>
                  <p className="text-sm text-muted-foreground font-normal">Respostas às dúvidas mais comuns</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              <Accordion type="multiple" className="space-y-2">
                {[
                  { q: "Como posso solicitar acesso ao portal?", a: "Aceda à página de Pedido de Acesso através do link na página de login. Preencha todos os campos obrigatórios (nome, bloco, edifício, apartamento, tipo de morador, telefone e email) e aguarde a aprovação da administração." },
                  { q: "Esqueci a minha palavra-passe. O que faço?", a: "Na página de login, clique em \"Esqueceu sua senha?\", introduza o email da sua conta e receberá um link para redefinir a palavra-passe." },
                  { q: "Quanto tempo demora a aprovação do pedido de acesso?", a: "O tempo de aprovação depende da administração. Normalmente, os pedidos são analisados em poucos dias úteis. Receberá um email com as credenciais após a aprovação." },
                  { q: "Como pago a taxa condominial?", a: "Na Área do Morador, aceda à secção Taxas. Seleccione a taxa pendente, escolha o método de pagamento (M-Pesa, e-Mola ou Cartão Visa), introduza os dados necessários e confirme." },
                  { q: "Posso cancelar uma reserva já feita?", a: "Sim, na secção \"Minhas Reservas\" pode cancelar reservas com estado pendente. Atenção: cancelamentos com menos de 24 horas de antecedência poderão resultar em restrições futuras." },
                  { q: "Como cadastro o meu serviço no Marketplace?", a: "Aceda ao Marketplace no menu principal e clique em \"Cadastrar Serviço\". Preencha os dados do seu negócio e submeta para análise. O serviço ficará visível após aprovação da administração." },
                  { q: "Quem pode aceder ao Painel Administrativo?", a: "Apenas utilizadores com permissões de administrador. As permissões são atribuídas por outros administradores através da secção \"Administradores\" no painel." },
                  { q: "Como contacto a administração do condomínio?", a: "Pode utilizar a página de Contato no menu principal, enviar mensagem pelo botão flutuante do WhatsApp no canto inferior direito, ou ir directamente à secção de Contato na Área do Morador." },
                  { q: "Os meus dados estão seguros?", a: "Sim. O portal utiliza autenticação segura e cada morador apenas tem acesso aos seus próprios dados, pagamentos e reservas. A administração garante a protecção dos dados pessoais." },
                ].map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-md px-3">
                    <AccordionTrigger className="text-sm hover:no-underline py-3">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <p className="font-medium">Precisa de ajuda adicional?</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Se tiver dúvidas ou encontrar algum problema, contacte a administração através da página de <strong>Contato</strong> ou pelo botão do WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserGuidePage;
