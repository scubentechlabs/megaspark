import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Eye, X, ExternalLink } from "lucide-react";

const downloadItems = [
  {
    id: "syllabus",
    icon: BookOpen,
    title: "Exam Syllabus",
    subtitle: "Complete syllabus for all standards",
    description: "Comprehensive syllabus covering all topics for Standards 5-10 in both Gujarati and English mediums.",
    color: "from-primary to-primary/80",
    driveLink: "https://drive.google.com/drive/folders/1GUQk1vQbBLpGWPB55S0GKs0CcQhdVJcn?usp=sharing",
    previewContent: [
      "Mathematics: Algebra, Geometry, Arithmetic",
      "Science: Physics, Chemistry, Biology",
      "English/Gujarati: Grammar, Comprehension",
      "Social Studies: History, Geography, Civics",
      "General Knowledge & Current Affairs"
    ]
  },
  {
    id: "exam-pattern",
    icon: FileText,
    title: "Exam Pattern",
    subtitle: "Previous year question patterns",
    description: "Exam pattern to help you understand the exam structure and difficulty level.",
    color: "from-accent to-accent/80",
    driveLink: "https://drive.google.com/drive/folders/1GUQk1vQbBLpGWPB55S0GKs0CcQhdVJcn?usp=sharing",
    previewContent: [
      "Section A: Multiple Choice Questions (40 marks)",
      "Section B: Short Answer Questions (30 marks)",
      "Section C: Long Answer Questions (30 marks)",
      "Total Duration: 2 Hours",
      "Marking Scheme & Instructions included"
    ]
  }
];

export const DownloadGuide = () => {
  const handleViewPDF = (driveLink: string) => {
    window.open(driveLink, '_blank');
  };

  return (
    <section id="about" className="py-12 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Study Materials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            View <span className="text-accent">Exam Guide</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get comprehensive study materials to prepare for the Mega Spark Exam
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {downloadItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Card
                key={item.id}
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent/20 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewPDF(item.driveLink)}
                    className={`w-full bg-gradient-to-r ${item.color} hover:opacity-90 text-white shadow-lg`}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    View PDF
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <Card className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  If you face any issues viewing these materials, please contact us at{" "}
                  <a href="mailto:digital.cfe.ppsavani@gmail.com" className="text-accent font-semibold hover:underline">
                    digital.cfe.ppsavani@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
