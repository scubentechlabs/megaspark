-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send WhatsApp notification after registration
CREATE OR REPLACE FUNCTION public.send_hall_ticket_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  supabase_anon_key text;
  whatsapp_phone text;
  message_body text;
BEGIN
  -- Only proceed if registration number is assigned and hall ticket URL exists
  IF NEW.registration_number IS NOT NULL 
     AND NEW.registration_number != '' 
     AND NEW.hall_ticket_url IS NOT NULL 
     AND NEW.hall_ticket_url != '' THEN
    
    -- Get Supabase URL and key from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- Use whatsapp_number if available, otherwise use mobile_number
    whatsapp_phone := COALESCE(NEW.whatsapp_number, NEW.mobile_number);
    
    -- Construct message
    message_body := 'Dear ' || NEW.student_name || ', Congratulations! Your registration for MEGA SPARK EXAM 2025 is successful. Registration No: ' || NEW.registration_number || '. Download your Hall Ticket: ' || NEW.hall_ticket_url;
    
    -- Call the send-whatsapp edge function using pg_net
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-whatsapp',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'phoneNumber', whatsapp_phone,
        'messageType', 'hall_ticket',
        'registrationId', NEW.id,
        'messageBody', message_body
      )
    );
    
    -- Log the action
    RAISE NOTICE 'WhatsApp message queued for phone: %', whatsapp_phone;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to send WhatsApp after registration update
DROP TRIGGER IF EXISTS send_whatsapp_after_registration ON public.registrations;

CREATE TRIGGER send_whatsapp_after_registration
  AFTER INSERT OR UPDATE OF registration_number, hall_ticket_url ON public.registrations
  FOR EACH ROW
  WHEN (NEW.registration_number IS NOT NULL AND NEW.hall_ticket_url IS NOT NULL)
  EXECUTE FUNCTION public.send_hall_ticket_whatsapp();