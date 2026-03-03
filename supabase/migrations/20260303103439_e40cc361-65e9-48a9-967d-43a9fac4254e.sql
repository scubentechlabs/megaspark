
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
  IF NEW.status != 'approved' THEN
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
  
  -- English Medium: 51,61,71,81,91,11
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
  -- Gujarati Medium: 52,62,72,82,92,12
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
