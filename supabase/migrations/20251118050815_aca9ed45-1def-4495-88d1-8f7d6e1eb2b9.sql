-- Add time_slot column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS time_slot text;

-- Add comment to explain the column
COMMENT ON COLUMN public.registrations.time_slot IS 'Time slot for the exam: morning or afternoon';

-- Create slot_settings table to control slot availability
CREATE TABLE IF NOT EXISTS public.slot_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_name text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  max_capacity integer NOT NULL DEFAULT 6500,
  current_count integer NOT NULL DEFAULT 0,
  reporting_time text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on slot_settings
ALTER TABLE public.slot_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for slot_settings
CREATE POLICY "Anyone can view slot settings" 
ON public.slot_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can update slot settings" 
ON public.slot_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert slot settings" 
ON public.slot_settings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default slot settings
INSERT INTO public.slot_settings (slot_name, is_enabled, max_capacity, current_count, reporting_time)
VALUES 
  ('morning', true, 6500, 0, '8:00 AM'),
  ('afternoon', true, 6500, 0, '2:30 PM')
ON CONFLICT (slot_name) DO NOTHING;

-- Create trigger to update slot_settings updated_at
CREATE TRIGGER update_slot_settings_updated_at
BEFORE UPDATE ON public.slot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update slot count when registration is added/updated
CREATE OR REPLACE FUNCTION public.update_slot_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Decrease count for old slot if updating
  IF TG_OP = 'UPDATE' AND OLD.time_slot IS NOT NULL AND OLD.time_slot != NEW.time_slot THEN
    UPDATE public.slot_settings
    SET current_count = GREATEST(current_count - 1, 0)
    WHERE slot_name = OLD.time_slot;
  END IF;
  
  -- Increase count for new slot
  IF NEW.time_slot IS NOT NULL THEN
    UPDATE public.slot_settings
    SET current_count = current_count + 1
    WHERE slot_name = NEW.time_slot;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to update slot count
DROP TRIGGER IF EXISTS update_slot_count_trigger ON public.registrations;
CREATE TRIGGER update_slot_count_trigger
AFTER INSERT OR UPDATE OF time_slot ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_count();