-- Drop ALL duplicate send_hall_ticket_whatsapp triggers (keep only one clean one)
DROP TRIGGER IF EXISTS send_hall_ticket_on_registration ON public.registrations;
DROP TRIGGER IF EXISTS send_hall_ticket_whatsapp_trigger ON public.registrations;
DROP TRIGGER IF EXISTS send_whatsapp_after_registration ON public.registrations;

-- Drop ALL duplicate generate_seat_number triggers (keep only the properly scoped one)
DROP TRIGGER IF EXISTS generate_registration_number_trigger ON public.registrations;
DROP TRIGGER IF EXISTS generate_seat_number_on_insert ON public.registrations;
DROP TRIGGER IF EXISTS generate_seat_number_on_update ON public.registrations;
DROP TRIGGER IF EXISTS generate_seat_number_trigger ON public.registrations;
DROP TRIGGER IF EXISTS trg_generate_seat_number ON public.registrations;
DROP TRIGGER IF EXISTS trigger_generate_seat_number ON public.registrations;

-- Keep only trg_generate_registration_number (properly scoped to specific columns)
-- It already exists: BEFORE INSERT OR UPDATE OF exam_date, medium, standard, registration_number

-- Drop duplicate updated_at triggers (keep only one)
DROP TRIGGER IF EXISTS set_registrations_updated_at ON public.registrations;
DROP TRIGGER IF EXISTS set_timestamp_registrations ON public.registrations;
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
-- Keep trg_update_registrations_updated_at

-- Now create ONE clean WhatsApp trigger that only fires on registration_number changes
CREATE TRIGGER send_hall_ticket_on_reg_number_change
AFTER UPDATE OF registration_number ON public.registrations
FOR EACH ROW
WHEN (NEW.registration_number IS NOT NULL AND NEW.registration_number != '' 
  AND (OLD.registration_number IS NULL OR OLD.registration_number = '' OR OLD.registration_number IS DISTINCT FROM NEW.registration_number))
EXECUTE FUNCTION send_hall_ticket_whatsapp();