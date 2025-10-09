import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import schoolBuilding from "@/assets/school-building.webp";

const examDates = [
  { date: "30th November", day: "Sunday", time: "8:00 AM - 12:00 PM" },
  { date: "7th December", day: "Sunday", time: "8:00 AM - 12:00 PM" },
  { date: "14th December", day: "Sunday", time: "8:00 AM - 12:00 PM" },
  { date: "28th December", day: "Sunday", time: "8:00 AM - 12:00 PM" }
];

export const ExamDatesVenue = () => {
  return (
    <section id="dates" className="py-12 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
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
            Mark your calendar for all exam dates in November and December 2025
          </p>
        </div>

        {/* Single Interactive Box with All Dates */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  {examDates.map((exam, idx) => (
                    <div
                      key={idx}
                      className="text-center p-4 border-2 border-accent rounded-lg bg-background"
                    >
                      <div className="mb-3 h-14 w-14 mx-auto rounded-full flex items-center justify-center bg-accent/10 text-accent">
                        <Calendar className="h-7 w-7" />
                      </div>
                      <div className="text-2xl font-bold mb-1 text-foreground">
                        {exam.date.split(' ')[0]}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{exam.day}</div>
                      <div className="text-sm font-semibold text-accent">{exam.date.split(' ')[1]}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exam Time</p>
                      <p className="text-xl font-bold text-primary">8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  
                  {/* Sticky Note Style Callout */}
                  <div className="relative">
                    <div className="bg-[#fef9c3] p-6 rounded-lg shadow-lg border-l-4 border-accent rotate-1 transform hover:rotate-0 transition-transform">
                      <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent/20 rounded-full" />
                      <div className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-lg text-primary mb-1">Important!</p>
                          <p className="text-sm text-foreground">
                            Reporting starts at<br />
                            <span className="text-2xl font-bold text-accent">8:00 AM</span> onwards
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
              Exam Centre Location
            </h3>
            <p className="text-muted-foreground">P.P. Savani CFE, Abrama, Surat, Gujarat</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* School Photo */}
            <Card className="overflow-hidden hover:shadow-hover transition-all duration-300">
              <img
                src={schoolBuilding}
                alt="P.P. Savani CFE Campus"
                className="w-full h-[300px] object-cover"
              />
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-foreground mb-2">P.P. Savani CFE</h4>
                <p className="text-sm text-muted-foreground">
                  State-of-the-art facilities with air-conditioned examination halls and 
                  comfortable seating arrangements for all candidates.
                </p>
              </CardContent>
            </Card>

            {/* Google Map with Clickable Link */}
            <Card 
              className="overflow-hidden hover:shadow-hover transition-all duration-300 cursor-pointer"
              onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=P.P.+Savani+CFE+Abrama+Surat+Gujarat', '_blank')}
            >
              <div className="relative h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.6614947091847!2d72.89814731493284!3d21.193534985903668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f2f6b5e6b85%3A0x7e0e1b5f5e6b5e6b!2sP.P.%20Savani%20School!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="P.P. Savani CFE Location"
                  className="rounded-t-lg pointer-events-none"
                />
                <div className="absolute inset-0 bg-transparent hover:bg-primary/5 transition-colors" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Click for Directions</h4>
                    <p className="text-sm text-muted-foreground">
                      P.P. Savani CFE<br />
                      Abrama, Surat<br />
                      Gujarat, India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
