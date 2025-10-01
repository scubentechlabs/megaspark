import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, CheckCircle2 } from "lucide-react";
import schoolBuilding from "@/assets/school-building.jpg";
import { useState } from "react";

const examDates = [
  { date: "7th December", day: "Sunday", time: "10:00 AM - 12:00 PM", status: "First Exam" },
  { date: "14th December", day: "Sunday", time: "10:00 AM - 12:00 PM", status: "Second Exam" },
  { date: "21st December", day: "Sunday", time: "10:00 AM - 12:00 PM", status: "Third Exam" },
  { date: "28th December", day: "Sunday", time: "10:00 AM - 12:00 PM", status: "Final Exam" }
];

export const ExamDatesVenue = () => {
  const [selectedDate, setSelectedDate] = useState(0);

  return (
    <section id="dates" className="py-20 bg-muted/30 relative overflow-hidden">
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
            Mark your calendar for all four exam dates throughout December 2025
          </p>
        </div>

        {/* Interactive Timeline */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            {/* Timeline Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {examDates.map((exam, idx) => (
                <Card
                  key={idx}
                  onClick={() => setSelectedDate(idx)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-hover ${
                    selectedDate === idx
                      ? 'border-2 border-accent shadow-card scale-105'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mb-3 h-14 w-14 mx-auto rounded-full flex items-center justify-center ${
                      selectedDate === idx
                        ? 'bg-accent text-white'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {selectedDate === idx ? (
                        <CheckCircle2 className="h-7 w-7" />
                      ) : (
                        <Calendar className="h-7 w-7" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${
                      selectedDate === idx ? 'text-accent' : 'text-foreground'
                    }`}>
                      {exam.date.split(' ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">{exam.day}</div>
                    <div className="text-xs font-semibold text-primary">{exam.status}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Date Details */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-primary">{examDates[selectedDate].date}</h3>
                        <p className="text-muted-foreground">{examDates[selectedDate].day}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-accent" />
                      <span className="font-semibold text-foreground">{examDates[selectedDate].time}</span>
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
            <p className="text-muted-foreground">P.P. Savani School Campus, Surat, Gujarat</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* School Photo */}
            <Card className="overflow-hidden hover:shadow-hover transition-all duration-300">
              <img
                src={schoolBuilding}
                alt="P.P. Savani School Campus"
                className="w-full h-[300px] object-cover"
              />
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-foreground mb-2">P.P. Savani School</h4>
                <p className="text-sm text-muted-foreground">
                  State-of-the-art facilities with air-conditioned examination halls and 
                  comfortable seating arrangements for all candidates.
                </p>
              </CardContent>
            </Card>

            {/* Google Map Embed */}
            <Card className="overflow-hidden hover:shadow-hover transition-all duration-300">
              <div className="relative h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.6614947091847!2d72.89814731493284!3d21.193534985903668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f2f6b5e6b85%3A0x7e0e1b5f5e6b5e6b!2sP.P.%20Savani%20School!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="P.P. Savani School Location"
                  className="rounded-t-lg"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      P.P. Savani School Campus<br />
                      ABRAMA - ORNA Road, Surat<br />
                      Gujarat, India - 394210
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground mb-2">Getting There</h4>
                  <p className="text-sm text-muted-foreground">
                    The venue is well-connected by public transport. Ample parking space is available 
                    for those coming by personal vehicles. Please arrive at least 30 minutes before 
                    the exam start time for smooth check-in.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
