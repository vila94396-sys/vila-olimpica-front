-- Create table to track document downloads
CREATE TABLE public.document_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.document_downloads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert downloads (for tracking)
CREATE POLICY "Anyone can insert downloads"
ON public.document_downloads
FOR INSERT
WITH CHECK (true);

-- Admins can view all downloads
CREATE POLICY "Admins can view downloads"
ON public.document_downloads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_document_downloads_document_id ON public.document_downloads(document_id);
CREATE INDEX idx_document_downloads_downloaded_at ON public.document_downloads(downloaded_at);