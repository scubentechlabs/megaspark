-- Make registration_number column have a default empty value so trigger can override it
-- This allows inserts without providing registration_number explicitly
ALTER TABLE public.registrations 
ALTER COLUMN registration_number SET DEFAULT '';