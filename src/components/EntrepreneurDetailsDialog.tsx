import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Tag, MessageCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface EntrepreneurDetailsDialogProps {
  entrepreneur: {
    id: string | number;
    name: string;
    service: string;
    category: string;
    description: string;
    image: string;
    images?: string[];
    phone: string;
    email: string;
    fullDescription?: string;
    location?: string;
    hours?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EntrepreneurDetailsDialog = ({
  entrepreneur,
  open,
  onOpenChange,
}: EntrepreneurDetailsDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when dialog opens with new entrepreneur
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  }, [open, entrepreneur?.id]);

  if (!entrepreneur) return null;

  // Build images array - use images if provided, otherwise use single image
  const images = entrepreneur.images && entrepreneur.images.length > 0 
    ? entrepreneur.images 
    : [entrepreneur.image];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\s/g, '').replace('+', '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Negócio</DialogTitle>
          <DialogDescription>
            Informações completas sobre o serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-secondary">
            <img
              src={images[currentImageIndex] || '/placeholder.svg'}
              alt={`${entrepreneur.name} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex 
                          ? 'bg-accent' 
                          : 'bg-background/60 hover:bg-background/80'
                      }`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-foreground">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Header Info */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {entrepreneur.name}
              </h3>
              <p className="text-accent font-semibold text-lg mb-2">
                {entrepreneur.service}
              </p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">
                <Tag className="w-3 h-3" />
                {entrepreneur.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-foreground">Sobre o Serviço</h4>
            <p className="text-muted-foreground leading-relaxed">
              {entrepreneur.fullDescription || entrepreneur.description}
            </p>
          </div>

          {/* Location */}
          {entrepreneur.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 text-accent" />
              <span>{entrepreneur.location}</span>
            </div>
          )}

          {/* Hours */}
          {entrepreneur.hours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5 text-accent" />
              <span>{entrepreneur.hours}</span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold text-lg text-foreground mb-3">Informações de Contacto</h4>
            
            <a
              href={`tel:${entrepreneur.phone}`}
              className="flex items-center gap-3 text-foreground hover:text-accent transition-colors p-2 hover:bg-secondary/50 rounded"
            >
              <Phone className="w-5 h-5 text-accent" />
              <span className="font-medium">{entrepreneur.phone}</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              onClick={() => window.location.href = `tel:${entrepreneur.phone}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Ligar Agora
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(entrepreneur.phone)}`, '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntrepreneurDetailsDialog;
