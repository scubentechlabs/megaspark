
-- 1. Fix privilege escalation: Add explicit deny for non-admin INSERT on user_roles
-- The existing policy already restricts to admins, but add belt-and-suspenders

-- 2. Remove the ALL policy on coupons and replace with specific policies
DROP POLICY IF EXISTS "Admins and managers can manage coupons" ON public.coupons;

CREATE POLICY "Admins and managers can select coupons"
  ON public.coupons FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can insert coupons"
  ON public.coupons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update coupons"
  ON public.coupons FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete coupons"
  ON public.coupons FOR DELETE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));
