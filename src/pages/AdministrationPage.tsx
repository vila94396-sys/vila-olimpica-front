import { ArrowLeft, Award, Calendar, Target, Heart, Users, Shield, Building2, Phone, Mail, Clock, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mussagyJumaImage from "@/assets/mussagy-juma.jpg";

const AdministrationPage = () => {
  const timeline = [
    {
      year: "2011",
      title: "Nascimento da Vila Olímpica",
      description: "Inauguração como projecto estratégico do FFH para os X Jogos Africanos.",
    },
    {
      year: "2012",
      title: "Conversão Residencial",
      description: "Transformação em complexo habitacional com os primeiros moradores.",
    },
    {
      year: "2020",
      title: "Consolidação Comunitária",
      description: "Estruturação formal da administração condominial e serviços.",
    },
    {
      year: "2025",
      title: "Nova Era: É Tempo de Agir",
      description: "Mussagy Juma assume a liderança com foco em auto-sustentabilidade e excelência.",
    },
    {
      year: "2027",
      title: "Horizonte",
      description: "Meta de consolidar a Vila como modelo de sustentabilidade em Moçambique.",
    },
  ];

  const pillars = [
    { 
      icon: Target, 
      title: "Governança", 
      description: "Implementação de uma gestão participativa e transparente" 
    },
    { 
      icon: Shield, 
      title: "Segurança Interna", 
      description: "Reforço da protecção e tranquilidade de todas as famílias" 
    },
    { 
      icon: Heart, 
      title: "Componente Social e de Lazer", 
      description: "Valorização dos espaços comuns e promoção do convívio" 
    },
    { 
      icon: Building2, 
      title: "Desenvolvimento e Cooperação", 
      description: "Busca de parcerias para tornar a Vila um modelo de sustentabilidade" 
    },
  ];

  const values = [
    "Integridade",
    "Honestidade", 
    "Solidariedade",
  ];

  const principles = [
    "Transparência",
    "Gestão Participativa",
    "Comprometimento",
    "Inclusão",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Link>
            
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
                Administração 2025-2027
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                "É Tempo de Agir"
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Uma gestão técnica e humanizada, assente em princípios rígidos de transparência 
                e prestação de contas, focada na satisfação total do morador.
              </p>
            </div>
          </div>
        </section>

        {/* President Biography */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-6">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-semibold">Presidente da Comissão de Moradores</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Mussagy Juma
                </h2>
                
                <p className="text-xl text-primary font-semibold mb-6">
                  "Futuro Melhor"
                </p>
                
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed mb-8">
                  <p>
                    Mussagy Juma assume a liderança da Comissão de Moradores com um histórico 
                    marcado pela paixão e dedicação ao bem-estar da comunidade. Mesmo antes de 
                    integrar formalmente a administração, Juma destacou-se pela sua vontade de 
                    promover uma vida digna para todos os condóminos.
                  </p>
                  <p>
                    A sua actuação pauta-se pela total inclusão e sem qualquer tipo de 
                    discriminação — seja ela religiosa, partidária ou de cor. A sua figura 
                    representa a energia e a competência necessárias para impulsionar a 
                    reconstrução e o desenvolvimento da Vila.
                  </p>
                  <p className="italic border-l-4 border-accent pl-4 text-foreground">
                    "A 'Peculiar Vila Olímpica', como é carinhosamente chamada, atravessa agora 
                    um novo capítulo focado na auto-sustentabilidade, coesão social e excelência 
                    na gestão."
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:presidente@vilaolimpica.co.mz" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                    <Mail className="w-4 h-4" />
                    Enviar Mensagem
                  </a>
                  <a href="tel:+258842814557" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-all">
                    <Phone className="w-4 h-4" />
                    +258 84 281 4557
                  </a>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl">
                    <img
                      src={mussagyJumaImage}
                      alt="Mussagy Juma - Presidente da Comissão de Moradores"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
                  
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-6 py-2 rounded-full font-semibold shadow-lg">
                    Gestão 2025-2027
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Estratégia 2025-2027</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Os Quatro Pilares da Gestão
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Eixos estratégicos fundamentais que orientam todas as acções da administração.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-elegant transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <pillar.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values & Principles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Values */}
              <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative z-10">
                  <Heart className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-6">Nossos Valores</h3>
                  <div className="space-y-3">
                    {values.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-lg font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Principles */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <Target className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-6">Princípios Norteadores</h3>
                <div className="space-y-3">
                  {principles.map((principle, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-lg text-foreground font-medium">{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/15 rounded-full mb-4">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Nossa Jornada</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Histórico da Vila Olímpica
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Da sua origem como projecto para os Jogos Africanos até à comunidade vibrante de hoje.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                
                {timeline.map((item, index) => (
                  <div key={index} className="relative pl-20 pb-12 last:pb-0">
                    <div className="absolute left-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all">
                      <span className="text-accent font-bold text-lg">{item.year}</span>
                      <h3 className="text-xl font-bold text-foreground mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Junte-se à Nossa Comunidade
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              A nossa equipe está sempre disponível para ouvir você. É tempo de agir juntos!
            </p>
            <Link to="/contato">
              <Button variant="accent" size="lg">
                Fale Connosco
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdministrationPage;
