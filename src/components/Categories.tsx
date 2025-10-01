import { Card, CardContent } from "@/components/ui/card";
import { Shield, Globe, Building, Heart, FlaskConical, FileCheck } from "lucide-react";

const categories = [
  {
    icon: Shield,
    title: "Private",
    description: "Private Scholarships",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Globe,
    title: "International",
    description: "International Scholarships",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Building,
    title: "Organizational",
    description: "Organizational Scholarships",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: Heart,
    title: "Aid",
    description: "Aid Scholarships",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: FlaskConical,
    title: "Research",
    description: "Research Scholarships",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: FileCheck,
    title: "Official Bond",
    description: "Official Bond Scholarships",
    color: "bg-indigo-100 text-indigo-600"
  }
];

export const Categories = () => {
  return (
    <section id="category" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wide">Categories</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">
            Category Of Each <span className="text-primary">Scholarship</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card
                key={idx}
                className="bg-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border-border"
              >
                <CardContent className="p-8 text-center">
                  <div className={`mx-auto mb-4 h-16 w-16 rounded-2xl ${category.color} flex items-center justify-center`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
