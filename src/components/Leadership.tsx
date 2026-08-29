import { Users, Award, Phone, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import mussagyJumaImage from "@/assets/mussagy-juma.jpg";
import equipe1 from "@/assets/equipe-1.jpg";
import equipe2 from "@/assets/equipe-2.jpg";
import equipe3 from "@/assets/equipe-3.jpg";
import equipe4 from "@/assets/equipe-4.jpg";

const Leadership = () => {
  const teamMembers = [
    {
      role: "Vice-Presidente",
      name: "Maria Santos",
      department: "Administração",
      image: equipe1,
    },
    {
      role: "Tesoureiro",
      name: "Carlos Machava",
      department: "Finanças",
      image: equipe2,
    },
    {
      role: "Secretária",
      name: "Ana Sitoe",
      department: "Comunicação",
      image: equipe3,
    },
    {
      role: "Conselheiro",
      name: "Pedro Langa",
      department: "Infraestrutura",
      image: equipe4,
    },
  ];

  return (
    <section id="lideranca" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Administração 2025-2027
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            "É Tempo de Agir"
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma gestão técnica e humanizada, assente em princípios rígidos de transparência 
            e prestação de contas, focada na satisfação total do morador.
          </p>
        </div>

        {/* President Section */}
        <div className="bg-primary rounded-2xl p-8 md:p-12 mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-primary-foreground/30 shadow-2xl">
                <img
                  src={mussagyJumaImage}
                  alt="Mussagy Juma - Presidente da Comissão de Moradores"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 rounded-full mb-4">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-semibold">Presidente da Comissão de Moradores</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                Mussagy Juma
              </h3>
              <p className="text-accent text-lg font-semibold mb-4">
                "Futuro Melhor"
              </p>
              <p className="text-primary-foreground/90 max-w-xl leading-relaxed mb-6">
                Mussagy Juma assume a liderança com um histórico marcado pela paixão e dedicação ao 
                bem-estar da comunidade. A sua figura representa a energia e competência necessárias 
                para impulsionar a reconstrução e o desenvolvimento da Vila Olímpica.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="tel:+258842814557"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  +258 84 281 4557
                </a>
                <Link to="/administracao">
                  <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Ver Mais
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Four Pillars Preview */}
        <div className="bg-secondary/50 rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold text-foreground">Os Quatro Pilares da Gestão</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="font-semibold text-foreground">Governança</p>
              <p className="text-sm text-muted-foreground">Gestão participativa</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="font-semibold text-foreground">Segurança</p>
              <p className="text-sm text-muted-foreground">Protecção das famílias</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="font-semibold text-foreground">Social e Lazer</p>
              <p className="text-sm text-muted-foreground">Valorização do convívio</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="font-semibold text-foreground">Desenvolvimento</p>
              <p className="text-sm text-muted-foreground">Parcerias sustentáveis</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Leadership;
