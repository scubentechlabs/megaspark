
-- COMPLETE SECURITY LOCKDOWN

-- 1. Remove public SELECT from slot_settings
DROP POLICY IF EXISTS "Anyone can view slot settings" ON public.slot_settings;
CREATE POLICY "Admins and managers can view slot settings"
  ON public.slot_settings FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 2. Remove public SELECT from slot_date_settings
DROP POLICY IF EXISTS "Anyone can view slot date settings" ON public.slot_date_settings;
CREATE POLICY "Admins and managers can view slot date settings"
  ON public.slot_date_settings FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 3. SECURITY DEFINER functions for public slot data
CREATE OR REPLACE FUNCTION public.get_enabled_slot_settings()
RETURNS TABLE(id uuid, slot_name text, is_enabled boolean, max_capacity integer, current_count integer, reporting_time text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, slot_name, is_enabled, max_capacity, current_count, reporting_time
  FROM public.slot_settings WHERE is_enabled = true;
$$;

CREATE OR REPLACE FUNCTION public.get_enabled_slot_date_settings()
RETURNS TABLE(id uuid, exam_date date, slot_name text, is_enabled boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, exam_date, slot_name, is_enabled
  FROM public.slot_date_settings WHERE is_enabled = true;
$$;

-- 4. Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can insert own audit logs"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "No update audit logs"
  ON public.audit_log FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No delete audit logs"
  ON public.audit_log FOR DELETE TO authenticated USING (false);

-- 5. DELETE protection on slot_settings
CREATE POLICY "No delete slot settings"
  ON public.slot_settings FOR DELETE TO authenticated USING (false);

-- 6. DELETE protection on slot_date_settings
CREATE POLICY "No delete slot date settings"
  ON public.slot_date_settings FOR DELETE TO authenticated USING (false);

-- 7. DELETE protection on admin_sessions
CREATE POLICY "No delete admin sessions"
  ON public.admin_sessions FOR DELETE TO authenticated USING (false);
