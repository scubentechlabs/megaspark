-- Add new columns for the updated registration form
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS parent_name text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS city_village text,
ADD COLUMN IF NOT EXISTS school_medium text,
ADD COLUMN IF NOT EXISTS previous_year_percentage text,
ADD COLUMN IF NOT EXISTS preferred_exam_date date;

-- Make previously required fields nullable since they're removed from the new form
ALTER TABLE public.registrations
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN date_of_birth DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL;