import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface FinalCTAProps {
  onRegisterClick: () => void;
}

export const FinalCTA = ({ onRegisterClick }: FinalCTAProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Your Future Starts Here
          </h2>
          
          <p className="text-2xl md:text-3xl font-semibold text-primary mb-8">
            Don't Miss This Opportunity!
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students competing for scholarships worth lakhs. 
            Take the first step towards academic excellence today.
          </p>
          
          <Button 
            size="lg" 
            onClick={onRegisterClick}
            className="text-lg px-8 py-6 h-auto group shadow-lg hover:shadow-xl transition-all"
          >
            Register Now for ₹50
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Limited Seats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
