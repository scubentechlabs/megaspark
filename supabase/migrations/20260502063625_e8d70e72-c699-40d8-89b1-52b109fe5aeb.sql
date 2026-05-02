-- Create standards table for admin-managed class/standard list
CREATE TABLE IF NOT EXISTS public.standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.standards ENABLE ROW LEVEL SECURITY;

-- Public can read active standards
CREATE POLICY "Anyone can view active standards"
ON public.standards FOR SELECT
USING (is_active = true);

-- Admins/managers can view all
CREATE POLICY "Admins can view all standards"
ON public.standards FOR SELECT
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can insert standards"
ON public.standards FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update standards"
ON public.standards FOR UPDATE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete standards"
ON public.standards FOR DELETE
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_standards_updated_at
BEFORE UPDATE ON public.standards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default standards 5-12
INSERT INTO public.standards (value, label, display_order, is_active) VALUES
  ('5', 'Standard 5', 5, true),
  ('6', 'Standard 6', 6, true),
  ('7', 'Standard 7', 7, true),
  ('8', 'Standard 8', 8, true),
  ('9', 'Standard 9', 9, true),
  ('10', 'Standard 10', 10, true),
  ('11', 'Standard 11', 11, true),
  ('12', 'Standard 12', 12, true)
ON CONFLICT (value) DO NOTHING;