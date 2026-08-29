import { Building2, Shield, Users, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: Building2,
      title: "Infraestrutura Moderna",
      description: "Instalações de alta qualidade com áreas de lazer completas e segurança 24 horas.",
    },
    {
      icon: Shield,
      title: "Transparência Total",
      description: "Acesso completo a relatórios financeiros e decisões da administração.",
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Eventos regulares e espaços para conexão entre moradores.",
    },
    {
      icon: Heart,
      title: "Qualidade de Vida",
      description: "Localização privilegiada com acesso fácil a serviços essenciais.",
    },
  ];

  return (
    <section id="sobre" className="py-24 bg-secondary/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Sobre Nós
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Condomínio{" "}
            <span className="text-primary">Vila Olímpica</span>
            {" "}do Zimpeto
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Nascido em 2011 como projecto estratégico do Fundo para o Fomento de Habitação (FFH) 
            para os X Jogos Africanos. Hoje, uma comunidade vibrante com mais de 1.088 apartamentos 
            distribuídos por 136 edifícios em 32 blocos, onde residem milhares de 
            moradores em busca de um estilo de vida moderno e seguro.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-6 md:p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary rounded-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] rounded-3xl opacity-50" />
          
          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Faça Parte do Nosso Condomínio
                </h3>
                <p className="text-lg md:text-xl text-primary-foreground/85 max-w-xl">
                  Descubra as oportunidades de viver em um dos condomínios mais bem estruturados da região.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/imoveis" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl group"
                >
                  Ver Imóveis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/contato" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-foreground/15 hover:bg-primary-foreground/25 border border-primary-foreground/30 text-primary-foreground rounded-xl font-semibold transition-all"
                >
                  Entre em Contato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
