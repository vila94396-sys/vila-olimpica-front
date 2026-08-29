import { Calendar, ArrowRight, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicNewsApi, NewsDto, resolveMediaUrl } from "@/lib/api";
import WhatsAppButton from "@/components/WhatsAppButton";
import NewsDetailsDialog from "@/components/NewsDetailsDialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedNews, setSelectedNews] = useState<NewsDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [news, setNews] = useState<NewsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ["Todos", "Infraestrutura", "Comunicado", "Segurança", "Eventos", "Manutenção"];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await publicNewsApi.list();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  const filteredNews = selectedCategory === "Todos" 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const featuredNews = news[0];

  const handleReadMore = (item: NewsDto) => {
    setSelectedNews(item);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Notícias</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Últimas Atualizações</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Fique por dentro de tudo que acontece no Vila Olímpica. Comunicados, eventos e melhorias.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground text-lg">Nenhuma notícia disponível no momento.</p>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {featuredNews && (
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant">
                  <div className="grid lg:grid-cols-2">
                    <div className="relative h-64 lg:h-auto">
                      <img
                        src={resolveMediaUrl(featuredNews.image_url) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                          Destaque
                        </span>
                      </div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-secondary rounded text-xs font-medium text-muted-foreground">
                          {featuredNews.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredNews.created_at)}
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-foreground mb-4">{featuredNews.title}</h2>
                      <p className="text-muted-foreground mb-6 line-clamp-4">{featuredNews.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Administração
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getReadTime(featuredNews.content)} de leitura
                          </div>
                        </div>
                        <Button 
                          variant="default"
                          onClick={() => handleReadMore(featuredNews)}
                        >
                          Ler mais
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Category Filters */}
          <section className="py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* News Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <p className="text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">{filteredNews.length}</span> notícias
                  {selectedCategory !== "Todos" && ` em ${selectedCategory}`}
                </p>
              </div>

              {filteredNews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma notícia encontrada nesta categoria.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.map((item) => (
                    <article
                      key={item.id}
                      className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-elegant transition-all group"
                    >
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={resolveMediaUrl(item.image_url) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <time>{formatDate(item.created_at)}</time>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getReadTime(item.content)}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {item.summary}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Administração
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="group/btn"
                            onClick={() => handleReadMore(item)}
                          >
                            Ler mais
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Receba Nossas Atualizações</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Fique por dentro de todas as novidades do condomínio via WhatsApp.
          </p>
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => window.open('https://wa.me/258843001234?text=Olá! Gostaria de receber as atualizações do condomínio via WhatsApp.', '_blank')}
          >
            Receber Atualizações
          </Button>
        </div>
      </section>

      {/* News Details Dialog */}
      <NewsDetailsDialog
        news={selectedNews}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default NewsPage;
