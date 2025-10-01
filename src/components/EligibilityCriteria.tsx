import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";

const standards = [
  { grade: "5th", name: "Standard 5" },
  { grade: "6th", name: "Standard 6" },
  { grade: "7th", name: "Standard 7" },
  { grade: "8th", name: "Standard 8" },
  { grade: "9th", name: "Standard 9" },
  { grade: "10th", name: "Standard 10" }
];

export const EligibilityCriteria = () => {
  const [hoveredGujarati, setHoveredGujarati] = useState<number | null>(null);
  const [hoveredEnglish, setHoveredEnglish] = useState<number | null>(null);

  return (
    <section id="eligibility" className="py-20 bg-background relative overflow-hidden">
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
            Eligibility & <span className="text-accent">Criteria</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Open to students from Standard 5th to 10th in both Gujarati and English mediums
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Gujarati Medium Column */}
          <Card className="hover:shadow-hover transition-all duration-300 border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b-2 border-primary/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-primary">Gujarati Medium</div>
                  <div className="text-sm font-normal text-muted-foreground">ગુજરાતી માધ્યમ</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-3">
                {standards.map((standard, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredGujarati(idx)}
                    onMouseLeave={() => setHoveredGujarati(null)}
                    className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      hoveredGujarati === idx
                        ? 'bg-primary text-white shadow-lg scale-105 translate-x-2'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        hoveredGujarati === idx
                          ? 'bg-white text-primary scale-110'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}
                    >
                      {hoveredGujarati === idx ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="font-bold">{idx + 5}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-lg transition-colors ${
                        hoveredGujarati === idx ? 'text-white' : 'text-foreground'
                      }`}>
                        {standard.name}
                      </div>
                      <div className={`text-sm transition-colors ${
                        hoveredGujarati === idx ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        માનક {idx + 5}
                      </div>
                    </div>
                    <div
                      className={`transition-opacity duration-300 ${
                        hoveredGujarati === idx ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong className="text-primary">નોંધ:</strong> ગુજરાતી માધ્યમના તમામ વિદ્યાર્થીઓ આ પરીક્ષામાં ભાગ લઈ શકે છે.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* English Medium Column */}
          <Card className="hover:shadow-hover transition-all duration-300 border-2 border-accent/20">
            <CardHeader className="bg-gradient-to-br from-accent/10 to-accent/5 border-b-2 border-accent/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-accent">English Medium</div>
                  <div className="text-sm font-normal text-muted-foreground">આંગ્લ માધ્યમ</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-3">
                {standards.map((standard, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredEnglish(idx)}
                    onMouseLeave={() => setHoveredEnglish(null)}
                    className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      hoveredEnglish === idx
                        ? 'bg-accent text-white shadow-lg scale-105 translate-x-2'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        hoveredEnglish === idx
                          ? 'bg-white text-accent scale-110'
                          : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                      }`}
                    >
                      {hoveredEnglish === idx ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="font-bold">{idx + 5}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-lg transition-colors ${
                        hoveredEnglish === idx ? 'text-white' : 'text-foreground'
                      }`}>
                        {standard.name}
                      </div>
                      <div className={`text-sm transition-colors ${
                        hoveredEnglish === idx ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        Grade {idx + 5}
                      </div>
                    </div>
                    <div
                      className={`transition-opacity duration-300 ${
                        hoveredEnglish === idx ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-accent/5 rounded-xl border border-accent/20">
                <p className="text-sm text-foreground">
                  <strong className="text-accent">Note:</strong> All students studying in English medium from Standard 5 to 10 are eligible.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-12 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-3">General Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Students must be currently enrolled in Standards 5th to 10th</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>Both Gujarati and English medium students can participate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Valid student ID card or school bonafide certificate required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span>No age restrictions - eligibility based on current standard only</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
