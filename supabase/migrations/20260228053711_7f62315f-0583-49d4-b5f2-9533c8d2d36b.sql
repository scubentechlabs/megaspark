
CREATE TABLE public.exam_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_date date NOT NULL,
  label text NOT NULL,
  day_name text,
  exam_time text DEFAULT '8:00 AM - 12:00 PM',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(exam_date)
);

ALTER TABLE public.exam_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active exam dates" ON public.exam_dates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert exam dates" ON public.exam_dates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update exam dates" ON public.exam_dates
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete exam dates" ON public.exam_dates
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Seed existing exam dates
INSERT INTO public.exam_dates (exam_date, label, day_name, exam_time) VALUES
  ('2025-11-30', '30th November 2025', 'Sunday', '8:00 AM - 12:00 PM'),
  ('2025-12-07', '7th December 2025', 'Sunday', '8:00 AM - 12:00 PM'),
  ('2025-12-14', '14th December 2025', 'Sunday', '8:00 AM - 12:00 PM'),
  ('2025-12-28', '28th December 2025', 'Sunday', '8:00 AM - 12:00 PM');
