-- Create admin sessions table to track logged-in admins
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  city TEXT,
  country TEXT,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  logout_time TIMESTAMP WITH TIME ZONE,
  logged_out_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all admin sessions
CREATE POLICY "Authenticated users can view admin sessions"
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own session"
ON public.admin_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update any session (for logout functionality)
CREATE POLICY "Users can update admin sessions"
ON public.admin_sessions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_is_active ON public.admin_sessions(is_active);
CREATE INDEX idx_admin_sessions_last_activity ON public.admin_sessions(last_activity);

-- Create function to update last activity
CREATE OR REPLACE FUNCTION public.update_admin_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_admin_sessions_updated_at
BEFORE UPDATE ON public.admin_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_session_activity();