-- Add maintenance_mode column to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false;