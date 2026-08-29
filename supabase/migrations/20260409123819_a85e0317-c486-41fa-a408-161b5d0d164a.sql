
-- Create unidades table
CREATE TABLE public.unidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ord SERIAL,
  bloco INTEGER NOT NULL DEFAULT 1,
  edificio INTEGER NOT NULL DEFAULT 1,
  apartamento INTEGER NOT NULL DEFAULT 1,
  nome TEXT NOT NULL,
  contacto TEXT NOT NULL DEFAULT '',
  via TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage unidades" ON public.unidades
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view unidades" ON public.unidades
  FOR SELECT USING (true);

-- Add valor_pago and unidade_id to condominium_fees
ALTER TABLE public.condominium_fees
  ADD COLUMN IF NOT EXISTS valor_pago NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE;

-- Trigger for updated_at on unidades
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON public.unidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
