import { MapPin, Bath, Bed, Square, Home, Search, MessageCircle, Ruler, Car, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { publicPropertiesApi, resolveMediaUrl, PropertyDto } from "@/lib/api";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

// Fallback images
import imovel1 from "@/assets/imovel-1.jpg";
import imovel2 from "@/assets/imovel-2.jpg";
import imovel3 from "@/assets/imovel-3.jpg";
import imovel4 from "@/assets/imovel-4.jfif";

type Property = PropertyDto;

const normalizeWhatsapp = (raw?: string | null) => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("258") ? digits : `258${digits}`;
};

const PROPERTY_TYPES = [
  { value: "all", label: "Todos os Tipos" },
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "commercial", label: "Comercial" },
  { value: "land", label: "Terreno" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Cobertura" },
];

const TRANSACTION_TYPES = [
  { value: "all", label: "Todos" },
  { value: "sale", label: "Venda" },
  { value: "rent", label: "Aluguel" },
  { value: "seasonal", label: "Temporada" },
];

const WHATSAPP_NUMBER = "258842814557";

const fallbackImages = [imovel1, imovel2, imovel3, imovel4];

const PropertiesPage = () => {
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const allFeatures = [
    "Piscina",
    "Academia",
    "Churrasqueira",
    "Varanda",
    "Ar Condicionado",
    "Mobiliado",
    "Portaria 24h",
    "Elevador",
    "Pet Friendly",
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await publicPropertiesApi.list();
      setDbProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
    setIsLoading(false);
  };

  const allProperties = dbProperties;

  const filteredProperties = allProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTransaction =
      transactionType === "all" || property.transaction_type === transactionType;

    const matchesPropertyType =
      propertyType === "all" || property.property_type === propertyType;

    const matchesBedrooms =
      minBedrooms === 0 || (property.bedrooms && property.bedrooms >= minBedrooms);

    const matchesPrice =
      !property.price ||
      (property.price >= priceRange[0] && property.price <= priceRange[1]);

    const matchesFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feature) =>
        property.features?.includes(feature)
      );

    return (
      matchesSearch &&
      matchesTransaction &&
      matchesPropertyType &&
      matchesBedrooms &&
      matchesPrice &&
      matchesFeatures
    );
  });

  const formatPrice = (price: number | null) => {
    if (!price) return "Consulte";
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getTransactionLabel = (type: string) => {
    return TRANSACTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getWhatsAppLink = (property: Property) => {
    const owner = normalizeWhatsapp(property.owner_whatsapp);
    if (!owner) return null;
    const message = encodeURIComponent(
      `Olá${property.owner_name ? ` ${property.owner_name}` : ""}! Tenho interesse no imóvel: ${property.title}. Gostaria de mais informações.`
    );
    return `https://wa.me/${owner}?text=${message}`;
  };

  const getFallbackImage = (index: number) => {
    return fallbackImages[index % fallbackImages.length];
  };

  const clearFilters = () => {
    setTransactionType("all");
    setPropertyType("all");
    setMinBedrooms(0);
    setPriceRange([0, 50000000]);
    setSelectedFeatures([]);
    setSearchTerm("");
  };

  const hasActiveFilters =
    transactionType !== "all" ||
    propertyType !== "all" ||
    minBedrooms > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000000 ||
    selectedFeatures.length > 0;

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              Imóveis
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-6">
              Imóveis Disponíveis
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Encontre a casa dos seus sonhos dentro do Vila Olímpica. Imóveis
              selecionados para venda e aluguel.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="py-6 bg-secondary/50 border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Transação" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Button */}
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}

              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros Avançados
                    {hasActiveFilters && (
                      <Badge className="ml-2" variant="secondary">
                        {selectedFeatures.length + (minBedrooms > 0 ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Bedrooms */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Quartos (mínimo)
                      </label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4].map((num) => (
                          <Button
                            key={num}
                            variant={minBedrooms === num ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMinBedrooms(num)}
                          >
                            {num === 0 ? "Todos" : `${num}+`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Faixa de Preço
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={50000000}
                        step={100000}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Características
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allFeatures.map((feature) => (
                          <Badge
                            key={feature}
                            variant={
                              selectedFeatures.includes(feature)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => toggleFeature(feature)}
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setIsFiltersOpen(false)}
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">
                {filteredProperties.length}
              </span>{" "}
              imóveis
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-24">
              <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <Card
                  key={property.id}
                  className="overflow-hidden hover:shadow-elegant transition-all group"
                >
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={resolveMediaUrl(property.image_url) || getFallbackImage(index)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.is_featured && (
                        <Badge className="bg-accent text-accent-foreground">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={
                          property.transaction_type === "sale"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {getTransactionLabel(property.transaction_type)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground line-clamp-1">
                        {property.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0">
                        {getPropertyTypeLabel(property.property_type)}
                      </Badge>
                    </div>

                    {property.neighborhood && (
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {property.neighborhood}
                          {property.city && `, ${property.city}`}
                        </span>
                      </div>
                    )}

                    {property.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      {property.bedrooms !== null && property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms !== null && property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.parking_spots !== null &&
                        property.parking_spots > 0 && (
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            <span>{property.parking_spots}</span>
                          </div>
                        )}
                      {property.area && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>{property.area}m²</span>
                        </div>
                      )}
                    </div>

                    {property.features && property.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.features.slice(0, 3).map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{property.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(property.price)}
                      </div>
                      <div className="flex gap-2">
                        {getWhatsAppLink(property) && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              window.open(getWhatsAppLink(property)!, "_blank")
                            }
                            title={property.owner_name ? `WhatsApp de ${property.owner_name}` : "WhatsApp do proprietário"}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Link to={`/imoveis/${property.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <Home className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Não Encontrou o Imóvel Ideal?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e nossos consultores irão ajudá-lo a
            encontrar a melhor opção para você.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-background/20 backdrop-blur-sm border-2 border-accent-foreground/30 text-accent-foreground hover:bg-background/30"
            onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com Consultor
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PropertiesPage;
