import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

const accessRequestSchema = z.object({
  full_name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  block: z.string().trim().min(1, "Bloco é obrigatório").max(10),
  building: z.string().trim().min(1, "Edifício é obrigatório").max(50),
  apartment: z.string().trim().min(1, "Apartamento é obrigatório").max(10),
  resident_type: z.enum(["proprietario", "inquilino"], { required_error: "Selecione o tipo de morador" }),
  phone: z.string().trim().min(8, "Contacto deve ter pelo menos 8 dígitos").max(20),
  whatsapp: z.string().trim().min(8, "Número de WhatsApp é obrigatório").max(20),
  email: z.string().trim().email("Email inválido").max(255),
});

type AccessRequestForm = z.infer<typeof accessRequestSchema>;

const AccessRequestPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<AccessRequestForm>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      full_name: "",
      block: "",
      building: "",
      apartment: "",
      phone: "",
      whatsapp: "",
      email: "",
    },
  });

  const onSubmit = async (data: AccessRequestForm) => {
    setIsSubmitting(true);
    try {
      try {
        await authApi.requestAccess(data);
      } catch (err: any) {
        const msg: string = err.message || "";
        if (msg.includes("already exists")) {
          toast({
            title: "Pedido negado: email já registado",
            description: msg.includes("A request with this email")
              ? "Já existe um pedido com este email. Se foi aprovado, faça login; se está pendente, aguarde a aprovação da administração."
              : "Este email já tem uma conta activa no sistema. Faça login ou recupere a sua palavra-passe.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw err;
      }

      // Notify admin via WhatsApp
      const tipoMorador = data.resident_type === "proprietario" ? "Proprietário" : "Inquilino";
      const whatsappMessage = `🔔 *Novo Pedido de Acesso*\n\n` +
        `*Nome:* ${data.full_name}\n` +
        `*Email:* ${data.email}\n` +
        `*Telefone:* ${data.phone}\n` +
        `*WhatsApp:* ${data.whatsapp}\n` +
        `*Tipo:* ${tipoMorador}\n` +
        `*Localização:* Bloco ${data.block} · Ed. ${data.building} · Apt. ${data.apartment}\n\n` +
        `Aceda ao painel de administração para aprovar ou rejeitar este pedido.`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=258842814557&text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, "_blank");

      setIsSubmitted(true);
      toast({
        title: "Pedido enviado!",
        description: "O seu pedido de acesso será analisado pela administração.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Pedido Enviado!</h2>
            <p className="text-muted-foreground">
              O seu pedido de acesso à Área do Morador foi enviado com sucesso. A administração irá analisar e entrar em contacto.
            </p>
            <Link to="/">
              <Button className="mt-4">Voltar ao Portal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Portal
          </Link>
          <h1 className="text-3xl font-bold">Pedido de Acesso</h1>
          <p className="text-primary-foreground/80 mt-1">Solicite acesso à Área do Morador</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Morador</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para solicitar acesso à área exclusiva do morador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bloco</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edifício</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Torre 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resident_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Morador</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="proprietario" id="proprietario" />
                            <Label htmlFor="proprietario">Proprietário</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="inquilino" id="inquilino" />
                            <Label htmlFor="inquilino">Inquilino</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto (Telefone)</FormLabel>
                      <FormControl>
                        <Input placeholder="+258 84 000 0000" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de WhatsApp *</FormLabel>
                      <FormControl>
                        <Input placeholder="+258 84 000 0000" type="tel" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        ⚠️ Importante: indique um número de WhatsApp activo. Será o canal usado pela administração para comunicações oficiais (avisos, taxas e notificações). Pode ser o mesmo número do contacto acima.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Pedido
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessRequestPage;
