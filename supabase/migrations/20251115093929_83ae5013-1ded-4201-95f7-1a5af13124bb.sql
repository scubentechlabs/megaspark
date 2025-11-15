-- First, reassign whatsapp messages from duplicate registrations to the oldest one
WITH duplicates AS (
  SELECT id, mobile_number,
    FIRST_VALUE(id) OVER (PARTITION BY mobile_number ORDER BY created_at ASC) as keep_id,
    ROW_NUMBER() OVER (PARTITION BY mobile_number ORDER BY created_at ASC) as rn
  FROM public.registrations
)
UPDATE public.whatsapp_messages
SET registration_id = d.keep_id
FROM duplicates d
WHERE whatsapp_messages.registration_id = d.id
  AND d.rn > 1;

-- Delete duplicate registrations (keep oldest)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY mobile_number ORDER BY created_at ASC) as rn
  FROM public.registrations
)
DELETE FROM public.registrations
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint on mobile_number
ALTER TABLE public.registrations 
ADD CONSTRAINT unique_mobile_number UNIQUE (mobile_number);