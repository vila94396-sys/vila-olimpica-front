import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Início", href: "/", isRoute: true },
    { label: "Sobre", href: "/sobre", isRoute: true },
    { label: "Administração", href: "/administracao", isRoute: true },
    { label: "Imóveis", href: "/imoveis", isRoute: true },
    { label: "Marketplace", href: "/marketplace", isRoute: true },
    { label: "Notícias", href: "/noticias", isRoute: true },
    { label: "Arquivo", href: "/arquivo", isRoute: true },
    { label: "Contato", href: "/contato", isRoute: true },
    { label: "Guia", href: "/guia", isRoute: true },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoVilaOlimpica} 
              alt="Logo Vila Olímpica" 
              className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">
                Vila Olímpica
              </span>
              <span className="text-xs text-muted-foreground">Condomínio</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/auth">
              <Button variant="hero" size="sm">
                Área do Morador
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/auth" className="w-full">
                <Button variant="hero" size="sm" className="w-full" onClick={() => setIsOpen(false)}>
                  Área do Morador
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
