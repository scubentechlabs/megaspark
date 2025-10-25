-- First, let's link existing payments to their registrations based on matching data
UPDATE payments p
SET registration_id = r.id
FROM registrations r
WHERE p.registration_id IS NULL
  AND p.student_name = r.student_name
  AND p.status = 'completed';

-- Now force trigger the registration number generation for all registrations with successful payments
UPDATE registrations r
SET updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM payments p 
  WHERE p.registration_id = r.id 
  AND p.status = 'completed'
)
AND (r.registration_number IS NULL OR r.registration_number = '');