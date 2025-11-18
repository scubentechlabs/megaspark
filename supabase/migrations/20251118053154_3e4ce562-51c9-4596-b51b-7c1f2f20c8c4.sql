-- Make medium column nullable since it's no longer collected in the form
ALTER TABLE public.registrations 
ALTER COLUMN medium DROP NOT NULL;