import { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight, Star, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Maria da Conceição",
      role: "Moradora há 5 anos",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      quote: "Morar no Vila Olímpica transformou a qualidade de vida da minha família. A segurança e o senso de comunidade são incomparáveis.",
      rating: 5,
    },
    {
      id: 2,
      name: "António Machava",
      role: "Morador há 3 anos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "A administração é transparente e sempre atenta às necessidades dos moradores. As áreas de lazer são excelentes.",
      rating: 5,
    },
    {
      id: 3,
      name: "Fátima Nguenha",
      role: "Moradora há 2 anos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "O que mais aprecio é a comunidade unida. Os eventos aproximam os vizinhos e criam laços de amizade.",
      rating: 5,
    },
    {
      id: 4,
      name: "Carlos Sitoe",
      role: "Morador há 4 anos",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "A localização privilegiada e o acesso fácil aos serviços essenciais fazem toda a diferença no dia a dia.",
      rating: 5,
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <section id="depoimentos" className="py-16 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left side - Header */}
          <div className="lg:w-1/3 text-center lg:text-left">
            <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-semibold mb-3">
              Depoimentos
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              O Que Dizem Nossos Moradores
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Histórias reais de famílias que escolheram o Vila Olímpica.
            </p>
            
            {/* Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full w-10 h-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className="rounded-full w-10 h-10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full w-10 h-10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {currentIndex + 1} / {testimonials.length}
              </span>
            </div>
          </div>

          {/* Right side - Testimonial Card */}
          <div className="lg:w-2/3 w-full">
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0"
                  >
                    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
                      <div className="flex items-start gap-4">
                        <Quote className="w-8 h-8 text-accent/30 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed mb-4">
                            "{testimonial.quote}"
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                              />
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation - Mobile */}
            <div className="flex lg:hidden items-center justify-center gap-3 mt-4">
              <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full w-8 h-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={togglePlay} className="rounded-full w-8 h-8">
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
              <div className="flex items-center gap-1.5">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentIndex ? "bg-primary w-4" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full w-8 h-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
