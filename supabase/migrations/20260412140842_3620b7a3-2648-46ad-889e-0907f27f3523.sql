
-- FDP Unidades table
CREATE TABLE public.fpd_unidades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ord integer NOT NULL DEFAULT 1,
  apartamento integer NOT NULL DEFAULT 1,
  nome text NOT NULL,
  contacto text NOT NULL DEFAULT '',
  taxa numeric NOT NULL DEFAULT 1000,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fpd_unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fpd_unidades" ON public.fpd_unidades FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view fpd_unidades" ON public.fpd_unidades FOR SELECT TO public
  USING (true);

-- FDP Fees table
CREATE TABLE public.fpd_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unidade_id uuid NOT NULL REFERENCES public.fpd_unidades(id) ON DELETE CASCADE,
  reference_month text NOT NULL,
  reference_year integer NOT NULL,
  amount numeric NOT NULL DEFAULT 1000,
  valor_pago numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  payment_method text,
  receipt_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fpd_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fpd_fees" ON public.fpd_fees FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view fpd_fees" ON public.fpd_fees FOR SELECT TO public
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_fpd_unidades_updated_at
  BEFORE UPDATE ON public.fpd_unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fpd_fees_updated_at
  BEFORE UPDATE ON public.fpd_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
