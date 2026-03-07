import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ExternalLink, X } from "lucide-react";

const staticExamDates = [
  { label: "15 March 2026", day_name: "Sunday" },
  { label: "22 March 2026", day_name: "Sunday" },
];

const examCenters = [
  {
    name: "PP Savani CFE, Abrama – Surat",
    fullName: "PP Savani CFE – Abrama",
    address: "Abrama Rd, Mota Varachha, Surat, Gujarat 394150",
    mapUrl: "https://maps.app.goo.gl/Ro47DrhhPu9S7UWX6",
  },
];

export const ExamDatesVenue = () => {
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  const activeCenter = examCenters.find((c) => c.name === selectedCenter);

  return (
    <section id="dates" className="py-12 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            Exam Dates & <span className="text-accent">Venue</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mark your calendar for all exam dates in March 2026
          </p>
        </div>

        {/* Single Interactive Box with All Dates */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {staticExamDates.map((exam, idx) => {
                    const parts = exam.label.split(' ');
                    const dateNum = parts[0] || '';
                    const month = parts[1] || '';
                    return (
                      <div
                        key={idx}
                        className="text-center p-4 border-2 border-accent rounded-lg bg-background"
                      >
                        <div className="mb-3 h-14 w-14 mx-auto rounded-full flex items-center justify-center bg-accent/10 text-accent">
                          <Calendar className="h-7 w-7" />
                        </div>
                        <div className="text-2xl font-bold mb-1 text-foreground">{dateNum}</div>
                        <div className="text-sm text-muted-foreground mb-1">{exam.day_name || ''}</div>
                        <div className="text-sm font-semibold text-accent">{month}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-6 pt-6 border-t border-border">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border-2 border-accent/30 max-w-md w-full">
                      <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Morning Slot</p>
                        <p className="text-lg font-bold text-primary">9:00 AM - 10:00 AM</p>
                        <p className="text-xs text-accent font-semibold">Reporting: 8:00 AM</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative max-w-md mx-auto">
                    <div className="bg-[#fef9c3] p-6 rounded-lg shadow-lg border-l-4 border-accent rotate-1 transform hover:rotate-0 transition-transform">
                      <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent/20 rounded-full" />
                      <div className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-lg text-primary mb-1">Important!</p>
                          <p className="text-sm text-foreground">
                            Please arrive at your selected<br />
                            <span className="text-xl font-bold text-accent">Reporting Time</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Venue Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
              <MapPin className="h-8 w-8 text-accent" />
              Exam Centre Locations
            </h3>
            <p className="text-muted-foreground">3 Exam Centers across Surat</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {examCenters.map((center) => (
              <Card
                key={center.name}
                className={`overflow-hidden cursor-pointer transition-all duration-300 border-2 hover:shadow-hover ${
                  selectedCenter === center.name
                    ? "border-accent shadow-lg scale-[1.02]"
                    : "border-accent/20 hover:border-accent"
                }`}
                onClick={() =>
                  setSelectedCenter(selectedCenter === center.name ? null : center.name)
                }
              >
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-accent" />
                  </div>
                  <h4 className="text-xl font-bold text-primary mb-2">{center.name}</h4>
                  <p className="text-sm text-muted-foreground">{center.address}</p>
                  <p className="text-xs text-accent font-semibold mt-3">Click to view location →</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Address Detail Box */}
          {activeCenter && (
            <div className="animate-fade-in">
              <Card className="border-2 border-accent bg-gradient-to-br from-accent/5 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-primary mb-1">{activeCenter.fullName}</h4>
                        <p className="text-muted-foreground mb-3">📍 {activeCenter.address}</p>
                        <a
                          href={activeCenter.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open in Google Maps
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCenter(null)}
                      className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
