
-- Add owner fields to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS owner_whatsapp text,
  ADD COLUMN IF NOT EXISTS owner_name text;

-- Allow authenticated users to insert their own properties (owner_id = auth.uid())
DROP POLICY IF EXISTS "Authenticated users can insert own properties" ON public.properties;
CREATE POLICY "Authenticated users can insert own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow owners to update their own properties
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow owners to delete their own properties
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow owners to view all their own properties (even inactive)
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
CREATE POLICY "Users can view their own properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Marketplace: allow owners to update their own approved services too (not just pending)
DROP POLICY IF EXISTS "Users can update their own pending services" ON public.marketplace_services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.marketplace_services;
CREATE POLICY "Users can update their own services"
  ON public.marketplace_services FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow owners to view their own services in any status
DROP POLICY IF EXISTS "Users can view their own services" ON public.marketplace_services;
CREATE POLICY "Users can view their own services"
  ON public.marketplace_services FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow owners to delete their own services
DROP POLICY IF EXISTS "Users can delete their own services" ON public.marketplace_services;
CREATE POLICY "Users can delete their own services"
  ON public.marketplace_services FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
