
-- Remove duplicate triggers that cause multiple hall ticket generations and WhatsApp spam

-- Drop duplicate BEFORE INSERT trigger (keep generate_seat_number_trigger, drop trg_generate_registration_number)
DROP TRIGGER IF EXISTS trg_generate_registration_number ON public.registrations;

-- Drop duplicate BEFORE UPDATE trigger (keep update_registrations_updated_at, drop trg_update_registrations_updated_at)
DROP TRIGGER IF EXISTS trg_update_registrations_updated_at ON public.registrations;
