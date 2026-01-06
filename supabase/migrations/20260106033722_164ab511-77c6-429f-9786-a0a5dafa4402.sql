-- Remove the unique constraint on registration_number
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_registration_number_unique;

-- Also change the default from empty string to NULL (NULL values don't violate unique constraints)
ALTER TABLE public.registrations ALTER COLUMN registration_number SET DEFAULT NULL;