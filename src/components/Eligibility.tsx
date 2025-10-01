import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const criteria = [
  "Be a citizen or permanent resident of the country",
  "Have a minimum GPA of 3.5 or equivalent academic standing",
  "Be enrolled or planning to enroll in an accredited university",
  "Demonstrate financial need (household income below threshold)",
  "Show leadership potential through extracurricular activities",
  "Submit two letters of recommendation from teachers or mentors",
  "Write a compelling personal statement (500-1000 words)",
  "Have no previous full scholarship awards from other organizations"
];

export const Eligibility = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Eligibility Criteria
            </h2>
            <p className="text-xl text-muted-foreground">
              Make sure you meet these requirements before applying
            </p>
          </div>
          
          <Card className="shadow-xl border-border">
            <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
              <CardTitle className="text-2xl">Requirements Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {criteria.map((criterion, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-foreground leading-relaxed">{criterion}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground">
                  <strong className="text-accent">Note:</strong> Meeting the eligibility criteria does not guarantee selection. 
                  Applications will be reviewed holistically, considering academic excellence, leadership potential, 
                  and alignment with our program values.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
