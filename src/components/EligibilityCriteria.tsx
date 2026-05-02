import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { useActiveStandards } from "@/hooks/useStandards";

export const EligibilityCriteria = () => {
  const { data: standards = [], isLoading } = useActiveStandards();

  return (
    <section id="eligibility" className="py-12 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Who Can Participate?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            Eligibility
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Open to students in both Gujarati and English mediums
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Gujarati Medium Column */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div className="text-primary">Gujarati Medium</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : standards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No standards available</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {standards.map((standard) => (
                    <div
                      key={standard.id}
                      className="flex items-center justify-center p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <span className="font-semibold text-sm text-foreground">{standard.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


          {/* English Medium Column */}
          <Card className="border-2 border-accent/20">
            <CardHeader className="bg-gradient-to-br from-accent/10 to-accent/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div className="text-accent">English Medium</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
              ) : standards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No standards available</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {standards.map((standard) => (
                    <div
                      key={standard.id}
                      className="flex items-center justify-center p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <span className="font-semibold text-sm text-foreground">{standard.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
