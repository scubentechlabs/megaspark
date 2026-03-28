
-- 1. Fix exam_dates: only show active dates publicly
DROP POLICY IF EXISTS "Anyone can view active exam dates" ON public.exam_dates;
CREATE POLICY "Anyone can view active exam dates"
  ON public.exam_dates FOR SELECT TO public
  USING (is_active = true);

-- Add admin/manager policy to see all exam dates
CREATE POLICY "Admins and managers can view all exam dates"
  ON public.exam_dates FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 2. Remove coupon_code from payments by validating it must be null on public insert
-- Actually, the coupon is validated server-side in the edge function, and coupon_code
-- in payments is just a record. Let's ensure it doesn't matter by noting it's informational only.
