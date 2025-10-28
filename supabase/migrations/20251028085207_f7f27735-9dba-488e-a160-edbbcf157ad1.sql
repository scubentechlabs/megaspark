-- Add failed_at column to whatsapp_messages if missing
ALTER TABLE public.whatsapp_messages
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ;