ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS divida_inicial numeric NOT NULL DEFAULT 0;
ALTER TABLE public.fpd_unidades ADD COLUMN IF NOT EXISTS divida_inicial numeric NOT NULL DEFAULT 0;