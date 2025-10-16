-- 1) Ensure registration number generation runs on inserts/updates of registrations
DROP TRIGGER IF EXISTS trg_generate_registration_number ON public.registrations;
CREATE TRIGGER trg_generate_registration_number
BEFORE INSERT OR UPDATE OF exam_date, medium, standard, registration_number
ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- 2) Helper function: when a payment becomes success, "touch" the related registration
--    to invoke the trigger above and generate the registration number
CREATE OR REPLACE FUNCTION public.touch_registration_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.registration_id IS NOT NULL AND NEW.status = 'success' THEN
    -- Touch the registration row to fire BEFORE UPDATE trigger
    UPDATE public.registrations
    SET updated_at = now()
    WHERE id = NEW.registration_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 3) Trigger on payments to call the helper on insert/update
DROP TRIGGER IF EXISTS trg_touch_registration_on_payment ON public.payments;
CREATE TRIGGER trg_touch_registration_on_payment
AFTER INSERT OR UPDATE OF status, registration_id
ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.touch_registration_on_payment();

-- 4) Keep updated_at fresh on updates (uses existing helper)
DROP TRIGGER IF EXISTS trg_update_registrations_updated_at ON public.registrations;
CREATE TRIGGER trg_update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_payments_updated_at ON public.payments;
CREATE TRIGGER trg_update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Backfill: generate registration numbers for already-paid registrations missing one
UPDATE public.registrations r
SET registration_number = r.registration_number
WHERE r.registration_number IS NULL
AND EXISTS (
  SELECT 1 FROM public.payments p
  WHERE p.registration_id = r.id AND p.status = 'success'
);
