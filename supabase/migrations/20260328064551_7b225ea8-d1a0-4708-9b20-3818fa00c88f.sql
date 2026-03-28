
-- 1. Remove overly permissive public SELECT on registrations and replace with restricted version
-- The hall ticket lookup page needs to query by mobile number, so we use a function
DROP POLICY IF EXISTS "Public can view own registration by mobile" ON public.registrations;

-- Create a security definer function for mobile lookup
CREATE OR REPLACE FUNCTION public.get_registrations_by_mobile(_mobile text)
RETURNS SETOF public.registrations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.registrations WHERE mobile_number = _mobile;
$$;

-- 2. Fix admin_sessions SELECT to restrict to admins/managers or own sessions
DROP POLICY IF EXISTS "Authenticated users can view admin sessions" ON public.admin_sessions;
CREATE POLICY "Admins can view all sessions, users own sessions"
  ON public.admin_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_or_manager(auth.uid()));

-- 3. Fix coupons: restrict management to admins/managers
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;
CREATE POLICY "Admins and managers can manage coupons"
  ON public.coupons FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
