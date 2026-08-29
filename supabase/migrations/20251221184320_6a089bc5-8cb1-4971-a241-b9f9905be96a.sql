-- Create table for common areas
CREATE TABLE public.common_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  rules TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for reservations
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES public.common_areas(id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(area_id, reservation_date, start_time)
);

-- Enable Row Level Security
ALTER TABLE public.common_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies for common_areas (public read)
CREATE POLICY "Anyone can view common areas" 
ON public.common_areas 
FOR SELECT 
USING (true);

-- Policies for reservations
CREATE POLICY "Users can view all reservations" 
ON public.reservations 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reservations" 
ON public.reservations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
ON public.reservations 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations" 
ON public.reservations 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default common areas
INSERT INTO public.common_areas (name, description, capacity, rules) VALUES
('Salão de Festas', 'Espaço amplo para eventos e celebrações com cozinha de apoio', 100, 'Reservar com 48h de antecedência. Horário: 8h-23h. Limpeza obrigatória após o uso.'),
('Churrasqueira', 'Área coberta com churrasqueira e mesas para confraternizações', 30, 'Reservar com 24h de antecedência. Horário: 10h-22h. Proibido som alto após 22h.'),
('Quadra Poliesportiva', 'Quadra para futebol, basquete e vôlei', 20, 'Horário: 6h-22h. Uso de calçado adequado obrigatório.'),
('Piscina', 'Piscina adulto e infantil com área de descanso', 50, 'Horário: 8h-20h. Uso de touca obrigatório. Menores de 12 anos devem estar acompanhados.'),
('Sala de Jogos', 'Sala com mesa de sinuca, ping pong e jogos de tabuleiro', 15, 'Horário: 9h-22h. Proibido consumo de alimentos.');