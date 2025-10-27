-- 1) Create trigger on registrations to generate registration_number on insert/update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generate_seat_number'
  ) THEN
    CREATE TRIGGER trg_generate_seat_number
    BEFORE INSERT OR UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_seat_number();
  END IF;
END $$;

-- 2) Create trigger on payments to "touch" the related registration when a payment is inserted/updated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_touch_registration_on_payment'
  ) THEN
    CREATE TRIGGER trg_touch_registration_on_payment
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_registration_on_payment();
  END IF;
END $$;

-- 3) Backfill: Touch registrations that have successful/completed payments but missing/placeholder registration numbers
UPDATE public.registrations r
SET updated_at = now()
WHERE (
  r.registration_number IS NULL
  OR r.registration_number = ''
  OR r.registration_number LIKE 'SPARK%'
)
AND EXISTS (
  SELECT 1 FROM public.payments p
  WHERE p.registration_id = r.id
    AND p.status IN ('success', 'completed')
);
