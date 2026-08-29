-- Create table for marketplace services
CREATE TABLE public.marketplace_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  full_description TEXT,
  hours TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved services
CREATE POLICY "Anyone can view approved services"
ON public.marketplace_services
FOR SELECT
USING (status = 'approved');

-- Admins can view all services
CREATE POLICY "Admins can view all services"
ON public.marketplace_services
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Anyone can insert service requests
CREATE POLICY "Anyone can insert service requests"
ON public.marketplace_services
FOR INSERT
WITH CHECK (true);

-- Admins can update all services
CREATE POLICY "Admins can update all services"
ON public.marketplace_services
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete services
CREATE POLICY "Admins can delete services"
ON public.marketplace_services
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Users can update their own pending services
CREATE POLICY "Users can update their own pending services"
ON public.marketplace_services
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_services_updated_at
BEFORE UPDATE ON public.marketplace_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();