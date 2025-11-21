-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;

-- Create new permissive SELECT policy
CREATE POLICY "Anyone can view registrations" 
ON public.registrations 
FOR SELECT 
USING (true);