
CREATE TABLE IF NOT EXISTS public.institution_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  reference_year integer NOT NULL,
  reference_month integer NOT NULL,
  period_label text NOT NULL,
  descricao text NOT NULL DEFAULT 'Taxa de condomínio',
  taxa numeric NOT NULL DEFAULT 1000,
  n_apartamentos integer NOT NULL DEFAULT 0,
  valor numeric NOT NULL DEFAULT 0,
  valor_pago numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  payment_method text,
  receipt_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution, reference_year, reference_month)
);

CREATE INDEX IF NOT EXISTS idx_inst_fees_inst_year ON public.institution_fees (institution, reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_inst_fees_status ON public.institution_fees (status);

ALTER TABLE public.institution_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view institution fees"
  ON public.institution_fees FOR SELECT USING (true);

CREATE POLICY "Admins manage institution fees"
  ON public.institution_fees FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_inst_fees_updated
  BEFORE UPDATE ON public.institution_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.institution_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id uuid NOT NULL REFERENCES public.institution_fees(id) ON DELETE CASCADE,
  institution text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_pay_fee ON public.institution_payments (fee_id);
CREATE INDEX IF NOT EXISTS idx_inst_pay_inst ON public.institution_payments (institution, payment_date);

ALTER TABLE public.institution_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view institution payments"
  ON public.institution_payments FOR SELECT USING (true);

CREATE POLICY "Admins manage institution payments"
  ON public.institution_payments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
