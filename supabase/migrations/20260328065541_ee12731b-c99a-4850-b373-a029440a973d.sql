
-- Create a security definer function to check maintenance mode publicly
CREATE OR REPLACE FUNCTION public.get_maintenance_mode()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(maintenance_mode, false) FROM public.settings LIMIT 1;
$$;
