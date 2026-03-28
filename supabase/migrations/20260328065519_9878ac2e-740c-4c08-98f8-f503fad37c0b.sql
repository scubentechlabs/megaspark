
-- 1. Remove public coupon SELECT policy (coupons now validated server-side only)
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;

-- 2. Restrict settings to admin-only read (contact info is sensitive)
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Only admins and managers can view settings"
  ON public.settings FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 3. Add DELETE restriction policies explicitly (belt-and-suspenders)
-- Registrations: no delete for anyone
CREATE POLICY "No one can delete registrations"
  ON public.registrations FOR DELETE TO authenticated
  USING (false);

-- Payments: no delete for anyone  
CREATE POLICY "No one can delete payments"
  ON public.payments FOR DELETE TO authenticated
  USING (false);

-- 4. Restrict whatsapp_messages INSERT to service role only (edge functions use service role)
DROP POLICY IF EXISTS "Admins and managers can insert whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Service role inserts whatsapp messages"
  ON public.whatsapp_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
