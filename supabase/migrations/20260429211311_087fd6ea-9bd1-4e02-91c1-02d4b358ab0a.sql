
-- Performance indexes for fees tables
CREATE INDEX IF NOT EXISTS idx_condominium_fees_year ON public.condominium_fees(reference_year);
CREATE INDEX IF NOT EXISTS idx_condominium_fees_year_month ON public.condominium_fees(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_condominium_fees_unidade ON public.condominium_fees(unidade_id);
CREATE INDEX IF NOT EXISTS idx_condominium_fees_user ON public.condominium_fees(user_id);
CREATE INDEX IF NOT EXISTS idx_condominium_fees_status ON public.condominium_fees(status);

CREATE INDEX IF NOT EXISTS idx_fpd_fees_year ON public.fpd_fees(reference_year);
CREATE INDEX IF NOT EXISTS idx_fpd_fees_year_month ON public.fpd_fees(reference_year, reference_month);
CREATE INDEX IF NOT EXISTS idx_fpd_fees_unidade ON public.fpd_fees(unidade_id);
CREATE INDEX IF NOT EXISTS idx_fpd_fees_status ON public.fpd_fees(status);

CREATE INDEX IF NOT EXISTS idx_unidades_categoria ON public.unidades(categoria);
CREATE INDEX IF NOT EXISTS idx_unidades_ord ON public.unidades(ord);
CREATE INDEX IF NOT EXISTS idx_fpd_unidades_ord ON public.fpd_unidades(ord);
