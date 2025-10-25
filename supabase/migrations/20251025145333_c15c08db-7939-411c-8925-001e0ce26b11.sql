-- Update all registrations with successful payments that don't have registration numbers
UPDATE public.registrations r
SET updated_at = now()
WHERE r.registration_number IS NULL OR r.registration_number = '' OR r.registration_number LIKE 'SPARK%'
AND EXISTS (
  SELECT 1 FROM public.payments p
  WHERE p.registration_id = r.id
  AND p.status IN ('success', 'completed')
);