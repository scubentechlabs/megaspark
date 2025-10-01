import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Eye, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const downloadItems = [
  {
    id: "syllabus",
    icon: BookOpen,
    title: "Exam Syllabus",
    subtitle: "Complete syllabus for all standards",
    description: "Comprehensive syllabus covering all topics for Standards 5-10 in both Gujarati and English mediums.",
    fileSize: "2.5 MB",
    pages: "15 Pages",
    color: "from-primary to-primary/80",
    previewContent: [
      "Mathematics: Algebra, Geometry, Arithmetic",
      "Science: Physics, Chemistry, Biology",
      "English/Gujarati: Grammar, Comprehension",
      "Social Studies: History, Geography, Civics",
      "General Knowledge & Current Affairs"
    ]
  },
  {
    id: "sample-paper",
    icon: FileText,
    title: "Sample Paper",
    subtitle: "Previous year question patterns",
    description: "Sample question papers to help you understand the exam pattern and difficulty level.",
    fileSize: "1.8 MB",
    pages: "10 Pages",
    color: "from-accent to-accent/80",
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
  const [previewItem, setPreviewItem] = useState<string | null>(null);

  const handleDownload = (itemTitle: string) => {
    toast.success(`Downloading ${itemTitle}...`, {
      description: "Your download will begin shortly"
    });
    // Here you would trigger actual download
  };

  const currentPreview = downloadItems.find(item => item.id === previewItem);

  return (
    <section id="about" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Study Materials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            Download <span className="text-accent">Exam Guide</span>
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

                  {/* File Info */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{item.pages}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{item.fileSize}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDownload(item.title)}
                      className={`flex-1 bg-gradient-to-r ${item.color} hover:opacity-90 text-white shadow-lg`}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPreviewItem(item.id)}
                      className="border-2 hover:bg-secondary"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Quick Preview Tooltip */}
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Click <Eye className="inline h-3 w-3" /> to preview contents before downloading
                    </p>
                  </div>
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
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  If you face any issues downloading these materials, please contact us at{" "}
                  <a href="mailto:support@ppsavani.edu.in" className="text-accent font-semibold hover:underline">
                    support@ppsavani.edu.in
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewItem && currentPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <CardContent className="p-0">
              {/* Modal Header */}
              <div className={`p-6 bg-gradient-to-r ${currentPreview.color} text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <currentPreview.icon className="h-8 w-8" />
                    <div>
                      <h3 className="text-2xl font-bold">{currentPreview.title}</h3>
                      <p className="text-white/80 text-sm">{currentPreview.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewItem(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <h4 className="text-xl font-bold text-foreground mb-4">Contents Preview</h4>
                <p className="text-muted-foreground mb-6">
                  {currentPreview.description}
                </p>

                <div className="space-y-3 mb-8">
                  {currentPreview.previewContent.map((content, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <p className="text-foreground">{content}</p>
                    </div>
                  ))}
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{currentPreview.pages}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{currentPreview.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      handleDownload(currentPreview.title);
                      setPreviewItem(null);
                    }}
                    className={`flex-1 bg-gradient-to-r ${currentPreview.color} hover:opacity-90 text-white text-lg py-6`}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewItem(null)}
                    className="px-8 py-6"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};
