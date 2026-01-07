import { Card } from "@/components/ui/card";
import { NewRegistrationForm } from "./NewRegistrationForm";

export const RegistrationSection = () => {
  return (
    <section id="registration-section" className="py-12 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Register Now</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            Complete Your <span className="text-accent">Registration</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill in the details below to secure your spot in the Mega Spark National Champion
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-2 border-primary/10">
            <NewRegistrationForm />
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-primary mb-2">🔒</div>
              <div className="font-semibold text-foreground mb-1">Secure Registration</div>
              <div className="text-sm text-muted-foreground">Your data is protected with encryption</div>
            </Card>
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-accent mb-2">⚡</div>
              <div className="font-semibold text-foreground mb-1">Instant Confirmation</div>
              <div className="text-sm text-muted-foreground">Get confirmation immediately after registration</div>
            </Card>
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-primary mb-2">💯</div>
              <div className="font-semibold text-foreground mb-1">100% Genuine</div>
              <div className="text-sm text-muted-foreground">Official PP Savani Cfe registration</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
