-- Create storage bucket for hall tickets
INSERT INTO storage.buckets (id, name, public)
VALUES ('hall-tickets', 'hall-tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for hall tickets bucket
CREATE POLICY "Anyone can view hall tickets"
ON storage.objects FOR SELECT
USING (bucket_id = 'hall-tickets');

CREATE POLICY "Service role can insert hall tickets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hall-tickets' AND auth.role() = 'service_role');

CREATE POLICY "Service role can update hall tickets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hall-tickets' AND auth.role() = 'service_role');