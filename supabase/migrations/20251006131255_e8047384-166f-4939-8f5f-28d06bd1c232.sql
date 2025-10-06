-- Add hall ticket fields to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS room_no text,
ADD COLUMN IF NOT EXISTS floor text,
ADD COLUMN IF NOT EXISTS building_name text,
ADD COLUMN IF NOT EXISTS exam_pattern text;