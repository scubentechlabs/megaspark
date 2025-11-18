import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Download, ArrowLeft, Send } from "lucide-react";
import logo from "@/assets/logo.png";
import hallTicketHeaderImage from "@/assets/hall-ticket-header.jpg";
import hallTicketFooterImage from "@/assets/hall-ticket-footer-new.jpg";
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

  const handleSendHallTicket = async (registrationId: string) => {
    try {
      toast({
        title: "Sending...",
        description: "Generating and sending hall ticket via WhatsApp",
      });

      const { data, error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: "Hall ticket sent successfully via WhatsApp",
        });
      } else {
        throw new Error(data?.error || 'Failed to send hall ticket');
      }
    } catch (error: any) {
      console.error("Error sending hall ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send hall ticket",
        variant: "destructive",
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

  const handleDownloadHallTicket = (registration: Registration) => {
    // Generate hall ticket HTML
    const hallTicketHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MEGA SPARK EXAM Hall Ticket - ${registration.registration_number}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; background: white; }
    .header { text-align: center; margin-bottom: 20px; }
    .header-image { width: 100%; max-width: 600px; margin-bottom: 15px; }
    .header h1 { font-size: 24px; color: #1a1a1a; margin: 5px 0; }
    .header h2 { font-size: 32px; color: #2563eb; margin: 10px 0; font-weight: bold; }
    .header h3 { font-size: 20px; color: #1a1a1a; margin: 5px 0; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border: 1px solid #ddd; font-size: 14px; }
    .info-table td:first-child { font-weight: bold; background: #f5f5f5; width: 40%; }
    .exam-pattern-box { padding: 10px; background: #f0f0f0; margin-top: 5px; }
    .exam-pattern-box strong { display: block; margin-bottom: 5px; }
    .notes { margin: 25px 0; }
    .notes h4 { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
    .notes ol { padding-left: 20px; }
    .notes li { margin: 8px 0; line-height: 1.6; font-size: 13px; }
    .exam-center { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #2563eb; }
    .exam-center h4 { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
    .footer { margin-top: 30px; text-align: center; padding: 15px; background: #f0f0f0; }
    .footer p { margin: 5px 0; font-size: 14px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>P.P. SAVANI GROUP</h1>
    <h2>MEGA SPARK EXAM 2025</h2>
    <h3>EXAMINATION HALL TICKET</h3>
  </div>

  <table class="info-table">
    <tr>
      <td>Student Name :</td>
      <td><strong>${registration.student_name}</strong></td>
    </tr>
    <tr>
      <td>Seat No :</td>
      <td><strong>${formatRegistrationNumber(registration.registration_number)}</strong></td>
    </tr>
    <tr>
      <td>Std :</td>
      <td><strong>${registration.standard}</strong></td>
    </tr>
    <tr>
      <td>Medium :</td>
      <td><strong>${formatMedium(registration.medium)}</strong></td>
    </tr>
    <tr>
      <td>Time Slot :</td>
      <td><strong>${formatTimeSlot(registration.time_slot)}</strong></td>
    </tr>
    <tr>
      <td>Reporting Time :</td>
      <td><strong>${getReportingTime(registration.time_slot)}</strong></td>
    </tr>
    <tr>
      <td>Exam Pattern :</td>
      <td>
        <strong>MCQ (Multiple Choice Questions)</strong>
        <div class="exam-pattern-box">
          <strong>Subjects / વિષયો:</strong>
          Science (વિજ્ઞાન), Maths (ગણિત), English (અંગ્રેજી)
        </div>
      </td>
    </tr>
  </table>

  <div class="exam-center">
    <h4>Exam Centre</h4>
    <p>PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150</p>
  </div>

  <div class="notes">
    <h4>નોંધ (Notes):</h4>
    <ol>
      <li>પરીક્ષાનો રિપોર્ટિંગ સમય ${getReportingTime(registration.time_slot)} છે</li>
      <li>The reporting time for the exam is ${getReportingTime(registration.time_slot)}</li>
      <li>દરેક વિદ્યાર્થીએ આ હોલ ટિકિટ ની પ્રિન્ટ કાઢી સાથે રાખવી</li>
    </ol>
  </div>


  <div style="text-align: center; margin: 20px 0;">
    <img src="${hallTicketFooterImage}" style="max-width: 70%; height: auto;" alt="PP Savani Banner" />
  </div>

  <div class="footer">
    <p><strong>MEGA SPARK EXAM COMMITTEE</strong></p>
    <p><em>Best Wishes for Your Examination! / તમારી પરીક્ષા માટે શુભેચ્છાઓ!</em></p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 15px 40px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(hallTicketHTML);
      printWindow.document.close();
      
      toast({
        title: "Hall Ticket Ready!",
        description: "Print or save the hall ticket as PDF from the new window",
      });
    } else {
      toast({
        title: "Error",
        description: "Please allow pop-ups to view the hall ticket",
        variant: "destructive",
      });
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
                          >
                            <Download className="h-4 w-4" />
                            Download Hall Ticket
                          </Button>
                          <Button
                            onClick={() => handleSendHallTicket(registration.id)}
                            variant="default"
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Get on WhatsApp
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
