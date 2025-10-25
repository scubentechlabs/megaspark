-- Create whatsapp_messages table to track WhatsApp API activity
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id),
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'hall_ticket', 'certificate', 'notification', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  link_opened BOOLEAN DEFAULT false,
  certificate_downloaded BOOLEAN DEFAULT false,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  link_opened_at TIMESTAMP WITH TIME ZONE,
  certificate_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view all whatsapp messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert whatsapp messages"
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update whatsapp messages"
  ON public.whatsapp_messages
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_timestamp_whatsapp_messages ON public.whatsapp_messages;
CREATE TRIGGER set_timestamp_whatsapp_messages
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_registration_id ON public.whatsapp_messages(registration_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);