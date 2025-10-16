-- Create triggers to generate registration numbers and keep timestamps in sync
-- 1) BEFORE INSERT/UPDATE on registrations -> generate_seat_number()
-- 2) AFTER INSERT/UPDATE on payments -> touch_registration_on_payment()
-- 3) BEFORE UPDATE updated_at triggers for both tables
-- 4) Backfill: trigger number generation for existing paid registrations missing a number

-- Safety: create function for updated_at if missing (already exists per context)
-- Create or replace triggers
DO $$
BEGIN
  -- registrations: updated_at trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_registrations_updated_at'
  ) THEN
    CREATE TRIGGER set_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- payments: updated_at trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_payments_updated_at'
  ) THEN
    CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- registrations: seat number generation
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generate_seat_number') THEN
    DROP TRIGGER trg_generate_seat_number ON public.registrations;
  END IF;
  CREATE TRIGGER trg_generate_seat_number
  BEFORE INSERT OR UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.generate_seat_number();

  -- payments: touch registration when payment succeeds or link added
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_touch_registration_on_payment') THEN
    DROP TRIGGER trg_touch_registration_on_payment ON public.payments;
  END IF;
  CREATE TRIGGER trg_touch_registration_on_payment
  AFTER INSERT OR UPDATE OF status, registration_id ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_registration_on_payment();
END $$;

-- Backfill: For registrations linked to a successful payment but missing number, force an update
UPDATE public.registrations r
SET updated_at = now()
WHERE r.registration_number IS NULL
  AND EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.registration_id = r.id
      AND p.status = 'success'
  );