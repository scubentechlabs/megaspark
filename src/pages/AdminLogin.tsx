import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    // Rate limiting: lock out after 5 failed attempts for 2 minutes
    const now = Date.now();
    if (lockoutUntil > now) {
      const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${secondsLeft} seconds.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === 'Failed to fetch' && attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          throw error;
        }

        if (data.session) {
          let ipAddress = 'Unknown';
          let city = null;
          let country = null;

          try {
            const ipController = new AbortController();
            const ipTimeout = setTimeout(() => ipController.abort(), 3000);
            const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: ipController.signal });
            clearTimeout(ipTimeout);
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              ipAddress = ipData.ip;
              try {
                const locController = new AbortController();
                const locTimeout = setTimeout(() => locController.abort(), 3000);
                const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`, { signal: locController.signal });
                clearTimeout(locTimeout);
                if (locationResponse.ok) {
                  const locationData = await locationResponse.json();
                  city = locationData.city;
                  country = locationData.country_name;
                }
              } catch {}
            }
          } catch {}

          try {
            await supabase.from('admin_sessions').insert({
              user_id: data.session.user.id,
              user_email: email,
              ip_address: ipAddress,
              user_agent: navigator.userAgent,
              city,
              country,
            });
          } catch {}

          setLoginAttempts(0);
          toast({ title: "Login Successful", description: "Welcome to the admin panel" });
          navigate("/admin");
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        if (error.message === 'Failed to fetch' && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        console.error("Login error:", error);
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 120000); // 2 minute lockout
          setLoginAttempts(0);
        }
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    toast({
      title: "Connection Error",
      description: "Unable to connect. Please check your internet and try again.",
      variant: "destructive",
    });
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Lock className="h-8 w-8 text-primary" />
              {showForgotPassword ? "Reset Password" : "Admin Login"}
            </CardTitle>
            <CardDescription className="text-base">
              {showForgotPassword 
                ? "Enter your email to receive reset instructions" 
                : "Enter your credentials to access the admin panel"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {resetEmailSent ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-medium mb-2">Email Sent Successfully!</p>
                  <p className="text-green-700 text-sm">
                    Check your email inbox for password reset instructions.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            ) : showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Secure admin access only</p>
        </div>
      </div>
    </div>
  );
}
