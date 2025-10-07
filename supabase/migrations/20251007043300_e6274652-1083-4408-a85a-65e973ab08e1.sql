-- Add UPDATE policy for registrations table so authenticated admins can update room details
CREATE POLICY "Authenticated users can update registrations"
ON public.registrations
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);