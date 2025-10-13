import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const orderId = searchParams.get('orderId');
  const failureReason = searchParams.get('reason') || 'Payment was unsuccessful';

  useEffect(() => {
    if (orderId) {
      fetchPaymentData();
    }
  }, [orderId]);

  const fetchPaymentData = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      setPaymentData(data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  };

  const handleRetryPayment = async () => {
    if (!paymentData) {
      toast.error('Unable to retry payment. Please register again.');
      navigate('/');
      return;
    }

    setIsRetrying(true);

    try {
      console.log('Retrying Razorpay payment...');
      
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          amount: paymentData.amount,
          registrationId: paymentData.registration_number || `REG${Date.now()}`,
          customerName: paymentData.student_name,
          customerPhone: '9999999999',
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to initiate payment');
      }

      if (data?.success && data?.orderId && data?.keyId) {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'Mega Spark Exam 2025',
            description: 'Registration Fee (Retry)',
            order_id: data.orderId,
            prefill: {
              name: paymentData.student_name,
              contact: '9999999999'
            },
            theme: {
              color: '#3399cc'
            },
            handler: async function (response: any) {
              console.log('Payment successful:', response);
              
              // Verify payment on server
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-callback', {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              });

              if (verifyError || !verifyData?.success) {
                toast.error('Payment verification failed');
                setIsRetrying(false);
                return;
              }

              toast.success('Payment successful!');
              navigate('/registration-success');
            },
            modal: {
              ondismiss: function() {
                setIsRetrying(false);
                toast.error('Payment cancelled');
              }
            }
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };

        script.onerror = () => {
          throw new Error('Failed to load Razorpay');
        };
      }
    } catch (error: any) {
      console.error('Retry payment error:', error);
      toast.error('Failed to retry payment', {
        description: error.message || 'Please try again'
      });
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your registration is pending payment completion
          </p>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <Card className="bg-muted/50 p-4 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-medium text-foreground">{paymentData.student_name}</span>
            </div>
            {paymentData.registration_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registration No:</span>
                <span className="font-medium text-foreground">{paymentData.registration_number}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-foreground">₹{paymentData.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-destructive capitalize">{paymentData.status}</span>
            </div>
          </Card>
        )}

        {/* Failure Reason */}
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            Reason: {failureReason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Retry Payment
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Need help? Contact support for assistance with your payment.
        </p>
      </Card>
    </div>
  );
}
