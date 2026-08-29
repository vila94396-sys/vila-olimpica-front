-- Add new columns for apartment details
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS block TEXT,
ADD COLUMN IF NOT EXISTS building TEXT,
ADD COLUMN IF NOT EXISTS apartment_number TEXT;

-- Update default property type to apartment
ALTER TABLE public.properties
ALTER COLUMN property_type SET DEFAULT 'apartment';