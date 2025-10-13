-- Create payments table to track all payment transactions
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  registration_number text,
  amount numeric(10,2) NOT NULL,
  payment_type text NOT NULL, -- 'razorpay', 'phonepe', 'paytm'
  status text NOT NULL, -- 'success', 'failed', 'pending'
  transaction_id text,
  order_id text,
  failure_reason text,
  payment_method text, -- 'card', 'upi', 'netbanking', etc.
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admins) to view all payments
CREATE POLICY "Authenticated users can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (true);

-- Policy for anyone to insert payments (during registration)
CREATE POLICY "Anyone can create payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

-- Policy for authenticated users to update payments
CREATE POLICY "Authenticated users can update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX idx_payments_registration_id ON public.payments(registration_id);

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();