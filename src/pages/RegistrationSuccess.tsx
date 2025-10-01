import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Calendar, MapPin, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  const registrationDetails = {
    registrationId: "MSE2025" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    studentName: "Student Name", // This would come from form data
    examDate: "7th December 2025",
    examTime: "10:00 AM - 12:00 PM",
    reportingTime: "8:00 AM",
    venue: "P.P. Savani School Campus, Surat"
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardContent className="p-8 md:p-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-scale-in">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
              Congratulations!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your registration is confirmed
            </p>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="P.P. SAVANI CFE" className="h-16 w-auto" />
          </div>

          {/* Registration Details */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 mb-8">
            <CardContent className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Registration ID</div>
                <div className="text-2xl font-bold text-accent">{registrationDetails.registrationId}</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Exam Date</div>
                    <div className="font-semibold text-foreground">{registrationDetails.examDate}</div>
                    <div className="text-sm text-muted-foreground">{registrationDetails.examTime}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Venue</div>
                    <div className="font-semibold text-foreground">{registrationDetails.venue}</div>
                  </div>
                </div>
              </div>

              <Card className="bg-[#fef9c3] border-l-4 border-accent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <strong className="text-primary">Important:</strong>
                  </div>
                  <p className="text-sm text-foreground">
                    Please report to the exam center by <strong className="text-accent">{registrationDetails.reportingTime}</strong>. 
                    Bring a valid ID proof and your registration ID.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-4 mb-8">
            <h3 className="font-bold text-lg text-foreground">What's Next?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Check Your Email</div>
                  <div className="text-sm text-muted-foreground">
                    A confirmation email with admit card has been sent to your registered email address
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Download Study Material</div>
                  <div className="text-sm text-muted-foreground">
                    Access syllabus and sample papers to prepare for the exam
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Prepare for Exam Day</div>
                  <div className="text-sm text-muted-foreground">
                    Review exam pattern, timings, and venue location before the exam date
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-6 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Admit Card
            </Button>

            <div className="grid md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-2 py-6"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
              <Button
                variant="outline"
                className="border-2 py-6"
              >
                Download Study Material
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <Card className="mt-8 bg-muted/50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-foreground mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>info@ppsavani.edu.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;
