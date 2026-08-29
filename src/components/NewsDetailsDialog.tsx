import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsDto, resolveMediaUrl } from "@/lib/api";

interface NewsDetailsDialogProps {
  news: NewsDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsDetailsDialog = ({ news, open, onOpenChange }: NewsDetailsDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!news) return null;

  const allImages = news.gallery_urls && news.gallery_urls.length > 0
    ? news.gallery_urls.map((u) => resolveMediaUrl(u) as string)
    : news.image_url
      ? [resolveMediaUrl(news.image_url) as string]
      : ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  };

  const getReadTime = (content: string) => {
    const wordCount = content.split(/\s+/).length;
    return `${Math.ceil(wordCount / 200)} min`;
  };

  const goToPrev = () => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  const goToNext = () => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setCurrentImageIndex(0); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Gallery Header */}
        <div className="relative h-72 w-full">
          <img
            src={allImages[currentImageIndex]}
            alt={`${news.title} - Foto ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 rounded-full"
                onClick={goToPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 rounded-full"
                onClick={goToNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}

          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
              {news.category}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {news.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes completos da notícia
            </DialogDescription>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-accent" />
                <time>{formatDate(news.created_at)}</time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-accent" />
                <span>{getReadTime(news.content)} de leitura</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-accent" />
                <span>Administração</span>
              </div>
            </div>
          </DialogHeader>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? "border-primary ring-2 ring-primary/30" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
              {news.content}
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium text-foreground">
                {news.category}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailsDialog;
