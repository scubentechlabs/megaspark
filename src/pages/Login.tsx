import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smartphone, Download, ArrowLeft, Send, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { formatMedium, formatRegistrationNumber } from "@/lib/formatters";

interface Registration {
  id: string;
  mobile_number: string;
  student_name: string;
  email: string;
  standard: string;
  medium: string;
  exam_center: string;
  exam_date: string;
  registration_number: string;
  hall_ticket_url: string | null;
  created_at: string;
  room_no: string | null;
  floor: string | null;
  building_name: string | null;
  exam_pattern: string | null;
  time_slot: string | null;
  whatsapp_number: string | null;
  state: string | null;
  district: string | null;
  school_name: string | null;
  school_address: string | null;
  school_medium: string | null;
  previous_year_percentage: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_name: string | null;
}

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error("Invalid Mobile Number", {
        description: "Please enter a valid 10-digit mobile number",
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
        toast.error("No Registrations Found", {
          description: "No registrations found for this mobile number",
        });
        setShowResults(false);
        setRegistrations([]);
      } else {
        setRegistrations(data);
        setShowResults(true);
        toast.success("Success!", {
          description: `Found ${data.length} registration(s) for this mobile number`,
        });
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Error", {
        description: "Failed to fetch registrations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendHallTicket = async (registrationId: string) => {
    try {
      toast.info("Sending...", {
        description: "Generating and sending hall ticket via WhatsApp",
      });

      const { data, error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Success", {
          description: "Hall ticket sent successfully via WhatsApp",
        });
      } else {
        throw new Error(data?.error || 'Failed to send hall ticket');
      }
    } catch (error: any) {
      console.error("Error sending hall ticket:", error);
      toast.error("Error", {
        description: error.message || "Failed to send hall ticket",
      });
    }
  };

  const formatTimeSlot = (slot: string | null) => {
    if (!slot) return 'TBA';
    if (slot.toLowerCase() === 'morning') return 'Morning Slot';
    if (slot.toLowerCase() === 'afternoon') return 'Afternoon Slot';
    return slot;
  };

  const getReportingTime = (slot: string | null) => {
    if (!slot) return 'TBA';
    if (slot.toLowerCase() === 'morning') return '8:00 AM';
    if (slot.toLowerCase() === 'afternoon') return '2:30 PM';
    return 'TBA';
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadHallTicket = async (registration: Registration) => {
    setDownloadingId(registration.id);
    try {
      // If hall ticket URL already exists, download directly
      if (registration.hall_ticket_url) {
        const link = document.createElement('a');
        link.href = registration.hall_ticket_url;
        link.target = '_blank';
        link.download = `hall-ticket-${registration.registration_number || registration.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Hall Ticket Downloaded!", {
          description: "Your hall ticket PDF has been downloaded.",
        });
        return;
      }

      // Generate hall ticket PDF via edge function
      toast.info("Generating PDF...", {
        description: "Please wait while your hall ticket is being generated.",
      });

      const { data, error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId: registration.id }
      });

      if (error) throw error;

      if (data?.success && data?.hallTicketUrl) {
        // Update local state with the new URL
        setRegistrations(prev => prev.map(r => 
          r.id === registration.id ? { ...r, hall_ticket_url: data.hallTicketUrl } : r
        ));

        const link = document.createElement('a');
        link.href = data.hallTicketUrl;
        link.target = '_blank';
        link.download = `hall-ticket-${registration.registration_number || registration.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Hall Ticket Downloaded!", {
          description: "Your hall ticket PDF has been downloaded.",
        });
      } else {
        throw new Error(data?.error || 'Failed to generate hall ticket');
      }
    } catch (error: any) {
      console.error("Error downloading hall ticket:", error);
      toast.error("Download Failed", {
        description: error.message || "Failed to download hall ticket. Please try again.",
      });
    } finally {
      setDownloadingId(null);
    }
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
                            Reg. No: <span className="font-semibold text-primary">{formatRegistrationNumber(registration.registration_number)}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class {registration.standard} | {formatMedium(registration.medium)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Center: {registration.exam_center === "To be announced" 
                              ? "PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150" 
                              : registration.exam_center}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => handleDownloadHallTicket(registration)}
                            className="bg-accent hover:bg-accent/90 gap-2"
                            disabled={downloadingId === registration.id}
                          >
                            {downloadingId === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {downloadingId === registration.id ? 'Generating...' : 'Download'}
                          </Button>
                          <Button
                            onClick={() => handleSendHallTicket(registration.id)}
                            variant="default"
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at digital.cfe.ppsavani@gmail.com or call 9978651002 / 3 / 4 / 5</p>
        </div>
      </div>
    </div>
  );
}
