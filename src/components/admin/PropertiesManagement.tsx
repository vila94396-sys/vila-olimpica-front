import { useState, useEffect } from "react";
import { propertiesApi, PropertyDto, resolveMediaUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Upload, 
  X, 
  Home,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Building2
} from "lucide-react";

type Property = PropertyDto;

const TRANSACTION_TYPES = [
  { value: "sale", label: "Venda" },
  { value: "rent", label: "Aluguel" },
];

const FEATURES_OPTIONS = [
  "Piscina",
  "Academia",
  "Churrasqueira",
  "Varanda",
  "Ar Condicionado",
  "Aquecimento",
  "Mobiliado",
  "Portaria 24h",
  "Playground",
  "Salão de Festas",
  "Elevador",
  "Pet Friendly",
  "Vista Privilegiada",
  "Jardim",
];

const PropertiesManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    transaction_type: "sale",
    price: "",
    area: "",
    bedrooms: "0",
    bathrooms: "0",
    parking_spots: "0",
    block: "",
    building: "",
    apartment_number: "",
    address: "",
    neighborhood: "Vila Olímpica",
    city: "Zimpeto",
    state: "Maputo",
    zip_code: "",
    features: [] as string[],
    image_url: "",
    gallery_urls: [] as string[],
    is_featured: false,
    is_active: true,
    owner_name: "",
    owner_whatsapp: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await propertiesApi.list();
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os imóveis.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      full_description: "",
      transaction_type: "sale",
      price: "",
      area: "",
      bedrooms: "0",
      bathrooms: "0",
      parking_spots: "0",
      block: "",
      building: "",
      apartment_number: "",
      address: "",
      neighborhood: "Vila Olímpica",
      city: "Zimpeto",
      state: "Maputo",
      zip_code: "",
      features: [],
      image_url: "",
      gallery_urls: [],
      is_featured: false,
      is_active: true,
      owner_name: "",
      owner_whatsapp: "",
    });
    setEditingProperty(null);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || "",
      full_description: property.full_description || "",
      transaction_type: property.transaction_type,
      price: property.price?.toString() || "",
      area: property.area?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "0",
      bathrooms: property.bathrooms?.toString() || "0",
      parking_spots: property.parking_spots?.toString() || "0",
      block: property.block || "",
      building: property.building || "",
      apartment_number: property.apartment_number || "",
      address: property.address || "",
      neighborhood: property.neighborhood || "",
      city: property.city || "Zimpeto",
      state: property.state || "Maputo",
      zip_code: property.zip_code || "",
      features: property.features || [],
      image_url: property.image_url || "",
      gallery_urls: property.gallery_urls || [],
      is_featured: property.is_featured,
      is_active: property.is_active,
      owner_name: property.owner_name || "",
      owner_whatsapp: property.owner_whatsapp || "",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { url } = await propertiesApi.uploadImage(file);
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    }
    setUploadingImage(false);
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const { url } = await propertiesApi.uploadImage(file);
        newUrls.push(url);
      } catch (error) {
        console.error("Error uploading gallery image:", error);
      }
    }

    setFormData({
      ...formData,
      gallery_urls: [...formData.gallery_urls, ...newUrls]
    });
    setUploadingGallery(false);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = formData.gallery_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery_urls: newGallery });
  };

  const toggleFeature = (feature: string) => {
    const features = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    setFormData({ ...formData, features });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const propertyData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      full_description: formData.full_description.trim() || null,
      property_type: "apartment",
      transaction_type: formData.transaction_type,
      price: formData.price ? parseFloat(formData.price) : null,
      area: formData.area ? parseFloat(formData.area) : null,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      parking_spots: parseInt(formData.parking_spots) || 0,
      block: formData.block.trim() || null,
      building: formData.building.trim() || null,
      apartment_number: formData.apartment_number.trim() || null,
      address: formData.address.trim() || null,
      neighborhood: formData.neighborhood.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      zip_code: formData.zip_code.trim() || null,
      features: formData.features.length > 0 ? formData.features : null,
      image_url: formData.image_url || null,
      gallery_urls: formData.gallery_urls.length > 0 ? formData.gallery_urls : null,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      owner_name: formData.owner_name.trim() || null,
      owner_whatsapp: formData.owner_whatsapp.trim() || null,
    };

    try {
      if (editingProperty) {
        await propertiesApi.update(editingProperty.id, propertyData);
      } else {
        await propertiesApi.create(propertyData);
      }
      toast({
        title: "Sucesso",
        description: editingProperty ? "Imóvel atualizado!" : "Imóvel cadastrado!",
      });
      setIsDialogOpen(false);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o imóvel.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;

    try {
      await propertiesApi.remove(id);
      toast({
        title: "Sucesso",
        description: "Imóvel excluído!",
      });
      fetchProperties();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "-";
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(price);
  };

  const getTransactionTypeLabel = (type: string) => {
    return TRANSACTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getLocationInfo = (property: Property) => {
    const parts = [];
    if (property.block) parts.push(`Bloco ${property.block}`);
    if (property.building) parts.push(`Ed. ${property.building}`);
    if (property.apartment_number) parts.push(`Apt. ${property.apartment_number}`);
    return parts.length > 0 ? parts.join(" • ") : "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Apartamentos</h2>
          <p className="text-muted-foreground">Cadastre e gerencie os apartamentos disponíveis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Apartamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Editar Apartamento" : "Cadastrar Novo Apartamento"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Informações Básicas</h3>
                
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Apartamento T3 - Bloco A"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="transaction_type">Tipo de Transação</Label>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição Curta</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descrição do apartamento..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="full_description">Descrição Completa</Label>
                  <Textarea
                    id="full_description"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Descrição detalhada do apartamento..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Apartment Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Localização do Apartamento</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="block">Bloco</Label>
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                      placeholder="Ex: A, B, C"
                    />
                  </div>

                  <div>
                    <Label htmlFor="building">Edifício</Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      placeholder="Ex: Torre 1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartment_number">Nº Apartamento</Label>
                    <Input
                      id="apartment_number"
                      value={formData.apartment_number}
                      onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                      placeholder="Ex: 101, 202"
                    />
                  </div>
                </div>
              </div>

              {/* Contacto do Dono */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Contacto do Dono do Imóvel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="owner_name">Nome do Dono</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      placeholder="Ex: João Manuel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_whatsapp">WhatsApp do Dono</Label>
                    <Input
                      id="owner_whatsapp"
                      value={formData.owner_whatsapp}
                      onChange={(e) => setFormData({ ...formData, owner_whatsapp: e.target.value })}
                      placeholder="Ex: +258 84 000 0000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Este é o número que será contactado quando um interessado clicar no botão do WhatsApp.</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Detalhes</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (MT)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0,00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parking_spots">Vagas</Label>
                    <Input
                      id="parking_spots"
                      type="number"
                      value={formData.parking_spots}
                      onChange={(e) => setFormData({ ...formData, parking_spots: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {FEATURES_OPTIONS.map((feature) => (
                    <Badge
                      key={feature}
                      variant={formData.features.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFeature(feature)}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Imagens</h3>
                
                {/* Main Image */}
                <div>
                  <Label>Imagem Principal</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.image_url ? (
                      <div className="relative">
                        <img
                          src={resolveMediaUrl(formData.image_url) || undefined}
                          alt="Main"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: "" })}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <Label>Galeria de Imagens</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.gallery_urls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={resolveMediaUrl(url) || undefined}
                          alt={`Gallery ${index + 1}`}
                          className="w-24 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      {uploadingGallery ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Adicionar</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Opções</h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Destaque</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProperty ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Apartamentos Cadastrados ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum apartamento cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apartamento</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Transação</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {property.image_url ? (
                            <img
                              src={resolveMediaUrl(property.image_url) || undefined}
                              alt={property.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                              <Home className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{property.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          {getLocationInfo(property)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTransactionTypeLabel(property.transaction_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(property.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {property.bedrooms !== null && property.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-4 h-4" />
                              {property.bedrooms}
                            </span>
                          )}
                          {property.bathrooms !== null && property.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {property.bathrooms}
                            </span>
                          )}
                          {property.parking_spots !== null && property.parking_spots > 0 && (
                            <span className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {property.parking_spots}
                            </span>
                          )}
                          {property.area && (
                            <span className="flex items-center gap-1">
                              <Ruler className="w-4 h-4" />
                              {property.area}m²
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {property.is_featured && (
                            <Badge variant="default" className="w-fit">Destaque</Badge>
                          )}
                          <Badge variant={property.is_active ? "secondary" : "outline"}>
                            {property.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(property)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(property.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesManagement;
