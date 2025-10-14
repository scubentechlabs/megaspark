-- Fix search_path security issue for generate_seat_number function
CREATE OR REPLACE FUNCTION public.generate_seat_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_prefix text;
  standard_code text;
  next_sequence integer;
  new_seat_number text;
  max_seat text;
BEGIN
  -- Only process for English medium
  IF NEW.medium != 'English' THEN
    RETURN NEW;
  END IF;
  
  -- Extract date prefix (DD format from exam_date)
  date_prefix := to_char(NEW.exam_date, 'DD');
  
  -- Map standard to code
  standard_code := CASE NEW.standard
    WHEN '5' THEN '51'
    WHEN '6' THEN '61'
    WHEN '7' THEN '71'
    WHEN '8' THEN '81'
    WHEN '9' THEN '91'
    WHEN '10' THEN '11'
    ELSE '00'
  END;
  
  -- Find the maximum seat number for this exam date and standard
  SELECT MAX(registration_number) INTO max_seat
  FROM public.registrations
  WHERE registration_number LIKE date_prefix || standard_code || '%'
    AND medium = 'English';
  
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