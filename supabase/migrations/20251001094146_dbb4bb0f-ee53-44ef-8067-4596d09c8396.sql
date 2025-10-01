-- Add missing columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS parent_first_name text,
ADD COLUMN IF NOT EXISTS parent_last_name text,
ADD COLUMN IF NOT EXISTS parent_email text,
ADD COLUMN IF NOT EXISTS parent_phone text,
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS school_address text,
ADD COLUMN IF NOT EXISTS exam_date date;