-- Create settings table to store exam configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_name TEXT NOT NULL DEFAULT 'MEGA SPARK EXAM 2025',
  organization_name TEXT NOT NULL DEFAULT 'P.R. SAVANI',
  contact_email TEXT NOT NULL DEFAULT 'info@megaspark.com',
  contact_phone TEXT NOT NULL DEFAULT '+91 1234567890',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view settings"
  ON public.settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON public.settings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp_settings ON public.settings;
CREATE TRIGGER set_timestamp_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO public.settings (exam_name, organization_name, contact_email, contact_phone)
SELECT 'MEGA SPARK EXAM 2025', 'P.R. SAVANI', 'info@megaspark.com', '+91 1234567890'
WHERE NOT EXISTS (SELECT 1 FROM public.settings LIMIT 1);