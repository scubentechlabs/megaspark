-- Drop the existing trigger first
DROP TRIGGER IF EXISTS send_whatsapp_after_registration ON public.registrations;

-- Update the function to send WhatsApp on registration number assignment
CREATE OR REPLACE FUNCTION public.send_hall_ticket_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text := 'https://tgfpewbymloyxhpdfnzk.supabase.co';
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZnBld2J5bWxveXhocGRmbnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzU1OTMsImV4cCI6MjA3NDgxMTU5M30.ygfgFCei3bZRJcpAiuZZ1uSeDaxfp5HpLgQP8n5KnRs';
  whatsapp_phone text;
  request_id bigint;
  message_text text;
BEGIN
  -- Only proceed if registration number is assigned
  IF NEW.registration_number IS NOT NULL 
     AND NEW.registration_number != ''
     AND (OLD.registration_number IS NULL OR OLD.registration_number = '' OR OLD.registration_number != NEW.registration_number) THEN
    
    -- Use whatsapp_number if available, otherwise use mobile_number
    whatsapp_phone := COALESCE(NEW.whatsapp_number, NEW.mobile_number);
    
    -- Prepare confirmation message
    message_text := 'Dear ' || NEW.student_name || ', your MEGA SPARK EXAM registration is confirmed! Your registration number is: ' || NEW.registration_number || '. Your hall ticket will be sent to you soon. All the best!';
    
    -- Call the send-whatsapp edge function
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/send-whatsapp',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'phoneNumber', whatsapp_phone,
        'messageType', 'registration_confirmation',
        'registrationId', NEW.id,
        'messageBody', message_text
      )
    ) INTO request_id;
    
    -- Log the action
    RAISE NOTICE 'WhatsApp confirmation message queued for phone: %, request_id: %', whatsapp_phone, request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on AFTER INSERT OR UPDATE
CREATE TRIGGER send_whatsapp_after_registration
AFTER INSERT OR UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.send_hall_ticket_whatsapp();