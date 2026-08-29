
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.fpd_unidades ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_unidades_user_id ON public.unidades(user_id);
CREATE INDEX IF NOT EXISTS idx_fpd_unidades_user_id ON public.fpd_unidades(user_id);
CREATE INDEX IF NOT EXISTS idx_unidades_loc ON public.unidades(bloco, edificio, apartamento);
