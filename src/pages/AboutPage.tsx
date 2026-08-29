import { Building2, Shield, Users, Heart, MapPin, Award, Target, CheckCircle, Home, TrendingUp, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aerialImage1 from "@/assets/vila-olimpica-aerial-1.jpg";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  display_order: number;
}

const AboutPage = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("about_gallery")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) setGalleryImages(data);
    };
    fetchGallery();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || galleryImages.length === 0) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth / 2) {
        scrollPos = 0;
      }
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(animate); };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [galleryImages]);

  const highlights = [
    {
      icon: Calendar,
      title: "Legado Histórico",
      description: "Concebida com padrões internacionais para acolher delegações de todo o continente africano durante os X Jogos Africanos, mantendo até hoje o prestígio dessa origem.",
    },
    {
      icon: Users,
      title: "Dinâmica Social",
      description: "Lar de uma comunidade diversificada, composta maioritariamente por jovens profissionais e famílias, promovendo um ambiente social dinâmico e seguro.",
    },
    {
      icon: TrendingUp,
      title: "Catalisador de Desenvolvimento",
      description: "A sua implementação atraiu investimentos significativos para a zona norte, incluindo novos centros comerciais, agências bancárias e melhores acessos rodoviários.",
    },
    {
      icon: Eye,
      title: "Qualidade de Vida",
      description: "Espaços amplos, facilidade de estacionamento e uma vista privilegiada para o icónico Estádio Nacional do Zimpeto.",
    },
  ];

  const stats = [
    { value: "2011", label: "Ano de Fundação" },
    { value: "2.643+", label: "Moradores" },
    { value: "1.088", label: "Apartamentos" },
    { value: "136", label: "Edifícios" },
    { value: "32", label: "Blocos" },
  ];

  const values = [
    { title: "Segurança", description: "Vigilância 24h com controlo de acessos" },
    { title: "Sustentabilidade", description: "Práticas ecológicas em todas as operações" },
    { title: "Comunidade", description: "Fortalecimento dos laços entre moradores" },
    { title: "Inovação", description: "Soluções modernas para gestão condominial" },
  ];

  const timeline = [
    { year: "2011", event: "Inauguração como centro de acolhimento dos X Jogos Africanos" },
    { year: "2012", event: "Conversão para complexo residencial pelo FFH" },
    { year: "2015", event: "Expansão dos serviços e infraestruturas de apoio" },
    { year: "2020", event: "Modernização do sistema de gestão condominial" },
    { year: "2024", event: "Consolidação como referência habitacional em Maputo" },
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-accent/20 border border-accent/30 rounded-full text-accent text-sm font-semibold mb-4">
              Sobre Nós
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">
              Condomínio Vila Olímpica do Zimpeto
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Um projeto emblemático do Fundo para o Fomento de Habitação (FFH), 
              nascido em 2011 como centro de acolhimento dos X Jogos Africanos.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* History Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Nossa História</h2>
              <p className="text-lg text-muted-foreground mb-4">
                O <strong className="text-foreground">Condomínio Vila Olímpica do Zimpeto</strong> nasceu no ano de 2011, 
                inicialmente como o centro de acolhimento dos X Jogos Africanos, e é um projeto emblemático do 
                Fundo para o Fomento de Habitação (FFH).
              </p>
              <p className="text-lg text-muted-foreground mb-4">
              Hoje, residem lá mais de <strong className="text-foreground">2.643 moradores</strong>, 
                distribuídos por <strong className="text-foreground">1.088 apartamentos</strong> em 
                <strong className="text-foreground">136 edifícios</strong> organizados em <strong className="text-foreground">32 blocos</strong>, tornando este complexo uma referência em habitação planeada em Moçambique.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
              Este empreendimento representa um marco de modernidade na arquitetura habitacional de Maputo, 
                oferecendo uma estrutura robusta de <strong className="text-foreground">32 blocos com tipologia T3</strong>.
                A sua criação foi o principal motor de desenvolvimento do bairro do Zimpeto, transformando a 
                região num novo polo de centralidade urbana.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span className="text-foreground font-medium">Zimpeto, Maputo</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Tipologia T3</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={aerialImage1} 
                alt="Vista aérea da Vila Olímpica" 
                className="rounded-2xl shadow-elegant w-full h-[450px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <p className="text-4xl font-bold">14+</p>
                <p className="text-sm">Anos de História</p>
              </div>
            </div>
          </div>

          {/* Image Gallery - Auto Scroll */}
          {galleryImages.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Galeria de Imagens</h2>
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-hidden cursor-grab"
                style={{ scrollBehavior: "auto" }}
              >
                {/* Duplicate images for infinite scroll effect */}
                {[...galleryImages, ...galleryImages].map((image, index) => (
                  <div
                    key={index}
                    className="group relative flex-shrink-0 w-72 md:w-96 aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <img
                      src={image.image_url}
                      alt={image.title || "Vila Olímpica"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {image.title && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium">
                          {image.title}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights Grid */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Pontos de Destaque</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              A Vila Olímpica distingue-se por características únicas que a tornam referência em habitação planeada.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-all group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <highlight.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative z-10">
                <Target className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  Proporcionar aos nossos moradores um ambiente residencial de excelência, 
                  dotado de infraestruturas de apoio, amplas áreas de lazer e uma organização 
                  espacial que privilegia a convivência familiar e a qualidade de vida.
                </p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8">
              <Award className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Nossos Valores</h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{value.title}</p>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Faça Parte do Nosso Condomínio</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra as oportunidades de viver em um dos maiores e mais vibrantes centros residenciais de Moçambique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/imoveis">
              <Button variant="hero" size="lg">Ver Imóveis Disponíveis</Button>
            </Link>
            <Link to="/contato">
              <Button variant="outline" size="lg">Entre em Contato</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;
