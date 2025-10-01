import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Briefcase, Globe, Award, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Full Tuition Coverage",
    description: "Complete coverage of tuition fees for your entire degree program at top universities."
  },
  {
    icon: Users,
    title: "Mentorship Program",
    description: "Connect with industry leaders and alumni who will guide your academic and career journey."
  },
  {
    icon: Briefcase,
    title: "Career Development",
    description: "Exclusive internship opportunities and job placements with leading companies."
  },
  {
    icon: Globe,
    title: "International Exposure",
    description: "Study abroad opportunities and global networking events to expand your horizons."
  },
  {
    icon: Award,
    title: "Recognition & Awards",
    description: "Annual recognition ceremonies and certificate of excellence for your achievements."
  },
  {
    icon: TrendingUp,
    title: "Leadership Training",
    description: "Workshops and seminars focused on developing essential leadership skills."
  }
];

export const Benefits = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Apply for Our Scholarship?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            More than just financial support—a complete ecosystem for your success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={idx} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border bg-gradient-card"
              >
                <CardContent className="p-8">
                  <div className="mb-4 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
