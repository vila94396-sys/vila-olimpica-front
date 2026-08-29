
-- Add categoria column to unidades table
ALTER TABLE public.unidades 
ADD COLUMN categoria text NOT NULL DEFAULT 'quitadas';

-- Add a comment for documentation
COMMENT ON COLUMN public.unidades.categoria IS 'Category: quitadas, 1fase_cedsif, 1fase_nedbank, 2fase_nedbank';
