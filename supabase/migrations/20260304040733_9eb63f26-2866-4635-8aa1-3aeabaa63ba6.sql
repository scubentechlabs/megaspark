
-- Fix generate_seat_number to work on INSERT (pending status) too
CREATE OR REPLACE FUNCTION public.generate_seat_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  date_prefix text;
  standard_code text;
  next_sequence integer;
  new_seat_number text;
  max_seat text;
  clean_standard text;
  effective_medium text;
BEGIN
  -- Only skip if status is explicitly something other than pending/approved
  -- For INSERT, always generate. For UPDATE, only if status is approved or registration_number is null
  IF TG_OP = 'UPDATE' AND NEW.status != 'approved' AND NEW.registration_number IS NOT NULL AND NEW.registration_number != '' THEN
    RETURN NEW;
  END IF;
  
  IF NEW.registration_number IS NOT NULL AND NEW.registration_number != '' THEN
    RETURN NEW;
  END IF;
  
  effective_medium := COALESCE(NEW.medium, NEW.school_medium);
  
  IF effective_medium IS NULL OR effective_medium = '' THEN
    NEW.registration_number := NULL;
    RETURN NEW;
  END IF;
  
  clean_standard := regexp_replace(LOWER(NEW.standard), '(st|nd|rd|th)', '', 'g');
  clean_standard := trim(clean_standard);
  
  IF NEW.exam_date IS NULL THEN
    date_prefix := to_char(CURRENT_DATE, 'DD');
  ELSE
    date_prefix := to_char(NEW.exam_date, 'DD');
  END IF;
  
  IF LOWER(effective_medium) = 'english' THEN
    standard_code := CASE clean_standard
      WHEN '5' THEN '51'
      WHEN '6' THEN '61'
      WHEN '7' THEN '71'
      WHEN '8' THEN '81'
      WHEN '9' THEN '91'
      WHEN '10' THEN '11'
      ELSE '00'
    END;
  ELSIF LOWER(effective_medium) = 'gujarati' THEN
    standard_code := CASE clean_standard
      WHEN '5' THEN '52'
      WHEN '6' THEN '62'
      WHEN '7' THEN '72'
      WHEN '8' THEN '82'
      WHEN '9' THEN '92'
      WHEN '10' THEN '12'
      ELSE '00'
    END;
  ELSE
    NEW.registration_number := NULL;
    RETURN NEW;
  END IF;
  
  SELECT MAX(registration_number) INTO max_seat
  FROM public.registrations
  WHERE registration_number LIKE date_prefix || standard_code || '%'
    AND LOWER(COALESCE(medium, school_medium)) = LOWER(effective_medium)
    AND registration_number ~ '^[0-9]+$';
  
  IF max_seat IS NULL THEN
    next_sequence := 1;
  ELSE
    next_sequence := CAST(substring(max_seat from 5) AS integer) + 1;
  END IF;
  
  new_seat_number := date_prefix || standard_code || lpad(next_sequence::text, 4, '0');
  
  NEW.registration_number := new_seat_number;
  IF NEW.medium IS NULL AND NEW.school_medium IS NOT NULL THEN
    NEW.medium := NEW.school_medium;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create all missing triggers on registrations table
DROP TRIGGER IF EXISTS generate_registration_number_trigger ON public.registrations;
CREATE TRIGGER generate_registration_number_trigger
  BEFORE INSERT OR UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_seat_number();

DROP TRIGGER IF EXISTS update_slot_count_trigger ON public.registrations;
CREATE TRIGGER update_slot_count_trigger
  AFTER INSERT OR UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_slot_count();

DROP TRIGGER IF EXISTS send_hall_ticket_whatsapp_trigger ON public.registrations;
CREATE TRIGGER send_hall_ticket_whatsapp_trigger
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_hall_ticket_whatsapp();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
