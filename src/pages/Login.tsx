import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Download, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

interface Registration {
  id: string;
  mobile_number: string;
  student_name: string;
  email: string;
  standard: string;
  medium: string;
  exam_center: string;
  registration_number: string;
  hall_ticket_url: string | null;
  created_at: string;
}

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("mobile_number", mobileNumber);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Registrations Found",
          description: "No registrations found for this mobile number",
          variant: "destructive",
        });
        setShowResults(false);
        setRegistrations([]);
      } else {
        setRegistrations(data);
        setShowResults(true);
        toast({
          title: "Success!",
          description: `Found ${data.length} registration(s) for this mobile number`,
        });
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHallTicket = (registration: Registration) => {
    // Generate hall ticket data
    const hallTicketData = `
      MEGA SPARK EXAM - HALL TICKET
      ================================
      
      Registration Number: ${registration.registration_number}
      Student Name: ${registration.student_name}
      Standard: ${registration.standard}
      Medium: ${registration.medium}
      Exam Center: ${registration.exam_center}
      Mobile: ${registration.mobile_number}
      Email: ${registration.email}
      
      Registration Date: ${new Date(registration.created_at).toLocaleDateString()}
      
      ================================
      Please bring this hall ticket on exam day
    `;

    // Create and download as text file
    const blob = new Blob([hallTicketData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hall-ticket-${registration.registration_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Hall ticket has been downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Smartphone className="h-8 w-8 text-primary" />
              Download Hall Ticket
            </CardTitle>
            <CardDescription className="text-lg">
              Enter your registered mobile number to access your hall tickets
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-foreground mb-2">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="text-lg h-12"
                  maxLength={10}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Checking..." : "Find My Registrations"}
              </Button>
            </form>

            {showResults && registrations.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-foreground">Your Registrations:</h3>
                {registrations.map((registration) => (
                  <Card key={registration.id} className="border-2 border-accent/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-foreground">
                            {registration.student_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reg. No: <span className="font-semibold text-primary">{registration.registration_number}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class {registration.standard} | {registration.medium} Medium
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Center: {registration.exam_center}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDownloadHallTicket(registration)}
                          className="bg-accent hover:bg-accent/90 gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Hall Ticket
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at info@ppsavani.edu.in</p>
        </div>
      </div>
    </div>
  );
}
