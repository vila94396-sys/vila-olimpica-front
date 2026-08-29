-- Create storage bucket for archive documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('archive-documents', 'archive-documents', true);

-- Allow anyone to view archive documents
CREATE POLICY "Anyone can view archive documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'archive-documents');

-- Allow admins to upload archive documents
CREATE POLICY "Admins can upload archive documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'archive-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update archive documents
CREATE POLICY "Admins can update archive documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'archive-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete archive documents
CREATE POLICY "Admins can delete archive documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'archive-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Anyone can view documents
CREATE POLICY "Anyone can view documents"
ON public.documents
FOR SELECT
USING (true);

-- Admins can manage documents
CREATE POLICY "Admins can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update documents"
ON public.documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();