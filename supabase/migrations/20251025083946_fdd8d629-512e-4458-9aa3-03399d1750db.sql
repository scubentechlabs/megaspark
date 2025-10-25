-- 1) Ensure payment touch function handles both statuses
CREATE OR REPLACE FUNCTION public.touch_registration_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.registration_id IS NOT NULL AND NEW.status IN ('success','completed') THEN
    -- Touch the registration row to fire BEFORE UPDATE trigger
    UPDATE public.registrations
    SET updated_at = now()
    WHERE id = NEW.registration_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Create/replace trigger on registrations to generate seat number on insert/update
DROP TRIGGER IF EXISTS trg_generate_seat_number ON public.registrations;
CREATE TRIGGER trg_generate_seat_number
BEFORE INSERT OR UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- 3) Create/replace trigger on payments to touch registration when status or link changes
DROP TRIGGER IF EXISTS trg_touch_registration_on_payment ON public.payments;
CREATE TRIGGER trg_touch_registration_on_payment
AFTER INSERT OR UPDATE OF status, registration_id ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.touch_registration_on_payment();

-- 4) Backfill: touch qualifying registrations to generate missing seat numbers
UPDATE public.registrations r
SET updated_at = now()
WHERE (r.registration_number IS NULL OR r.registration_number = '')
  AND EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.registration_id = r.id
      AND p.status IN ('success','completed')
  );