
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  block TEXT NOT NULL,
  building TEXT NOT NULL,
  apartment TEXT NOT NULL,
  resident_type TEXT NOT NULL CHECK (resident_type IN ('proprietario', 'inquilino')),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit access requests"
ON public.access_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all access requests"
ON public.access_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update access requests"
ON public.access_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete access requests"
ON public.access_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
