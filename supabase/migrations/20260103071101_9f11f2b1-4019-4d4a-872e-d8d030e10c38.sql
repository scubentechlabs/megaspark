-- Create trigger to auto-generate registration number on status change to approved
CREATE TRIGGER trigger_generate_seat_number
BEFORE UPDATE ON public.registrations
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status))
EXECUTE FUNCTION public.generate_seat_number();