import { Sparkles, Tag, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LimitedOffer = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Badge className="mb-4 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <Sparkles className="h-4 w-4 mr-2" />
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Exam Fee Waiver
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            First 1,000 Students Only!
          </p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl bg-card">
          <CardContent className="p-8 space-y-6">
            <p className="text-lg text-center text-muted-foreground leading-relaxed">
              Enroll now and save <span className="font-bold text-accent text-xl">₹50</span> on your exam registration fee. 
              This exclusive offer is available to the first 1,000 students who sign up.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border-l-4 border-primary">
              <div className="flex items-start gap-3 mb-4">
                <Tag className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    How to Claim Your Waiver:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Simply apply coupon code <code className="px-3 py-1 bg-background border border-primary/20 rounded font-mono text-primary font-bold text-lg">FIRST1000</code> during checkout to receive your ₹50 discount.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border-l-4 border-accent">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">
                    <strong className="text-accent">Important:</strong> If the coupon code doesn't apply, it means all 1,000 waiver spots have been claimed and the standard exam fee will apply.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-lg font-semibold text-foreground pt-4">
              Don't miss out—secure your spot today!
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};