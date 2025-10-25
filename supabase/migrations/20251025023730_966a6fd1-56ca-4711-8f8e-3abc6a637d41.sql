-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job to expire pending payments every hour
-- This will call the edge function to check and expire payments older than 24 hours
SELECT cron.schedule(
  'expire-pending-payments-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tgfpewbymloyxhpdfnzk.supabase.co/functions/v1/expire-pending-payments',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZnBld2J5bWxveXhocGRmbnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzU1OTMsImV4cCI6MjA3NDgxMTU5M30.ygfgFCei3bZRJcpAiuZZ1uSeDaxfp5HpLgQP8n5KnRs"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
