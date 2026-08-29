import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicNewsApi, NewsDto, resolveMediaUrl } from "@/lib/api";
import NewsDetailsDialog from "./NewsDetailsDialog";

const News = () => {
  const [selectedNews, setSelectedNews] = useState<NewsDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [news, setNews] = useState<NewsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await publicNewsApi.list();
      setNews(data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching news:", error);
    }
    setIsLoading(false);
  };

  const handleReadMore = (item: NewsDto) => {
    setSelectedNews(item);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section id="noticias" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-secondary/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
              Notícias
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Últimas Atualizações
            </h2>
            <p className="text-lg text-muted-foreground">
              Fique por dentro de tudo que acontece no Vila Olímpica. 
              Comunicados, eventos e melhorias.
            </p>
          </div>
          
          <Link to="/noticias" className="shrink-0">
            <Button variant="outline" size="lg" className="group">
              Ver Todas
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando notícias...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground">Nenhuma notícia disponível no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <article
                key={item.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-elegant transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={resolveMediaUrl(item.image_url) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-accent/90 backdrop-blur-md text-accent-foreground rounded-full text-xs font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <time>{formatDate(item.created_at)}</time>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto font-semibold text-primary group/btn hover:bg-transparent"
                    onClick={() => handleReadMore(item)}
                  >
                    Ler mais
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="text-center mt-12 lg:hidden">
          <Link to="/noticias">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver Todas as Notícias
            </Button>
          </Link>
        </div>
      </div>

      <NewsDetailsDialog
        news={selectedNews}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default News;
