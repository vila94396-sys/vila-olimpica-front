import { MapPin, Phone, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

const ContactPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      details: ["Bairro do Zimpeto", "Maputo, Moçambique"],
    },
    {
      icon: Phone,
      title: "Telefone",
      details: ["+258 84 281 4557"],
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: ["+258 84 281 4557"],
      links: ["https://wa.me/2588842814557"],
    },
    {
      icon: Clock,
      title: "Horário de Atendimento",
      details: ["Segunda a Sexta: 9h00 - 18h00", "Sábado: 9h00 - 13h00"],
    },
  ];

  const departments = [
    {
      name: "Administração",
      phone: "+258 84 281 4557",
      description: "Assuntos gerais, reclamações e sugestões",
    },
    {
      name: "Departamento de Segurança",
      phone: "+258 85 610 7137",
      description: "Ocorrências, controle de acesso e vigilância",
    },
    {
      name: "Bombeiros",
      phone: "+258 84 764 4237",
      description: "Em caso de emergencias",
    },
    {
      name: "FIPAG",
      phone: "+258 82 918 7642",
      description: "FIPAG",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // Here you would typically send the form data
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Contato</span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">Entre em Contato</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou informação.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{info.title}</h3>
                {info.details.map((detail, i) =>
                  info.links ? (
                    <a
                      key={i}
                      href={info.links[i]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-muted-foreground hover:text-accent transition-colors"
                    >
                      {detail}
                    </a>
                  ) : (
                    <p key={i} className="text-muted-foreground">
                      {detail}
                    </p>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <div className="bg-card rounded-xl border border-border p-8 shadow-elegant">
                <h2 className="text-2xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>

                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Mensagem Enviada!</h3>
                    <p className="text-muted-foreground mb-6">Obrigado pelo seu contato. Responderemos em breve.</p>
                    <Button onClick={() => setFormSubmitted(false)}>Enviar Nova Mensagem</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Nome Completo
                        </label>
                        <Input id="name" type="text" placeholder="Seu nome" required />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          Telefone
                        </label>
                        <Input id="phone" type="tel" placeholder="+258 84 123 4567" required />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="seu@email.com" required />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Assunto
                      </label>
                      <Input id="subject" type="text" placeholder="Assunto da mensagem" required />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Mensagem
                      </label>
                      <Textarea id="message" placeholder="Como podemos ajudar?" rows={5} required />
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Departamentos</h2>
              <div className="space-y-4 mb-8">
                {departments.map((dept, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-xl border border-border hover:shadow-elegant transition-all"
                  >
                    <h3 className="font-bold text-foreground mb-1">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{dept.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`https://wa.me/${dept.phone.replace(/\s/g, "").replace("+", "")}`, "_blank")
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {dept.phone}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="bg-primary rounded-xl p-6 text-primary-foreground">
                <h3 className="text-xl font-bold mb-2">Emergências 24/7</h3>
                <p className="text-primary-foreground/90 mb-4">
                  Para situações urgentes, nossa equipe está disponível 24 horas por dia.
                </p>
                <p className="text-3xl font-bold mb-4">+258 85 610 7137</p>
                <Button
                  variant="outline"
                  className="bg-background/20 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground hover:bg-background/30"
                  onClick={() => window.open("https://wa.me/258856107137", "_blank")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ligar Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Localização</h2>
            <p className="text-muted-foreground mb-8">Visite-nos no Bairro do Zimpeto, Maputo, Moçambique</p>
            <div className="bg-card rounded-xl border border-border overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.0!2d32.6056!3d-25.8617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee6922cd101bc49%3A0xb9fc1254fa431f94!2sCondom%C3%ADnio%20Vila%20Olimpica%20de%20Zimpeto!5e0!3m2!1spt!2smz!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do Vila Olímpica"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;
