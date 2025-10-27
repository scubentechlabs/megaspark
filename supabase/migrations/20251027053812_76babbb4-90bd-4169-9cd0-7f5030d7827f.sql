-- Drop existing trigger first
DROP TRIGGER IF EXISTS generate_seat_number_on_insert ON public.registrations;
DROP TRIGGER IF EXISTS generate_seat_number_on_update ON public.registrations;

-- Update the generate_seat_number function to handle order_id matching
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
  payment_status text;
  payment_order_id text;
BEGIN
  -- Try to find payment by registration_id first
  SELECT status, order_id INTO payment_status, payment_order_id
  FROM public.payments
  WHERE registration_id = NEW.id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no payment found by registration_id, try to find by order_id pattern
  -- (for cases where registration is created before payment is linked)
  IF payment_status IS NULL THEN
    -- Look for payments without registration_id that might belong to this registration
    -- This handles the case where payment exists but isn't linked yet
    SELECT status, order_id INTO payment_status, payment_order_id
    FROM public.payments
    WHERE registration_id IS NULL
      AND (status = 'success' OR status = 'completed')
      AND student_name = NEW.student_name
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Only generate registration number if payment is successful or completed
  IF payment_status IS NULL OR (payment_status != 'success' AND payment_status != 'completed') THEN
    -- Set to NULL if payment is not successful
    NEW.registration_number := NULL;
    RETURN NEW;
  END IF;
  
  -- Skip if registration number already exists and is not a placeholder
  IF NEW.registration_number IS NOT NULL AND NEW.registration_number != '' AND NEW.registration_number NOT LIKE 'SPARK%' THEN
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
  
  -- Map standard to code based on medium
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
    NEW.registration_number := NULL;
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
$function$;

-- Recreate triggers
CREATE TRIGGER generate_seat_number_on_insert
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_seat_number();

CREATE TRIGGER generate_seat_number_on_update
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_seat_number();