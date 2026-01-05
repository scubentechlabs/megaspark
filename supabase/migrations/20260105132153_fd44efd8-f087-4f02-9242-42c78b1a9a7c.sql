-- Add unique constraint on mobile_number to prevent duplicate registrations
ALTER TABLE public.registrations ADD CONSTRAINT registrations_mobile_number_unique UNIQUE (mobile_number);