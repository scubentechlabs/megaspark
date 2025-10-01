import { Card, CardContent } from "@/components/ui/card";
import { School, Plane, BookOpen } from "lucide-react";

const features = [
  {
    icon: School,
    title: "Full College Cost",
    description: "Comprehensive fees for students during the course of study"
  },
  {
    icon: Plane,
    title: "Transportation Costs",
    description: "The cost for each student's round trip from home to campus"
  },
  {
    icon: BookOpen,
    title: "Learning Equipment",
    description: "All equipment to support learning activities for each student"
  }
];

export const About = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">About Us</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 text-primary">
              Free <span className="text-accent">Scholarship</span>
              <br />
              Provider By P.P. SAVANI CFE
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have the opportunity to go to school or college without thinking about the cost? 
              Just focus on studying and assignments given
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="bg-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border-border"
                >
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
