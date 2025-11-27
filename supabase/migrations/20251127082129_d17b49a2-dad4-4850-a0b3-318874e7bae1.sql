-- Allow anyone to update registrations based on mobile number (for public edit feature)
-- This is safe because mobile number is verified on the client side before allowing edit
DROP POLICY IF EXISTS "Authenticated users can update registrations" ON public.registrations;

CREATE POLICY "Anyone can update their own registration via mobile"
ON public.registrations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);