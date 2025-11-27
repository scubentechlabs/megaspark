import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Download, ArrowLeft, Send, Edit } from "lucide-react";
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleEditDetails = (registration: Registration) => {
    setEditingRegistration({ ...registration });
    setEditDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    setConfirmDialogOpen(true);
  };

  const handleUpdateRegistration = async () => {
    if (!editingRegistration) return;

    setConfirmDialogOpen(false);
    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          student_name: editingRegistration.student_name,
          email: editingRegistration.email,
          standard: editingRegistration.standard,
          medium: editingRegistration.medium,
          exam_center: editingRegistration.exam_center,
          whatsapp_number: editingRegistration.whatsapp_number,
          state: editingRegistration.state,
          district: editingRegistration.district,
          school_name: editingRegistration.school_name,
          school_address: editingRegistration.school_address,
          school_medium: editingRegistration.school_medium,
          previous_year_percentage: editingRegistration.previous_year_percentage,
          date_of_birth: editingRegistration.date_of_birth,
          gender: editingRegistration.gender,
          address: editingRegistration.address,
          parent_first_name: editingRegistration.parent_first_name,
          parent_last_name: editingRegistration.parent_last_name,
          parent_email: editingRegistration.parent_email,
          parent_phone: editingRegistration.parent_phone,
          parent_name: editingRegistration.parent_name,
        })
        .eq("id", editingRegistration.id);

      if (updateError) throw updateError;

      // Regenerate hall ticket
      const { error: hallTicketError } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId: editingRegistration.id }
      });

      if (hallTicketError) throw hallTicketError;

      // Refresh registrations list
      const { data, error: fetchError } = await supabase
        .from("registrations")
        .select("*")
        .eq("mobile_number", mobileNumber);

      if (fetchError) throw fetchError;

      setRegistrations(data || []);
      setEditDialogOpen(false);
      setEditingRegistration(null);

      toast({
        title: "Success!",
        description: "Details updated successfully and new hall ticket generated",
      });
    } catch (error: any) {
      console.error("Error updating registration:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update registration",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
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
    @page { 
      size: A4;
      margin: 0; 
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 15px 25px; 
      background: white; 
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 12px; }
    .header h1 { font-size: 20px; color: #1a1a1a; margin: 3px 0; }
    .header h2 { font-size: 26px; color: #2563eb; margin: 5px 0; font-weight: bold; }
    .header h3 { font-size: 16px; color: #1a1a1a; margin: 3px 0; }
    .info-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .info-table td { padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; }
    .info-table td:first-child { font-weight: bold; background: #f5f5f5; width: 38%; }
    .exam-pattern-box { padding: 6px; background: #f0f0f0; margin-top: 3px; font-size: 11px; }
    .exam-pattern-box strong { display: block; margin-bottom: 3px; }
    .notes { margin: 12px 0; }
    .notes h4 { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
    .notes ol { padding-left: 18px; }
    .notes li { margin: 5px 0; line-height: 1.4; font-size: 11px; }
    .exam-center { margin: 10px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #2563eb; }
    .exam-center h4 { font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .exam-center p { font-size: 12px; }
    .footer { margin-top: 15px; text-align: center; padding: 10px; background: #f0f0f0; }
    .footer p { margin: 3px 0; font-size: 12px; }
    .footer-image { max-width: 60%; height: auto; margin: 10px 0; }
    @media print {
      body { padding: 15px 25px; }
      .no-print { display: none; }
      @page { size: A4; margin: 0; }
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
      <td>Exam Date :</td>
      <td><strong>${registration.exam_date ? new Date(registration.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'}</strong></td>
    </tr>
    <tr>
      <td>Reporting Date & Time :</td>
      <td><strong>${registration.exam_date ? `${new Date(registration.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at ${getReportingTime(registration.time_slot)}` : getReportingTime(registration.time_slot)}</strong></td>
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
      <li>પરીક્ષા તારીખ: ${registration.exam_date ? new Date(registration.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'} | રિપોર્ટિંગ સમય: ${getReportingTime(registration.time_slot)}</li>
      <li>Exam Date: ${registration.exam_date ? new Date(registration.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'} | Reporting Time: ${getReportingTime(registration.time_slot)}</li>
      <li>દરેક વિદ્યાર્થીએ આ હોલ ટિકિટ ની પ્રિન્ટ કાઢી સાથે રાખવી</li>
    </ol>
  </div>


  <div style="text-align: center; margin: 10px 0;">
    <img src="${hallTicketFooterImage}" class="footer-image" alt="PP Savani Banner" />
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
                            onClick={() => handleEditDetails(registration)}
                            variant="outline"
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Details
                          </Button>
                          <Button
                            onClick={() => handleDownloadHallTicket(registration)}
                            className="bg-accent hover:bg-accent/90 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update student information. Registration number, exam date, time slot, and mobile number cannot be changed.
            </DialogDescription>
          </DialogHeader>

          {editingRegistration && (
            <div className="grid gap-4 py-4">
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Registration Number</Label>
                  <Input value={formatRegistrationNumber(editingRegistration.registration_number)} disabled />
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile Number</Label>
                  <Input value={editingRegistration.mobile_number} disabled />
                </div>
                <div>
                  <Label className="text-muted-foreground">Exam Date</Label>
                  <Input value={editingRegistration.exam_date ? new Date(editingRegistration.exam_date).toLocaleDateString('en-GB') : 'TBA'} disabled />
                </div>
                <div>
                  <Label className="text-muted-foreground">Time Slot</Label>
                  <Input value={formatTimeSlot(editingRegistration.time_slot)} disabled />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_name">Student Name *</Label>
                  <Input
                    id="student_name"
                    value={editingRegistration.student_name}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, student_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingRegistration.email || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="standard">Standard *</Label>
                  <Select
                    value={editingRegistration.standard}
                    onValueChange={(value) => setEditingRegistration({ ...editingRegistration, standard: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5th">5th</SelectItem>
                      <SelectItem value="6th">6th</SelectItem>
                      <SelectItem value="7th">7th</SelectItem>
                      <SelectItem value="8th">8th</SelectItem>
                      <SelectItem value="9th">9th</SelectItem>
                      <SelectItem value="10th">10th</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={editingRegistration.gender || ""}
                    onValueChange={(value) => setEditingRegistration({ ...editingRegistration, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editingRegistration.date_of_birth || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={editingRegistration.whatsapp_number || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, whatsapp_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    maxLength={10}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editingRegistration.address || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editingRegistration.state || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={editingRegistration.district || ""}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, district: e.target.value })}
                  />
                </div>
              </div>

              {/* Parent Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Parent Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent_first_name">Parent First Name</Label>
                    <Input
                      id="parent_first_name"
                      value={editingRegistration.parent_first_name || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, parent_first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_last_name">Parent Last Name</Label>
                    <Input
                      id="parent_last_name"
                      value={editingRegistration.parent_last_name || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, parent_last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_email">Parent Email</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      value={editingRegistration.parent_email || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, parent_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent_phone">Parent Phone</Label>
                    <Input
                      id="parent_phone"
                      value={editingRegistration.parent_phone || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, parent_phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* School Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">School Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="school_name">School Name</Label>
                    <Input
                      id="school_name"
                      value={editingRegistration.school_name || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, school_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="school_medium">School Medium</Label>
                    <Select
                      value={editingRegistration.school_medium || ""}
                      onValueChange={(value) => setEditingRegistration({ ...editingRegistration, school_medium: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Gujarati">Gujarati</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="school_address">School Address</Label>
                    <Input
                      id="school_address"
                      value={editingRegistration.school_address || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, school_address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previous_year_percentage">Previous Year Percentage</Label>
                    <Input
                      id="previous_year_percentage"
                      value={editingRegistration.previous_year_percentage || ""}
                      onChange={(e) => setEditingRegistration({ ...editingRegistration, previous_year_percentage: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update & Generate New Hall Ticket"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Details Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the student details? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update all the modified information</li>
                <li>Generate a new hall ticket with updated details</li>
                <li>Send the new hall ticket via WhatsApp (if available)</li>
              </ul>
              <p className="mt-3 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRegistration} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Yes, Update Details"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
