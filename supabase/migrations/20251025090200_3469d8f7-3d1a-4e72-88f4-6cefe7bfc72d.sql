-- Ensure triggers exist to generate registration numbers and keep timestamps up to date

-- 1) Trigger on registrations to generate seat/registration number on INSERT/UPDATE
DROP TRIGGER IF EXISTS trg_generate_seat_number ON public.registrations;
CREATE TRIGGER trg_generate_seat_number
BEFORE INSERT OR UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- 2) Trigger on payments to "touch" related registration rows when a successful payment is inserted/updated
DROP TRIGGER IF EXISTS trg_touch_registration_on_payment ON public.payments;
CREATE TRIGGER trg_touch_registration_on_payment
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.touch_registration_on_payment();

-- 3) Keep updated_at in sync for both tables
DROP TRIGGER IF EXISTS set_timestamp_registrations ON public.registrations;
CREATE TRIGGER set_timestamp_registrations
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_payments ON public.payments;
CREATE TRIGGER set_timestamp_payments
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Backfill: touch registrations that have a successful/completed payment but no proper registration number yet
UPDATE public.registrations r
SET updated_at = now()
WHERE (r.registration_number IS NULL OR r.registration_number = '' OR r.registration_number LIKE 'SPARK%')
AND EXISTS (
  SELECT 1 FROM public.payments p
  WHERE p.registration_id = r.id AND p.status IN ('success','completed')
);
