
CREATE OR REPLACE FUNCTION public.send_hall_ticket_whatsapp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Get secrets from vault (service role key for authenticated access)
  supabase_url := current_setting('app.settings.supabase_url', true);
  IF supabase_url IS NULL THEN
    supabase_url := 'https://tgfpewbymloyxhpdfnzk.supabase.co';
  END IF;
  
  -- Use service role key from vault instead of hardcoded anon key
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;
  
  IF service_role_key IS NULL THEN
    RAISE WARNING 'Service role key not found in vault, skipping hall ticket generation';
    RETURN NEW;
  END IF;

  -- Only proceed if registration number is assigned
  IF NEW.registration_number IS NOT NULL AND NEW.registration_number != '' THEN
    -- For INSERT: always proceed since it's a new record
    -- For UPDATE: only proceed if registration_number actually changed
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.registration_number IS NULL OR OLD.registration_number = '' OR OLD.registration_number IS DISTINCT FROM NEW.registration_number)) THEN
      SELECT net.http_post(
        url := supabase_url || '/functions/v1/generate-hall-ticket',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
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
