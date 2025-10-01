-- Create registrations table to store exam registrations
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  standard TEXT NOT NULL,
  medium TEXT NOT NULL,
  exam_center TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  hall_ticket_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read registrations (for public hall ticket download)
CREATE POLICY "Anyone can view registrations"
ON public.registrations
FOR SELECT
USING (true);

-- Create policy to allow anyone to insert registrations (for public registration)
CREATE POLICY "Anyone can create registrations"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Create index on mobile_number for faster lookups
CREATE INDEX idx_registrations_mobile ON public.registrations(mobile_number);

-- Create index on registration_number for faster lookups
CREATE INDEX idx_registrations_reg_number ON public.registrations(registration_number);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();