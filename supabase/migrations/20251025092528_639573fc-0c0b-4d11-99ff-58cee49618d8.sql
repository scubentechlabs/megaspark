-- Delete all registrations with blank or temporary registration numbers
DELETE FROM public.registrations 
WHERE registration_number IS NULL 
   OR registration_number = '' 
   OR registration_number LIKE 'SPARK%';