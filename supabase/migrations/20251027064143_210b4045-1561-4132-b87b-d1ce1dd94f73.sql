-- Update the function to use hardcoded Supabase URL
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
  message_body text;
  request_id bigint;
BEGIN
  -- Only proceed if registration number is assigned and hall ticket URL exists
  IF NEW.registration_number IS NOT NULL 
     AND NEW.registration_number != '' 
     AND NEW.hall_ticket_url IS NOT NULL 
     AND NEW.hall_ticket_url != '' THEN
    
    -- Use whatsapp_number if available, otherwise use mobile_number
    whatsapp_phone := COALESCE(NEW.whatsapp_number, NEW.mobile_number);
    
    -- Construct message
    message_body := 'Dear ' || NEW.student_name || ', Congratulations! Your registration for MEGA SPARK EXAM 2025 is successful. Registration No: ' || NEW.registration_number || '. Download your Hall Ticket: ' || NEW.hall_ticket_url;
    
    -- Call the send-whatsapp edge function using pg_net
    SELECT net.http_post(
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
    ) INTO request_id;
    
    -- Log the action
    RAISE NOTICE 'WhatsApp message queued for phone: %, request_id: %', whatsapp_phone, request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;