
CREATE OR REPLACE FUNCTION public.verify_slot_availability(_slot_name text, _exam_date date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_record RECORD;
  date_override RECORD;
  result jsonb;
BEGIN
  -- Get slot settings
  SELECT id, slot_name, is_enabled, max_capacity, current_count, reporting_time
  INTO slot_record
  FROM public.slot_settings
  WHERE slot_name = _slot_name;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'reason', 'slot_not_found');
  END IF;

  IF NOT slot_record.is_enabled THEN
    RETURN jsonb_build_object('available', false, 'reason', 'slot_disabled');
  END IF;

  IF slot_record.current_count >= slot_record.max_capacity THEN
    RETURN jsonb_build_object('available', false, 'reason', 'slot_full');
  END IF;

  -- Check date-specific override
  SELECT id, is_enabled
  INTO date_override
  FROM public.slot_date_settings
  WHERE exam_date = _exam_date AND slot_name = _slot_name;

  IF FOUND AND NOT date_override.is_enabled THEN
    RETURN jsonb_build_object('available', false, 'reason', 'date_slot_disabled');
  END IF;

  RETURN jsonb_build_object('available', true, 'reason', 'ok');
END;
$$;
