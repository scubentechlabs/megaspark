-- Drop the existing trigger first
DROP TRIGGER IF EXISTS send_hall_ticket_on_registration ON public.registrations;

-- Create updated trigger function to generate hall ticket PDF
CREATE OR REPLACE FUNCTION public.send_hall_ticket_whatsapp()
RETURNS TRIGGER
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
  IF NEW.registration_number IS NOT NULL 
     AND NEW.registration_number != ''
     AND (OLD.registration_number IS NULL OR OLD.registration_number = '' OR OLD.registration_number != NEW.registration_number) THEN
    
    -- Call the generate-hall-ticket edge function to create PDF and send WhatsApp
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
    
    -- Log the action
    RAISE NOTICE 'Hall ticket generation queued for registration: %, request_id: %', NEW.id, request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER send_hall_ticket_on_registration
AFTER UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.send_hall_ticket_whatsapp();