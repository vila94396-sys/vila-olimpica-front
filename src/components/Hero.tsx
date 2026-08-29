import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Users, Building2, ChevronDown } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";
import heroBackground from "@/assets/vila-olimpica-aerial-1.jpg";

const Hero = () => {
  const scrollToNext = () => {
    document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Vista aérea do Condomínio Vila Olímpica"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 bg-foreground/20" />
      </div>

      {/* Subtle ambient light */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-48 -left-24 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-28 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-4">
              <img 
                src={logoVilaOlimpica} 
                alt="Logo Vila Olímpica" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-2xl bg-white/95 p-2 shadow-xl"
              />
              <div className="text-left">
                <span className="px-3 py-1 bg-accent/20 backdrop-blur-md border border-accent/30 rounded-full text-primary-foreground text-xs font-semibold inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  Portal Oficial
                </span>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-primary-foreground mb-6 leading-[1] tracking-tight animate-fade-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Vila Olímpica
          </h1>

          <p className="text-xl md:text-2xl text-accent font-bold mb-6 tracking-wide uppercase animate-fade-up opacity-0" style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}>
            Condomínio · Zimpeto · Maputo
          </p>
          
          {/* Description */}
          <p className="text-base md:text-lg text-primary-foreground/85 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            Projecto emblemático do <span className="font-semibold text-accent">Fundo para o Fomento de Habitação (FFH)</span>, 
            nascido como legado dos X Jogos Africanos de 2011. Uma comunidade de mais de 
            <span className="font-semibold text-primary-foreground"> 3.371 moradores</span> focada na excelência e transparência.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <a href="#imoveis">
              <Button size="lg" className="group bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-10 h-14 text-base shadow-xl transition-all w-full sm:w-auto">
                <Home className="mr-2 w-5 h-5" />
                Explorar Imóveis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#lideranca">
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 backdrop-blur-md border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 font-semibold px-10 h-14 text-base w-full sm:w-auto transition-all">
                Conhecer Gestão
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 animate-fade-up opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            {[
              { icon: Home, value: "1.088", label: "Apartamentos" },
              { icon: Building2, value: "136", label: "Edifícios" },
              { icon: Building2, value: "32", label: "Blocos" },
              { icon: Users, value: "3.371+", label: "Moradores" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-1">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{stat.value}</div>
                <div className="text-xs text-primary-foreground/60 uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-primary-foreground/50 hover:text-primary-foreground transition-colors hidden md:flex flex-col items-center gap-1"
      >
        <div className="w-8 h-12 rounded-full border-2 border-primary-foreground/20 flex items-start justify-center p-2">
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </button>
    </section>
  );
};

export default Hero;
