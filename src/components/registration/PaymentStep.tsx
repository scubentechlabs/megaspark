import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, CreditCard, Wallet, CheckCircle2, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStepProps {
  onPaymentComplete: (orderId: string) => Promise<void>;
  formData?: any;
}

export const PaymentStep = ({ onPaymentComplete, formData }: PaymentStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const baseAmount = 50;
  const discountAmount = appliedCoupon 
    ? appliedCoupon.discount_type === 'percentage'
      ? (baseAmount * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;
  const finalAmount = Math.max(baseAmount - discountAmount, 0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { code: couponCode.toUpperCase().trim() },
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Invalid coupon code');
        return;
      }

      setAppliedCoupon(data.coupon);
      toast.success(`Coupon applied! You saved ${data.coupon.discount_type === 'percentage' ? `${data.coupon.discount_value}%` : `₹${data.coupon.discount_value}`}`);
    } catch (error: any) {
      toast.error('Failed to validate coupon');
      console.error(error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success('Coupon removed');
  };

  const handleFreeRegistration = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Processing free registration...');
      
      const orderId = `FREE${Date.now()}`;
      
      // Create payment record first (required for registration number generation)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          transaction_id: orderId,
          student_name: formData?.studentName || 'Student',
          payment_type: 'free',
          status: 'completed',
          amount: 0,
          original_amount: baseAmount,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon?.code || null,
          payment_method: 'coupon'
        });

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
        throw new Error('Failed to create payment record');
      }

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id);
      }
      
      // Complete registration
      await onPaymentComplete(orderId);
      
      toast.success('Registration completed successfully!');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again'
      });
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Initiating Razorpay payment...');

      // Save form data to session storage
      sessionStorage.setItem('registrationFormData', JSON.stringify(formData));
      if (appliedCoupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      }
      
      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: finalAmount,
          studentName: formData?.studentName || 'Student',
          mobileNumber: formData?.phoneNumber || '9999999999',
          email: formData?.email || '',
          discountAmount: discountAmount,
          couponCode: appliedCoupon?.code || null,
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(error.message || 'Failed to create order');
      }

      console.log('Razorpay order response:', data);

      if (!data?.success || !data?.orderId) {
        throw new Error(data?.error || 'Failed to create order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "MEGA SPARK EXAM",
        description: "Registration Fee",
        order_id: data.orderId,
        prefill: {
          name: formData?.studentName || 'Student',
          contact: formData?.phoneNumber || '9999999999',
          email: formData?.email || '',
        },
        theme: {
          color: "#8B5CF6",
        },
        handler: async function (response: any) {
          console.log("Payment successful:", response);
          
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("razorpay-verify", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError || !verifyData?.verified) {
              console.error("Payment verification failed:", verifyError);
              toast.error("Payment verification failed");
              setIsProcessing(false);
              return;
            }

            toast.success("Payment successful!");
            
            // Call onPaymentComplete with order ID
            await onPaymentComplete(response.razorpay_order_id);
          } catch (err: any) {
            console.error("Payment completion error:", err);
            toast.error("Failed to complete registration");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled by user");
            toast.error("Payment cancelled");
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
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
      {/* Coupon Code Section */}
      <Card className="p-4">
        <Label htmlFor="coupon" className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Have a Coupon Code?
        </Label>
        {!appliedCoupon ? (
          <div className="flex gap-2 mt-2">
            <Input
              id="coupon"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button
              onClick={validateCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              variant="outline"
            >
              {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold text-green-700 dark:text-green-400">
                {appliedCoupon.code} Applied
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                Discount: {appliedCoupon.discount_type === 'percentage' 
                  ? `${appliedCoupon.discount_value}%` 
                  : `₹${appliedCoupon.discount_value}`}
              </div>
            </div>
            <Button
              onClick={removeCoupon}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Payment Amount */}
      <Card className="bg-gradient-to-br from-primary to-accent text-white p-8">
        <div className="text-sm font-semibold mb-2 opacity-90">Registration Fee</div>
        {appliedCoupon && (
          <>
            <div className="text-2xl line-through opacity-70">₹{baseAmount}</div>
            <div className="text-sm opacity-90 mb-2">
              - ₹{discountAmount.toFixed(2)} discount
            </div>
          </>
        )}
        <div className="text-5xl font-bold mb-2">₹{finalAmount.toFixed(2)}</div>
        <div className="text-sm opacity-90">One-time payment for Mega Spark Exam 2026</div>
      </Card>

      {/* Payment/Registration Button */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">
          {finalAmount === 0 ? 'Complete Registration' : 'Complete Payment'}
        </h3>
        
        {finalAmount === 0 ? (
          <Button
            onClick={handleFreeRegistration}
            disabled={isProcessing}
            className="w-full h-auto py-8 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white text-xl font-bold shadow-lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing Registration...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8" />
                <span>Register Now - FREE</span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleRazorpayPayment}
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
                <span>Pay ₹{finalAmount.toFixed(2)} with Razorpay</span>
              </div>
            )}
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {finalAmount === 0 ? 'Complete your free registration' : 'Secure payment powered by Razorpay'}
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
