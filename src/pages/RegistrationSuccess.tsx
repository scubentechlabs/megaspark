import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper, Download, Share2, Home, Loader2, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is a PhonePe redirect
    const txnId = searchParams.get('txnId');
    
    if (txnId) {
      // Verify payment status with PhonePe
      verifyPhonePePayment(txnId);
    } else {
      // Trigger confetti for direct access
      triggerConfetti();
    }
  }, [searchParams]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9b87f5', '#0EA5E9', '#F97316']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9b87f5', '#0EA5E9', '#F97316']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const verifyPhonePePayment = async (txnId: string) => {
    setIsVerifyingPayment(true);
    
    try {
      console.log('Verifying PhonePe payment for txnId:', txnId);
      
      // Get form data from session storage
      const formDataStr = sessionStorage.getItem('registrationFormData');
      if (!formDataStr) {
        toast.error('Registration data not found');
        navigate('/');
        return;
      }
      
      const formData = JSON.parse(formDataStr);
      
      // Verify payment status with PhonePe and upsert payment record
      const { data: statusData, error: statusError } = await supabase.functions.invoke('phonepe-status', {
        body: { merchantTransactionId: txnId }
      });
      
      if (statusError) {
        console.error('Status check error:', statusError);
        toast.error('Payment verification failed');
        navigate('/');
        return;
      }

      console.log('Status check result:', statusData);

      // Check if payment was successful
      if (!statusData?.success || statusData?.status?.data?.state !== 'COMPLETED') {
        toast.error('Payment not completed');
        navigate('/');
        return;
      }

      // Create registration record
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          student_name: formData.studentName,
          parent_name: formData.parentName,
          mobile_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber,
          state: formData.state,
          district: formData.district,
          school_name: formData.schoolName,
          school_medium: formData.schoolMedium,
          medium: formData.schoolMedium, // Also set medium field to match school_medium
          standard: formData.standard,
          previous_year_percentage: formData.previousYearPercentage,
          preferred_exam_date: formData.preferredExamDate,
          exam_date: formData.preferredExamDate,
          exam_center: 'To be announced',
          registration_number: ''
        } as any)
        .select()
        .single();

      if (registrationError) {
        console.error('Registration error:', registrationError);
        toast.error('Failed to create registration');
        return;
      }

      // Store registration ID for WhatsApp functionality
      setRegistrationId((registrationData as any).id);

      // Link payment to registration
      await supabase
        .from('payments')
        .update({ registration_id: (registrationData as any).id })
        .eq('order_id', txnId);

      // Clear session storage
      sessionStorage.removeItem('registrationFormData');
      
      toast.success('Registration completed successfully!');
      triggerConfetti();
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
      navigate('/');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleDownloadHallTicket = () => {
    // Navigate to login page for hall ticket download
    navigate('/login');
    toast.success("Redirecting to download hall ticket...");
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      "🎉 I just registered for Mega Spark Exam 2025! Join me and compete for scholarships worth ₹75 Crores. Register now at: https://megasparkexam.com"
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSendHallTicketWhatsApp = async () => {
    if (!registrationId) {
      toast.error("Registration ID not found. Please contact support.");
      return;
    }

    try {
      setSendingWhatsApp(true);
      
      const { data, error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Hall ticket sent to your WhatsApp number!");
      } else {
        throw new Error(data?.error || "Failed to send hall ticket");
      }
    } catch (error: any) {
      console.error('Error sending hall ticket:', error);
      toast.error(error.message || "Failed to send hall ticket. Please try again.");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Show loading state while verifying payment
  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl animate-scale-in">
        <CardContent className="p-8 md:p-12">
          {/* Success Icon with Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-pulse">
              <PartyPopper className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Congratulations! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-foreground font-semibold mb-2">
              You're officially registered for
            </p>
            <p className="text-2xl md:text-3xl font-bold text-accent">
              Mega Spark Exam 2025!
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="P.P. SAVANI CFE" className="h-20 w-auto" />
          </div>

          {/* Hall Ticket Download Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Get Your Hall Ticket</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadHallTicket}
                  size="lg"
                  variant="outline"
                  className="h-12 font-semibold border-2 border-primary hover:bg-primary/10"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Hall Ticket
                </Button>
                <Button
                  onClick={handleSendHallTicketWhatsApp}
                  disabled={sendingWhatsApp || !registrationId}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white h-12 font-semibold"
                >
                  {sendingWhatsApp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Get on WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Share Section */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/20 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Share with Friends</h3>
                    <p className="text-sm text-muted-foreground">Help your friends win scholarships too!</p>
                  </div>
                </div>
                <Button
                  onClick={handleWhatsAppShare}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white px-6 py-6 text-lg font-semibold whitespace-nowrap"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-accent mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse mt-2" />
                <div className="flex-1">
                  <strong className="text-primary text-lg">Important Reminder:</strong>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Report to exam center by <strong className="text-accent">8:00 AM</strong> on exam day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>Bring valid ID proof (Aadhar Card) and your hall ticket</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-2 border-primary hover:bg-primary/10 py-6 text-lg font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
            <Button
              onClick={() => window.open('https://drive.google.com/drive/folders/1GUQk1vQbBLpGWPB55S0GKs0CcQhdVJcn', '_blank')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-6 text-lg font-semibold"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Study Material
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
