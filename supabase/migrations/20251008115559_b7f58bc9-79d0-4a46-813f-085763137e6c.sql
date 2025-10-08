-- Add state column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN state text;

-- Remove city_village column from registrations table
ALTER TABLE public.registrations 
DROP COLUMN city_village;