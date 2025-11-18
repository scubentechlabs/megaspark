-- Create table for date-specific slot overrides
CREATE TABLE IF NOT EXISTS public.slot_date_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_date DATE NOT NULL,
  slot_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exam_date, slot_name)
);

-- Enable Row Level Security
ALTER TABLE public.slot_date_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view slot date settings" 
ON public.slot_date_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert slot date settings" 
ON public.slot_date_settings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update slot date settings" 
ON public.slot_date_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_slot_date_settings_updated_at
BEFORE UPDATE ON public.slot_date_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();