-- Add DELETE policy for hall-tickets storage bucket to allow authenticated users to delete PDFs

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can delete hall ticket PDFs" ON storage.objects;

-- Allow authenticated users to delete PDF files (but not the poster)
CREATE POLICY "Authenticated users can delete hall ticket PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'hall-tickets'
  AND auth.uid() IS NOT NULL
  AND name != 'poster.jpg'
  AND name != 'hall-ticket-poster.jpg'
);