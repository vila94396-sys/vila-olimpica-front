import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import vilaAerial from "@/assets/vila-olimpica-aerial-3.jpg";

const Properties = () => {
  return (
    <section id="imoveis" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={vilaAerial}
              alt="Vista aérea do Condomínio Vila Olímpica"
              className="w-full h-72 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-primary/40" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                Vila Olímpica
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
              Imóveis
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Imóveis Disponíveis
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Encontre a casa dos seus sonhos dentro do Vila Olímpica. 
              Imóveis selecionados para venda e arrendamento.
            </p>

            <Link to="/imoveis">
              <Button size="lg" className="group shadow-lg">
                <Home className="mr-2 w-5 h-5" />
                Ver Todos os Imóveis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Properties;
