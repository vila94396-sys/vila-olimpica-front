import { Store, Phone, MessageCircle, MapPin, Clock, Image, FileText, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppButton from "@/components/WhatsAppButton";

const RegisterServicePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    category: "",
    phone: "",
    whatsapp: "",
    location: "",
    description: "",
    fullDescription: "",
    hours: "",
  });

  const categories = [
    "Alimentação",
    "Comércio",
    "Serviços",
    "Moda",
    "Transporte",
    "Agricultura",
    "Tecnologia",
    "Saúde",
    "Educação",
    "Outro"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user?.id || 'anonymous'}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(fileName, imageFile);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.ownerName || !formData.businessName || !formData.category || !formData.phone || !formData.whatsapp || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação do número de WhatsApp (deve conter apenas números, +, e espaços)
    const whatsappRegex = /^[\d\s+]+$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      toast({
        title: "WhatsApp inválido",
        description: "Por favor, insira apenas números (ex: +258 84 123 4567).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload da imagem se existir
      let imageUrl = null;
      if (imageFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage();
        } catch (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          // Continua sem a imagem
        }
        setIsUploading(false);
      }

      // Obter usuário logado (opcional)
      const { data: { user } } = await supabase.auth.getUser();

      // Salvar no banco de dados
      const { error: dbError } = await supabase
        .from('marketplace_services')
        .insert({
          user_id: user?.id || null,
          owner_name: formData.ownerName.trim(),
          business_name: formData.businessName.trim(),
          category: formData.category,
          phone: formData.phone.trim(),
          email: formData.whatsapp.replace(/\s/g, '').replace('+', ''),
          location: formData.location.trim() || null,
          description: formData.description.trim(),
          full_description: formData.fullDescription.trim() || null,
          hours: formData.hours.trim() || null,
          image_url: imageUrl,
          status: 'pending'
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Solicitação enviada!",
        description: "O seu serviço foi cadastrado e está aguardando aprovação. Entraremos em contacto em breve.",
      });

      // Limpar formulário
      setFormData({
        ownerName: "",
        businessName: "",
        category: "",
        phone: "",
        whatsapp: "",
        location: "",
        description: "",
        fullDescription: "",
        hours: "",
      });
      removeImage();

      // Redirecionar para o marketplace
      navigate('/marketplace');

    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao cadastrar o serviço. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cadastre Seu Serviço</h1>
            <p className="text-primary-foreground/90">
              Divulgue seu negócio para toda a comunidade do Vila Olímpica. Preencha o formulário abaixo.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações do Proprietário */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Informações do Proprietário
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerName">Nome Completo *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={(e) => handleChange("ownerName", e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="+258 84 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          className="pl-10"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="+258 84 123 4567"
                          value={formData.whatsapp}
                          onChange={(e) => handleChange("whatsapp", e.target.value)}
                          className="pl-10"
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Número para contacto via WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Negócio */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5 text-accent" />
                  Informações do Negócio
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nome do Negócio/Serviço *</Label>
                    <Input
                      id="businessName"
                      placeholder="Ex: Salão de Beleza Elegância"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Ex: Vila Olímpica - Bloco A"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="pl-10"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hours">Horário de Funcionamento</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="hours"
                        placeholder="Ex: Segunda a Sexta: 8h - 18h"
                        value={formData.hours}
                        onChange={(e) => handleChange("hours", e.target.value)}
                        className="pl-10"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Logo/Imagem do Negócio</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                          <span className="text-xs text-muted-foreground">JPG, PNG (máx. 5MB)</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição Curta *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva brevemente o seu negócio (máx. 150 caracteres)"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      maxLength={150}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/150 caracteres
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fullDescription">Descrição Completa</Label>
                    <Textarea
                      id="fullDescription"
                      placeholder="Descreva em detalhes os seus produtos/serviços, diferenciais, etc."
                      value={formData.fullDescription}
                      onChange={(e) => handleChange("fullDescription", e.target.value)}
                      maxLength={1000}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.fullDescription.length}/1000 caracteres
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações sobre o Processo */}
              <div className="bg-secondary/50 border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Como funciona?</h2>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Preencha o formulário com os dados do seu negócio</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>A sua solicitação será enviada para nossa equipe</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Entraremos em contacto para validar as informações</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>O seu negócio será publicado no Marketplace!</span>
                  </li>
                </ol>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
                <Link to="/marketplace" className="sm:flex-shrink-0">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default RegisterServicePage;
