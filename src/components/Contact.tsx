import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, MessageCircle, Clock, Send, Mail } from "lucide-react";

const Contact = () => {
  return (
    <section id="contato" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-semibold mb-4">
            Contato
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-muted-foreground">
            Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou informação.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Informações de Contato
            </h3>
            
            <div className="space-y-5 mb-8">
              {/* Endereço */}
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Endereço</h4>
                  <p className="text-muted-foreground">Bairro do Zimpeto</p>
                  <p className="text-muted-foreground">Maputo, Moçambique</p>
                </div>
              </div>

              {/* Administração */}
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Administração</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Telefone: +258 84 281 4557</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <a href="https://wa.me/258842814557" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      WhatsApp: +258 84 281 4557
                    </a>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Segurança</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Telefone: +258 85 610 7137</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <a href="https://wa.me/258856107137" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      WhatsApp: +258 85 610 7137
                    </a>
                  </div>
                </div>
              </div>

              {/* Horário */}
              <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                  <p className="text-muted-foreground">Segunda a Sexta: 7h30 - 15h30</p>
                  <p className="text-muted-foreground">Sábado: 8h00 - 12h00</p>
                </div>
              </div>
            </div>

            <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Emergências 24/7</h4>
                <p className="text-primary-foreground/85 mb-4">
                  Para situações urgentes, nossa equipe está disponível 24 horas.
                </p>
                <p className="text-3xl font-bold">+258 85 610 7137</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Envie uma Mensagem
            </h3>
            
            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo
                </label>
                <Input id="name" type="text" placeholder="Seu nome" className="h-12" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="seu@email.com" className="h-12" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Telefone
                  </label>
                  <Input id="phone" type="tel" placeholder="+258 84 123 4567" className="h-12" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Mensagem
                </label>
                <Textarea id="message" placeholder="Como podemos ajudar?" rows={5} />
              </div>

              <Button size="lg" className="w-full h-12 shadow-lg">
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
