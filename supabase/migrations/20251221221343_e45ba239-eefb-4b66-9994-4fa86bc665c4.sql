-- Create condominium fees table for payment tracking
CREATE TABLE public.condominium_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference_month TEXT NOT NULL,
  reference_year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.condominium_fees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own fees" 
ON public.condominium_fees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fees" 
ON public.condominium_fees 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert fees" 
ON public.condominium_fees 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fees" 
ON public.condominium_fees 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fees" 
ON public.condominium_fees 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_condominium_fees_updated_at
BEFORE UPDATE ON public.condominium_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();