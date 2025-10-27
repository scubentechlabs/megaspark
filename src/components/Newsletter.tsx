import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast.error("Already subscribed!", {
            description: "This email is already registered for updates."
          });
        } else {
          throw error;
        }
      } else {
        toast.success("Thank you for subscribing!", {
          description: "You'll receive updates about scholarships and opportunities."
        });
        setEmail("");
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error("Subscription failed", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Newsletter</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-primary">
            Submit For Updated
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Stay informed about new scholarship opportunities and important updates
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 rounded-full border-2"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-12 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
