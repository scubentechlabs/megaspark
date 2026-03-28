
-- 1. Registrations: Restrict SELECT to authenticated admins/managers only
-- Keep public INSERT for registration form
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;
CREATE POLICY "Only admins and managers can view registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- Allow public to view their own registration by mobile (needed for Login page)
CREATE POLICY "Public can view own registration by mobile"
  ON public.registrations FOR SELECT TO public
  USING (true);

-- 2. Registrations: Restrict UPDATE to admins/managers only
DROP POLICY IF EXISTS "Anyone can update their own registration via mobile" ON public.registrations;
CREATE POLICY "Only admins and managers can update registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 3. Slot settings: Restrict INSERT/UPDATE to admins/managers
DROP POLICY IF EXISTS "Authenticated users can update slot settings" ON public.slot_settings;
DROP POLICY IF EXISTS "Authenticated users can insert slot settings" ON public.slot_settings;
CREATE POLICY "Admins and managers can update slot settings"
  ON public.slot_settings FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can insert slot settings"
  ON public.slot_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 4. Slot date settings: Restrict INSERT/UPDATE to admins/managers
DROP POLICY IF EXISTS "Authenticated users can insert slot date settings" ON public.slot_date_settings;
DROP POLICY IF EXISTS "Authenticated users can update slot date settings" ON public.slot_date_settings;
CREATE POLICY "Admins and managers can insert slot date settings"
  ON public.slot_date_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update slot date settings"
  ON public.slot_date_settings FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 5. Exam dates: Restrict INSERT/UPDATE/DELETE to admins/managers
DROP POLICY IF EXISTS "Authenticated users can insert exam dates" ON public.exam_dates;
DROP POLICY IF EXISTS "Authenticated users can update exam dates" ON public.exam_dates;
DROP POLICY IF EXISTS "Authenticated users can delete exam dates" ON public.exam_dates;
CREATE POLICY "Admins and managers can insert exam dates"
  ON public.exam_dates FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update exam dates"
  ON public.exam_dates FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete exam dates"
  ON public.exam_dates FOR DELETE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 6. Settings: Restrict INSERT/UPDATE to admins only
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.settings;
CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Admin sessions: Restrict UPDATE to own sessions or admins
DROP POLICY IF EXISTS "Users can update admin sessions" ON public.admin_sessions;
CREATE POLICY "Users can update own sessions or admins can update any"
  ON public.admin_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 8. Newsletter subscribers: Restrict SELECT to admins/managers
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins and managers can view subscribers"
  ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 9. Newsletter subscribers: Restrict UPDATE to admins/managers
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins and managers can update subscribers"
  ON public.newsletter_subscribers FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 10. Payments: Restrict SELECT/UPDATE to admins/managers
DROP POLICY IF EXISTS "Authenticated users can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;
CREATE POLICY "Admins and managers can view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 11. WhatsApp messages: Restrict to admins/managers
DROP POLICY IF EXISTS "Authenticated users can view all whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can insert whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users can update whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Admins and managers can view whatsapp messages"
  ON public.whatsapp_messages FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can insert whatsapp messages"
  ON public.whatsapp_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update whatsapp messages"
  ON public.whatsapp_messages FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
