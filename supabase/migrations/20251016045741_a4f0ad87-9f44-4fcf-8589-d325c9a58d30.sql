-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS generate_seat_number_trigger ON public.registrations;

-- Recreate the improved function to handle various standard formats
CREATE OR REPLACE FUNCTION public.generate_seat_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  date_prefix text;
  standard_code text;
  next_sequence integer;
  new_seat_number text;
  max_seat text;
  clean_standard text;
BEGIN
  -- Clean standard value (remove 'th', 'st', 'nd', 'rd' and convert to number)
  clean_standard := regexp_replace(LOWER(NEW.standard), '(st|nd|rd|th)', '', 'g');
  clean_standard := trim(clean_standard);
  
  -- Extract date prefix (DD format from exam_date)
  -- If exam_date is null, use current date
  IF NEW.exam_date IS NULL THEN
    date_prefix := to_char(CURRENT_DATE, 'DD');
  ELSE
    date_prefix := to_char(NEW.exam_date, 'DD');
  END IF;
  
  -- Map standard to code based on medium (case insensitive)
  IF LOWER(NEW.medium) = 'english' THEN
    standard_code := CASE clean_standard
      WHEN '5' THEN '51'
      WHEN '6' THEN '61'
      WHEN '7' THEN '71'
      WHEN '8' THEN '81'
      WHEN '9' THEN '91'
      WHEN '10' THEN '11'
      ELSE '00'
    END;
  ELSIF LOWER(NEW.medium) = 'gujarati' THEN
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
    -- For other mediums, return without generating seat number
    RETURN NEW;
  END IF;
  
  -- Find the maximum seat number for this exam date, standard, and medium
  SELECT MAX(registration_number) INTO max_seat
  FROM public.registrations
  WHERE registration_number LIKE date_prefix || standard_code || '%'
    AND LOWER(medium) = LOWER(NEW.medium)
    AND registration_number ~ '^[0-9]+$';
  
  -- Calculate next sequence number
  IF max_seat IS NULL THEN
    next_sequence := 1;
  ELSE
    next_sequence := CAST(substring(max_seat from 5) AS integer) + 1;
  END IF;
  
  -- Generate new seat number with format DDSSNNNN
  new_seat_number := date_prefix || standard_code || lpad(next_sequence::text, 4, '0');
  
  -- Set the registration number
  NEW.registration_number := new_seat_number;
  
  RETURN NEW;
END;
$$;

-- Create the trigger to run before insert
CREATE TRIGGER generate_seat_number_trigger
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- Fix existing records with missing or invalid registration numbers
DO $$
DECLARE
  rec RECORD;
  date_prefix text;
  standard_code text;
  next_sequence integer;
  new_seat_number text;
  max_seat text;
  clean_standard text;
BEGIN
  FOR rec IN 
    SELECT * FROM public.registrations 
    WHERE registration_number IS NULL 
       OR registration_number = '' 
       OR registration_number LIKE 'SPARK%'
    ORDER BY created_at
  LOOP
    -- Clean standard value
    clean_standard := regexp_replace(LOWER(rec.standard), '(st|nd|rd|th)', '', 'g');
    clean_standard := trim(clean_standard);
    
    -- Extract date prefix
    IF rec.exam_date IS NULL THEN
      date_prefix := to_char(rec.created_at, 'DD');
    ELSE
      date_prefix := to_char(rec.exam_date, 'DD');
    END IF;
    
    -- Map standard to code based on medium
    IF LOWER(rec.medium) = 'english' THEN
      standard_code := CASE clean_standard
        WHEN '5' THEN '51'
        WHEN '6' THEN '61'
        WHEN '7' THEN '71'
        WHEN '8' THEN '81'
        WHEN '9' THEN '91'
        WHEN '10' THEN '11'
        ELSE '00'
      END;
    ELSIF LOWER(rec.medium) = 'gujarati' THEN
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
      CONTINUE;
    END IF;
    
    -- Find the maximum seat number
    SELECT MAX(registration_number) INTO max_seat
    FROM public.registrations
    WHERE registration_number LIKE date_prefix || standard_code || '%'
      AND LOWER(medium) = LOWER(rec.medium)
      AND registration_number ~ '^[0-9]+$';
    
    -- Calculate next sequence number
    IF max_seat IS NULL THEN
      next_sequence := 1;
    ELSE
      next_sequence := CAST(substring(max_seat from 5) AS integer) + 1;
    END IF;
    
    -- Generate new seat number
    new_seat_number := date_prefix || standard_code || lpad(next_sequence::text, 4, '0');
    
    -- Update the record
    UPDATE public.registrations
    SET registration_number = new_seat_number
    WHERE id = rec.id;
  END LOOP;
END $$;