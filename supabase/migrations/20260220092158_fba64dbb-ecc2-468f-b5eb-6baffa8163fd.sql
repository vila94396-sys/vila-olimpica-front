-- Fix: Restrict reservations SELECT to own reservations only (plus admin)
DROP POLICY IF EXISTS "Users can view all reservations" ON public.reservations;

CREATE POLICY "Users can view their own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
