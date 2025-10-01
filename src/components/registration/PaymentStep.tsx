import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, CreditCard, Wallet, CheckCircle2, QrCode } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PaymentStepProps {
  onPaymentComplete: () => void;
}

export const PaymentStep = ({ onPaymentComplete }: PaymentStepProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const paymentMethods = [
    { id: "gpay", name: "Google Pay", icon: Smartphone, color: "from-blue-500 to-blue-600" },
    { id: "phonepe", name: "PhonePe", icon: Wallet, color: "from-purple-500 to-purple-600" },
    { id: "paytm", name: "Paytm", icon: CreditCard, color: "from-cyan-500 to-cyan-600" }
  ];

  const handlePayment = (method: string) => {
    setSelectedMethod(method);
    toast.success("Processing payment...");
    // Simulate payment processing
    setTimeout(() => {
      toast.success("Payment successful!");
      navigate("/registration-success");
    }, 2000);
  };

  const upiId = "ppsavani@upi";
  const amount = "50";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Payment Amount */}
      <Card className="bg-gradient-to-br from-primary to-accent text-white p-8 text-center">
        <div className="text-sm font-semibold mb-2 opacity-90">Registration Fee</div>
        <div className="text-5xl font-bold mb-2">₹{amount}</div>
        <div className="text-sm opacity-90">One-time payment for Mega Spark Exam 2025</div>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Button
                key={method.id}
                onClick={() => handlePayment(method.id)}
                disabled={selectedMethod !== null}
                className={`h-auto py-6 bg-gradient-to-r ${method.color} hover:opacity-90 text-white relative overflow-hidden group`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="h-8 w-8" />
                  <span className="font-semibold">{method.name}</span>
                </div>
                {selectedMethod === method.id && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or pay with</span>
        </div>
      </div>

      {/* UPI QR Code Option */}
      <Card className="border-2 border-accent/20 hover:shadow-hover transition-all">
        <div className="p-6">
          {!showQR ? (
            <Button
              onClick={() => setShowQR(true)}
              variant="outline"
              className="w-full h-auto py-6 border-2 border-accent hover:bg-accent/10"
              disabled={selectedMethod !== null}
            >
              <div className="flex flex-col items-center gap-2">
                <QrCode className="h-8 w-8 text-accent" />
                <span className="font-semibold text-lg">Scan UPI QR Code</span>
                <span className="text-xs text-muted-foreground">Use any UPI app to scan & pay</span>
              </div>
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-lg text-foreground mb-2">Scan QR Code to Pay</h4>
                <p className="text-sm text-muted-foreground">Scan using any UPI app</p>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="bg-white p-6 rounded-xl mx-auto w-fit">
                <div className="h-64 w-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 mx-auto text-primary mb-4" />
                    <div className="text-xs text-muted-foreground">QR Code</div>
                    <div className="text-sm font-semibold text-primary">{upiId}</div>
                  </div>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI ID:</span>
                    <span className="font-semibold text-accent">{upiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-accent">₹{amount}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  toast.success("Payment successful!");
                  navigate("/registration-success");
                }}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-6 text-lg font-semibold"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                I Have Completed Payment
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Info */}
      <Card className="bg-muted/50 border-border p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Secure Payment</p>
            <p>Your payment is processed securely. Registration will be confirmed immediately after successful payment.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
