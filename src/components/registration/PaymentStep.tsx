import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, CreditCard, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PaymentStepProps {
  onPaymentComplete: () => void;
  formData?: any;
}

export const PaymentStep = ({ onPaymentComplete, formData }: PaymentStepProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = 50;

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Generate temporary registration ID
      const tempRegistrationId = `REG${Date.now()}`;
      
      console.log('Initiating Razorpay payment...');
      
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          amount: amount,
          registrationId: tempRegistrationId,
          customerName: formData?.studentName || 'Student',
          customerPhone: formData?.phoneNumber || '9999999999',
          customerEmail: formData?.email || undefined
        }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      console.log('Payment response:', data);

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
            description: 'Registration Fee',
            order_id: data.orderId,
            prefill: {
              name: formData?.studentName || 'Student',
              email: formData?.email || '',
              contact: formData?.phoneNumber || '9999999999'
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
                setIsProcessing(false);
                navigate(`/payment-failed?orderId=${response.razorpay_order_id}&reason=Payment verification failed`);
                return;
              }

              toast.success('Payment successful!');
              onPaymentComplete();
            },
            modal: {
              ondismiss: function() {
                setIsProcessing(false);
                toast.error('Payment cancelled');
                navigate(`/payment-failed?orderId=${data.orderId}&reason=Payment cancelled by user`);
              }
            }
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };

        script.onerror = () => {
          throw new Error('Failed to load Razorpay');
        };
      } else {
        throw new Error('Payment parameters not received');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error.message || 'Please try again'
      });
      setIsProcessing(false);
      // Note: Can't navigate here as we don't have orderId yet if payment initiation failed
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Payment Amount */}
      <Card className="bg-gradient-to-br from-primary to-accent text-white p-8 text-center">
        <div className="text-sm font-semibold mb-2 opacity-90">Registration Fee</div>
        <div className="text-5xl font-bold mb-2">₹{amount}</div>
        <div className="text-sm opacity-90">One-time payment for Mega Spark Exam 2025</div>
      </Card>

      {/* PhonePe Payment Button */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Complete Payment</h3>
        
        <Button
          onClick={handleRazorpayPayment}
          disabled={isProcessing}
          className="w-full h-auto py-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white text-xl font-bold shadow-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              <span>Pay with Razorpay</span>
            </div>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Payment Info */}
      <Card className="bg-muted/50 border-border p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Secure Payment</p>
            <p>Your payment is processed securely through Razorpay. Registration will be confirmed immediately after successful payment.</p>
          </div>
        </div>
      </Card>

      {/* Accepted Payment Methods */}
      <Card className="p-4 border-accent/20">
        <h4 className="font-semibold text-sm mb-3 text-foreground">Accepted Payment Methods via Razorpay:</h4>
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4 text-blue-500" />
            <span>UPI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span>Credit Card</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-4 w-4 text-green-500" />
            <span>Debit Card</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-4 w-4 text-orange-500" />
            <span>Net Banking</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4 text-purple-500" />
            <span>Wallets</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
