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
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid coupon code');
        return;
      }

      // Check validity period
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom) {
        toast.error('This coupon is not yet valid');
        return;
      }

      if (validUntil && now > validUntil) {
        toast.error('This coupon has expired');
        return;
      }

      // Check usage limit
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('This coupon has reached its usage limit');
        return;
      }

      setAppliedCoupon(data);
      toast.success(`Coupon applied! You saved ${data.discount_type === 'percentage' ? `${data.discount_value}%` : `₹${data.discount_value}`}`);
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

  const handlePhonePePayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Initiating PhonePe payment...');
      
      // Save form data to session storage for later use after redirect
      sessionStorage.setItem('registrationFormData', JSON.stringify(formData));
      if (appliedCoupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      }
      
      const { data, error } = await supabase.functions.invoke('phonepe-payment', {
        body: {
          amount: finalAmount,
          customerName: formData?.studentName || 'Student',
          customerPhone: formData?.phoneNumber || '9999999999',
          customerEmail: formData?.email || undefined,
          registrationId: `REG${Date.now()}`,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount,
          originalAmount: baseAmount
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
        <div className="text-sm opacity-90">One-time payment for Mega Spark Exam 2025</div>
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
                <span>Pay ₹{finalAmount.toFixed(2)} with PhonePe</span>
              </div>
            )}
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {finalAmount === 0 ? 'Complete your free registration' : 'Secure payment powered by PhonePe'}
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
