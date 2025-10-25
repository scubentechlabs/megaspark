-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active coupons
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Only authenticated users can manage coupons (for admin panel)
CREATE POLICY "Authenticated users can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add coupon_code column to payments table
ALTER TABLE public.payments
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0,
ADD COLUMN original_amount NUMERIC;