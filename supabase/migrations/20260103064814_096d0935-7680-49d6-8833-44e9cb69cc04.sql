-- Add status column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' NOT NULL;

-- Update the generate_seat_number function to only generate on approval
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
  -- Only generate registration number when status changes to 'approved'
  IF NEW.status != 'approved' THEN
    RETURN NEW;
  END IF;
  
  -- Skip if registration number already exists and is not empty
  IF NEW.registration_number IS NOT NULL AND NEW.registration_number != '' THEN
    RETURN NEW;
  END IF;
  
  -- Use school_medium if medium is null
  effective_medium := COALESCE(NEW.medium, NEW.school_medium);
  
  -- If both medium and school_medium are null, cannot generate
  IF effective_medium IS NULL OR effective_medium = '' THEN
    NEW.registration_number := NULL;
    RETURN NEW;
  END IF;
  
  -- Clean standard value (remove 'th', 'st', 'nd', 'rd' and convert to number)
  clean_standard := regexp_replace(LOWER(NEW.standard), '(st|nd|rd|th)', '', 'g');
  clean_standard := trim(clean_standard);
  
  -- Extract date prefix (DD format from exam_date)
  IF NEW.exam_date IS NULL THEN
    date_prefix := to_char(CURRENT_DATE, 'DD');
  ELSE
    date_prefix := to_char(NEW.exam_date, 'DD');
  END IF;
  
  -- Map standard to code based on effective medium
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
      WHEN '5' THEN '50'
      WHEN '6' THEN '60'
      WHEN '7' THEN '70'
      WHEN '8' THEN '80'
      WHEN '9' THEN '90'
      WHEN '10' THEN '10'
      ELSE '00'
    END;
  ELSE
    NEW.registration_number := NULL;
    RETURN NEW;
  END IF;
  
  -- Find the maximum seat number for this exam date, standard, and medium
  SELECT MAX(registration_number) INTO max_seat
  FROM public.registrations
  WHERE registration_number LIKE date_prefix || standard_code || '%'
    AND LOWER(COALESCE(medium, school_medium)) = LOWER(effective_medium)
    AND registration_number ~ '^[0-9]+$';
  
  -- Calculate next sequence number
  IF max_seat IS NULL THEN
    next_sequence := 1;
  ELSE
    next_sequence := CAST(substring(max_seat from 5) AS integer) + 1;
  END IF;
  
  -- Generate new seat number with format DDSSNNNN
  new_seat_number := date_prefix || standard_code || lpad(next_sequence::text, 4, '0');
  
  -- Set the registration number and sync medium if it was null
  NEW.registration_number := new_seat_number;
  IF NEW.medium IS NULL AND NEW.school_medium IS NOT NULL THEN
    NEW.medium := NEW.school_medium;
  END IF;
  
  RETURN NEW;
END;
$function$;