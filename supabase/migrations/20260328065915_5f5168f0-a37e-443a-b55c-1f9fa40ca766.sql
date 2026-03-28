
-- Replace overly permissive INSERT policies with validated ones

-- 1. Registrations: require essential fields
DROP POLICY IF EXISTS "Anyone can create registrations" ON public.registrations;
CREATE POLICY "Public can create registrations with valid data"
  ON public.registrations FOR INSERT TO public
  WITH CHECK (
    student_name IS NOT NULL AND length(student_name) > 0 AND length(student_name) <= 200
    AND mobile_number IS NOT NULL AND length(mobile_number) >= 10 AND length(mobile_number) <= 15
    AND standard IS NOT NULL AND length(standard) <= 10
    AND exam_center IS NOT NULL AND length(exam_center) <= 100
    AND status = 'pending'
  );

-- 2. Payments: require essential fields and valid status
DROP POLICY IF EXISTS "Anyone can create payments" ON public.payments;
CREATE POLICY "Public can create payments with valid data"
  ON public.payments FOR INSERT TO public
  WITH CHECK (
    student_name IS NOT NULL AND length(student_name) > 0 AND length(student_name) <= 200
    AND amount > 0 AND amount <= 100000
    AND payment_type IS NOT NULL AND length(payment_type) <= 50
    AND status = 'pending'
  );

-- 3. Newsletter: require valid email
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT TO public
  WITH CHECK (
    email IS NOT NULL AND length(email) >= 5 AND length(email) <= 254
    AND email LIKE '%@%.%'
  );
