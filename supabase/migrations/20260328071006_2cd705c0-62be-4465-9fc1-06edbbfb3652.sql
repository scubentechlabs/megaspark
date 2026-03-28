
-- Make storage buckets private (currently public)
UPDATE storage.buckets SET public = false WHERE id IN ('hall-tickets', 'registration-documents');

-- Add RLS policies for storage - only admins can access
CREATE POLICY "Only admins can read hall tickets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'hall-tickets' AND public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can upload hall tickets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hall-tickets' AND public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can read registration docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'registration-documents' AND public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can upload registration docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'registration-documents' AND public.is_admin_or_manager(auth.uid()));
