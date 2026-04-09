
DROP POLICY IF EXISTS "Public can create registrations with valid data" ON public.registrations;

CREATE POLICY "Public can create registrations with valid data"
ON public.registrations
FOR INSERT
TO public
WITH CHECK (
  (student_name IS NOT NULL)
  AND (length(student_name) > 0)
  AND (length(student_name) <= 200)
  AND (mobile_number IS NOT NULL)
  AND (length(mobile_number) >= 10)
  AND (length(mobile_number) <= 15)
  AND (standard IS NOT NULL)
  AND (length(standard) <= 10)
  AND (exam_center IS NOT NULL)
  AND (length(exam_center) <= 100)
  AND (status IN ('pending', 'approved'))
);
