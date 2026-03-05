
-- Recreate ALL missing triggers on registrations table

-- 1. Generate seat/registration number BEFORE INSERT
DROP TRIGGER IF EXISTS generate_seat_number_trigger ON public.registrations;
CREATE TRIGGER generate_seat_number_trigger
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- 2. Hall ticket generation + WhatsApp AFTER INSERT OR UPDATE
DROP TRIGGER IF EXISTS send_hall_ticket_on_reg_number_change ON public.registrations;
CREATE TRIGGER send_hall_ticket_on_reg_number_change
AFTER INSERT OR UPDATE OF registration_number ON public.registrations
FOR EACH ROW
WHEN (NEW.registration_number IS NOT NULL AND NEW.registration_number != '')
EXECUTE FUNCTION public.send_hall_ticket_whatsapp();

-- 3. Updated_at timestamp trigger
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Slot count trigger
DROP TRIGGER IF EXISTS update_slot_count_trigger ON public.registrations;
CREATE TRIGGER update_slot_count_trigger
AFTER INSERT OR UPDATE OF time_slot ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_count();

-- 5. Admin session activity trigger
DROP TRIGGER IF EXISTS update_admin_session_activity_trigger ON public.admin_sessions;
CREATE TRIGGER update_admin_session_activity_trigger
BEFORE UPDATE ON public.admin_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_session_activity();

-- 6. Admin users updated_at trigger
DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_users_updated_at();
