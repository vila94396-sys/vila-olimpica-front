import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Número de WhatsApp do condomínio (formato: 258 + número sem espaços)
  const whatsappNumber = "258842814557";
  
  const quickMessages = [
    { text: "Informações sobre pagamentos", emoji: "💳", number: "258842814557" },
    { text: "Fazer uma reserva", emoji: "📅", number: "258842814557" },
    { text: "Reportar problema", emoji: "🔧", number: "258842814557" },
    { text: "Falar com administração", emoji: "💬", number: "258842814557" },
    { text: "Falar com segurança", emoji: "🛡️", number: "258856107137" }
  ];

  const sendWhatsAppMessage = (message: string, number?: string) => {
    const phoneNumber = number || whatsappNumber;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu de mensagens rápidas */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className="bg-background border-2 border-primary rounded-2xl shadow-2xl w-80 overflow-hidden">
            <div className="bg-primary p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground">Vila Olímpica</h3>
                    <p className="text-xs text-primary-foreground/80">Online agora</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-3">
                Como podemos ajudar você hoje?
              </p>
              {quickMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => sendWhatsAppMessage(msg.text, msg.number)}
                  className="w-full p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors flex items-center gap-3 group"
                >
                  <span className="text-2xl">{msg.emoji}</span>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {msg.text}
                  </span>
                </button>
              ))}
              
              <button
                onClick={() => sendWhatsAppMessage("Olá, gostaria de falar com a administração do condomínio.")}
                className="w-full mt-4 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-semibold"
              >
                Enviar mensagem personalizada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 md:right-8 z-50 w-16 h-16 rounded-full shadow-2xl hover:shadow-glow transition-all hover:scale-110"
        variant="default"
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </>
  );
};

export default WhatsAppButton;
