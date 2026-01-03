-- Add new columns to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS class_rank text,
ADD COLUMN IF NOT EXISTS olympiad_appeared text,
ADD COLUMN IF NOT EXISTS olympiad_certificate_url text,
ADD COLUMN IF NOT EXISTS marksheet_url text;

-- Create storage bucket for registration documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-documents', 'registration-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for registration documents
CREATE POLICY "Anyone can upload registration documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'registration-documents');

CREATE POLICY "Anyone can view registration documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'registration-documents');

CREATE POLICY "Anyone can update registration documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'registration-documents');

CREATE POLICY "Anyone can delete registration documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'registration-documents');