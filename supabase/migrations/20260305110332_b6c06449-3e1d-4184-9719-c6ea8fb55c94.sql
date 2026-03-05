
-- Fix the send_hall_ticket_whatsapp function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.send_hall_ticket_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text := 'https://tgfpewbymloyxhpdfnzk.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZnBld2J5bWxveXhocGRmbnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzU1OTMsImV4cCI6MjA3NDgxMTU5M30.ygfgFCei3bZRJcpAiuZZ1uSeDaxfp5HpLgQP8n5KnRs';
  request_id bigint;
BEGIN
  -- Only proceed if registration number is assigned
  IF NEW.registration_number IS NOT NULL AND NEW.registration_number != '' THEN
    -- For INSERT: always proceed since it's a new record
    -- For UPDATE: only proceed if registration_number actually changed
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.registration_number IS NULL OR OLD.registration_number = '' OR OLD.registration_number IS DISTINCT FROM NEW.registration_number)) THEN
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/generate-hall-ticket',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || supabase_anon_key
        ),
        body := jsonb_build_object(
          'registrationId', NEW.id
        )
      ) INTO request_id;
      
      RAISE NOTICE 'Hall ticket generation queued for registration: %, request_id: %', NEW.id, request_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the generate_seat_number trigger (BEFORE INSERT)
DROP TRIGGER IF EXISTS generate_seat_number_trigger ON public.registrations;
CREATE TRIGGER generate_seat_number_trigger
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_seat_number();

-- Recreate the hall ticket trigger (AFTER INSERT OR UPDATE)
DROP TRIGGER IF EXISTS send_hall_ticket_on_reg_number_change ON public.registrations;
CREATE TRIGGER send_hall_ticket_on_reg_number_change
AFTER INSERT OR UPDATE OF registration_number ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.send_hall_ticket_whatsapp();

-- Recreate updated_at trigger
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate slot count trigger
DROP TRIGGER IF EXISTS update_slot_count_trigger ON public.registrations;
CREATE TRIGGER update_slot_count_trigger
AFTER INSERT OR UPDATE OF time_slot ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_count();
