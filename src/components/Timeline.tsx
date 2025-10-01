import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const events = [
  { date: "March 1, 2025", event: "Application Period Opens", status: "current" },
  { date: "May 31, 2025", event: "Application Deadline", status: "upcoming" },
  { date: "June 15, 2025", event: "Shortlist Announced", status: "upcoming" },
  { date: "July 1-15, 2025", event: "Interview Period", status: "upcoming" },
  { date: "August 1, 2025", event: "Final Results Published", status: "upcoming" },
  { date: "September 2025", event: "Scholarship Disbursement", status: "upcoming" }
];

export const Timeline = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Important Dates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mark your calendar and stay on track throughout the application process
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-success hidden md:block" />
            
            <div className="space-y-8">
              {events.map((item, idx) => (
                <Card 
                  key={idx} 
                  className={`ml-0 md:ml-20 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                    item.status === 'current' 
                      ? 'border-l-primary bg-primary/5' 
                      : 'border-l-muted'
                  }`}
                >
                  <CardContent className="p-6 relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[5.5rem] top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-4 border-background flex items-center justify-center hidden md:flex ${
                      item.status === 'current' 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`}>
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className={`text-sm font-semibold ${
                            item.status === 'current' 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                          }`}>
                            {item.date}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{item.event}</h3>
                      </div>
                      
                      {item.status === 'current' && (
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          Active Now
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
