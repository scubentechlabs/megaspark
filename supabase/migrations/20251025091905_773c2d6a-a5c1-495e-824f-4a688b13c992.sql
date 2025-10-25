-- Enable realtime for registrations table
ALTER TABLE public.registrations REPLICA IDENTITY FULL;

-- Add registrations table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;