-- Remove the unique constraint on mobile_number to allow multiple registrations
ALTER TABLE public.registrations 
DROP CONSTRAINT IF EXISTS unique_mobile_number;