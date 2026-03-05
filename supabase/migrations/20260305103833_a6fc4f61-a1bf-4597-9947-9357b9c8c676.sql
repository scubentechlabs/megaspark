
-- Drop the UPDATE-only trigger
DROP TRIGGER IF EXISTS send_hall_ticket_on_reg_number_change ON public.registrations;

-- Create trigger that fires on BOTH INSERT and UPDATE
CREATE TRIGGER send_hall_ticket_on_reg_number_change
AFTER INSERT OR UPDATE OF registration_number ON public.registrations
FOR EACH ROW
WHEN (NEW.registration_number IS NOT NULL AND NEW.registration_number != '')
EXECUTE FUNCTION send_hall_ticket_whatsapp();
