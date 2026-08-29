-- Add folder column to documents table
ALTER TABLE public.documents 
ADD COLUMN folder TEXT DEFAULT 'Geral';

-- Add year column for organizing by year
ALTER TABLE public.documents 
ADD COLUMN year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);