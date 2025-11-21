-- Fix registrations with missing registration numbers by generating them
-- This will trigger the generate_seat_number() function for records with null registration_number

UPDATE registrations
SET updated_at = now()
WHERE registration_number IS NULL OR registration_number = '';