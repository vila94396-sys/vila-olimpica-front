import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, Info, Check, X, Loader2, LogOut, Home, AlertTriangle } from "lucide-react";
import logoVilaOlimpica from "@/assets/logo-vila-olimpica.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { reservationsApi } from "@/lib/api";
import { clearLocalAuthSession } from "@/lib/localAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CommonArea {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rules: string;
}

interface Reservation {
  id: string;
  user_id: string;
  area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  common_areas?: CommonArea;
}

const timeSlots = [
  { value: "08:00", label: "08:00" },
  { value: "09:00", label: "09:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
  { value: "17:00", label: "17:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
  { value: "21:00", label: "21:00" },
  { value: "22:00", label: "22:00" },
];

const ReservationsPage = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("" );
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "my">("new");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAreas();
    fetchReservations(user.id);
  }, [authLoading, user, navigate]);

  const fetchAreas = async () => {
    try {
      const data = await reservationsApi.listAreas();
      setAreas(data || []);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchReservations = async (userId: string) => {
    try {
      const [allData, myData] = await Promise.all([
        reservationsApi.list(),
        reservationsApi.listMine(),
      ]);
      setReservations((allData || []).filter((r: any) => r.status === "confirmed"));
      setMyReservations(myData || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };


  const handleLogout = async () => {
    clearLocalAuthSession();
    window.location.replace("/auth");
  };

  const isTimeSlotAvailable = (date: Date, time: string) => {
    if (!selectedArea) return true;
    
    const dateStr = format(date, "yyyy-MM-dd");
    return !reservations.some(
      (r) => r.area_id === selectedArea && 
             r.reservation_date === dateStr && 
             r.start_time === time + ":00" &&
             r.status === "confirmed"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArea || !selectedDate || !startTime || !endTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Erro",
        description: "O horário de término deve ser após o horário de início.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reservationsApi.create({
        area_id: Number(selectedArea),
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        notes,
      });

      toast({
        title: "Reserva Confirmada!",
        description: "Sua reserva foi realizada com sucesso.",
      });
      setSelectedArea("");
      setSelectedDate(undefined);
      setStartTime("");
      setEndTime("");
      setNotes("");
      setAcceptedRules(false);
      if (user) fetchReservations(user.id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível realizar a reserva. Tente novamente.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await reservationsApi.updateStatus(Number(reservationId), "cancelled");
      toast({ title: "Reserva Cancelada", description: "Sua reserva foi cancelada com sucesso." });
      if (user) fetchReservations(user.id);
    } catch {
      toast({ title: "Erro", description: "Não foi possível cancelar a reserva. Tente novamente.", variant: "destructive" });
    }
  };

  const isLoading = authLoading;

  const selectedAreaData = areas.find((a) => a.id === selectedArea);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/area-morador" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar à Área do Morador
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Reservas</h1>
              <p className="text-primary-foreground/80">Reserve áreas comuns do condomínio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "new" ? "default" : "outline"}
            onClick={() => setActiveTab("new")}
          >
            Nova Reserva
          </Button>
          <Button
            variant={activeTab === "my" ? "default" : "outline"}
            onClick={() => setActiveTab("my")}
          >
            Minhas Reservas
          </Button>
        </div>

        {activeTab === "new" ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Reserva</CardTitle>
                  <CardDescription>
                    Selecione a área, data e horário desejados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Area Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Área Comum *
                      </label>
                      <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              <div className="flex items-center gap-2">
                                <span>{area.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  (Cap: {area.capacity})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Data *
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Início *
                        </label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem 
                                key={slot.value} 
                                value={slot.value}
                                disabled={selectedDate && !isTimeSlotAvailable(selectedDate, slot.value)}
                              >
                                {slot.label}
                                {selectedDate && !isTimeSlotAvailable(selectedDate, slot.value) && (
                                  <span className="text-destructive ml-2">(Ocupado)</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Término *
                        </label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem 
                                key={slot.value} 
                                value={slot.value}
                                disabled={startTime >= slot.value}
                              >
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Observações
                      </label>
                      <Textarea
                        placeholder="Informações adicionais sobre a reserva..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Regras do Termo de Uso */}
                    <div className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Termo de Uso de Espaços Comuns — Regras Obrigatórias
                      </h4>
                      <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                        <li><strong>Garantia de sanitários:</strong> Deve garantir e providenciar sanitários (casas de banho) para os participantes do evento.</li>
                        <li><strong>Responsabilidade eléctrica:</strong> A corrente eléctrica é da responsabilidade do requerente, porém deve interagir com a Administração para o efeito.</li>
                        <li><strong>Níveis de som:</strong> Deve respeitar os níveis máximos de som, de acordo com o Regulamento Interno do Condomínio e o horário de emissão do mesmo que vai até às 22h.</li>
                        <li><strong>Limpeza do local:</strong> Garantir a limpeza do local após o evento.</li>
                        <li><strong>Lista de convidados:</strong> Apresentar à Administração a lista de convidados que só terão acesso à entrada no Condomínio através desta.</li>
                        <li><strong>Responsabilidade por condutas:</strong> Será da responsabilidade do requerente qualquer conduta negativa que advier dos seus convidados, sob pena de ser notificado pela Administração para responder sobre.</li>
                      </ol>
                      <div className="flex items-start gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                        <Checkbox
                          id="accept-rules"
                          checked={acceptedRules}
                          onCheckedChange={(checked) => setAcceptedRules(checked === true)}
                        />
                        <label htmlFor="accept-rules" className="text-sm font-medium cursor-pointer leading-snug">
                          Li e aceito as regras do Termo de Uso de Espaços Comuns
                        </label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting || !acceptedRules}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Confirmar Reserva
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Area Info */}
            <div>
              {selectedAreaData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      {selectedAreaData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {selectedAreaData.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Capacidade: {selectedAreaData.capacity} pessoas</span>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Regras de Uso</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAreaData.rules}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma área para ver as informações e regras de uso.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Available Areas */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Áreas Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {areas.map((area) => (
                      <div
                        key={area.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          selectedArea === area.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setSelectedArea(area.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{area.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {area.capacity} pessoas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* My Reservations */
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Reservas</CardTitle>
                <CardDescription>
                  Visualize e gerencie suas reservas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Você ainda não possui reservas.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("new")}
                    >
                      Fazer Nova Reserva
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          reservation.status === "cancelled" 
                            ? "bg-muted/50 border-muted" 
                            : "border-border"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {reservation.common_areas?.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {format(new Date(reservation.reservation_date), "dd/MM/yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}
                              </span>
                            </div>
                            {reservation.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {reservation.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              reservation.status === "confirmed" 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : reservation.status === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            )}>
                              {reservation.status === "confirmed" ? "Confirmada" : 
                               reservation.status === "cancelled" ? "Cancelada" : "Pendente"}
                            </span>
                            {reservation.status === "confirmed" && 
                             new Date(reservation.reservation_date) >= new Date() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
