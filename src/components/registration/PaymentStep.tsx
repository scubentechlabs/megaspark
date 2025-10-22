import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, CreditCard, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStepProps {
  onPaymentComplete: (orderId: string) => Promise<void>;
  formData?: any;
}

export const PaymentStep = ({ onPaymentComplete, formData }: PaymentStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = 50;

  const handlePhonePePayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Initiating PhonePe payment...');
      
      // Save form data to session storage for later use after redirect
      sessionStorage.setItem('registrationFormData', JSON.stringify(formData));
      
      const { data, error } = await supabase.functions.invoke('phonepe-payment', {
        body: {
          amount: amount,
          customerName: formData?.studentName || 'Student',
          customerPhone: formData?.phoneNumber || '9999999999',
          customerEmail: formData?.email || undefined,
          registrationId: `REG${Date.now()}`
        }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw new Error(error.message || 'Failed to initiate payment');
      }

      console.log('PhonePe payment response:', data);

      if (data?.success && data?.paymentUrl) {
        toast.success('Redirecting to PhonePe payment gateway...');
        // Redirect to PhonePe payment page
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1000);
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error.message || 'Please try again'
      });
      setIsProcessing(false);
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
          onClick={handlePhonePePayment}
          disabled={isProcessing}
          className="w-full h-auto py-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:opacity-90 text-white text-xl font-bold shadow-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8" />
              <span>Pay with PhonePe</span>
            </div>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Secure payment powered by PhonePe
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
            <p>Your payment is processed securely through PhonePe. Registration will be confirmed immediately after successful payment.</p>
          </div>
        </div>
      </Card>

      {/* Accepted Payment Methods */}
      <Card className="p-4 border-accent/20">
        <h4 className="font-semibold text-sm mb-3 text-foreground">Accepted Payment Methods via PhonePe:</h4>
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
