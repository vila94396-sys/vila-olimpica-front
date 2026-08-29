ALTER TABLE public.access_requests
ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS access_requests_email_unique
ON public.access_requests (lower(email));