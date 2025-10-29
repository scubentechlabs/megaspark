-- Ensure the 'hall-tickets' storage bucket exists and is public, with proper policies for uploading poster.jpg

-- Create bucket if it doesn't exist (only insert if not present)
INSERT INTO storage.buckets (id, name, public)
SELECT 'hall-tickets', 'hall-tickets', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'hall-tickets'
);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view hall tickets" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload poster image" ON storage.objects;
DROP POLICY IF EXISTS "Public can update poster image" ON storage.objects;

-- Public read policy for the hall-tickets bucket
CREATE POLICY "Public can view hall tickets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hall-tickets');

-- Allow public INSERT only for the specific poster file path
CREATE POLICY "Public can upload poster image"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'hall-tickets'
  AND name = 'poster.jpg'
);

-- Allow public UPDATE only for that same poster file (needed for upsert)
CREATE POLICY "Public can update poster image"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'hall-tickets'
  AND name = 'poster.jpg'
)
WITH CHECK (
  bucket_id = 'hall-tickets'
  AND name = 'poster.jpg'
);
