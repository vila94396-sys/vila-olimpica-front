-- Adicionar campos de dívida histórica anterior ao sistema
ALTER TABLE public.unidades
  ADD COLUMN IF NOT EXISTS divida_anterior numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pagamentos_historicos numeric NOT NULL DEFAULT 0;

ALTER TABLE public.fpd_unidades
  ADD COLUMN IF NOT EXISTS divida_anterior numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pagamentos_historicos numeric NOT NULL DEFAULT 0;

-- Inicializar a partir do divida_inicial existente (sem perder os valores actuais já importados)
UPDATE public.unidades SET divida_anterior = divida_inicial WHERE divida_anterior = 0 AND divida_inicial > 0;
UPDATE public.fpd_unidades SET divida_anterior = divida_inicial WHERE divida_anterior = 0 AND divida_inicial > 0;