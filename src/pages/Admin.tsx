import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, LogOut, Edit, Printer, Users, Calendar } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import hallTicketHeaderImage from "@/assets/hall-ticket-header.jpg";
import hallTicketFooterImage from "@/assets/hall-ticket-footer.png";

interface Registration {
  id: string;
  mobile_number: string;
  student_name: string;
  email: string | null;
  standard: string;
  medium: string;
  exam_center: string;
  registration_number: string;
  hall_ticket_url: string | null;
  created_at: string;
  parent_name: string | null;
  whatsapp_number: string | null;
  district: string | null;
  state: string | null;
  school_name: string | null;
  school_medium: string | null;
  previous_year_percentage: string | null;
  preferred_exam_date: string | null;
  exam_date: string | null;
  room_no: string | null;
  floor: string | null;
  building_name: string | null;
  exam_pattern: string | null;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    room_no: "",
    floor: "",
    building_name: "",
    exam_pattern: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchRegistrations();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = registrations.filter(
        (reg) =>
          reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.mobile_number.includes(searchTerm) ||
          reg.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRegistrations(filtered);
    } else {
      setFilteredRegistrations(registrations);
    }
  }, [searchTerm, registrations]);


  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      setFilteredRegistrations(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} registrations`,
      });
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadHallTicket = (reg: Registration) => {
    const hallTicketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hall Ticket - ${reg.registration_number}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header-image { width: 100%; max-width: 600px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #000; }
          .header h2 { margin: 5px 0; font-size: 18px; color: #333; }
          .header p { margin: 5px 0; font-size: 14px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px; border: 1px solid #000; }
          .info-table td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
          .exam-pattern-box { padding: 10px; background: #f0f0f0; margin-top: 5px; }
          .exam-pattern-box strong { display: block; margin-bottom: 5px; }
          .notes { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #000; }
          .notes h3 { margin-top: 0; }
          .notes ul { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 MEGA SPARK EXAM 2025 🌟</h1>
            <h2>મેગા સ્પાર્ક પરીક્ષા - 2025</h2>
            <p><strong>HALL TICKET / પ્રવેશ પત્ર</strong></p>
          </div>
          
          <table class="info-table">
            <tr>
              <td>Registration Number<br>નોંધણી નંબર</td>
              <td><strong style="font-size: 18px;">${reg.registration_number}</strong></td>
            </tr>
            <tr>
              <td>Student Name<br>વિદ્યાર્થીનું નામ</td>
              <td>${reg.student_name}</td>
            </tr>
            <tr>
              <td>Parent Name<br>વાલીનું નામ</td>
              <td>${reg.parent_name || 'N/A'}</td>
            </tr>
            <tr>
              <td>WhatsApp Number<br>વોટ્સએપ નંબર</td>
              <td>${reg.whatsapp_number || 'N/A'}</td>
            </tr>
            <tr>
              <td>State<br>રાજ્ય</td>
              <td>${reg.state || 'N/A'}</td>
            </tr>
            <tr>
              <td>District<br>જિલ્લો</td>
              <td>${reg.district || 'N/A'}</td>
            </tr>
            <tr>
              <td>Standard<br>ધોરણ</td>
              <td>${reg.standard}</td>
            </tr>
            <tr>
              <td>Medium<br>માધ્યમ</td>
              <td>${reg.medium === 'gujarati' ? 'ગુજરાતી (Gujarati)' : 'English (આંગ્લ)'}</td>
            </tr>
            <tr>
              <td>School Name<br>શાળાનું નામ</td>
              <td>${reg.school_name || 'N/A'}</td>
            </tr>
            <tr>
              <td>School Medium<br>શાળા માધ્યમ</td>
              <td>${reg.school_medium ? (reg.school_medium === 'gujarati' ? 'Gujarati' : 'English') : 'N/A'}</td>
            </tr>
            <tr>
              <td>Previous Year %<br>પાછલા વર્ષની ટકાવારી</td>
              <td>${reg.previous_year_percentage || 'N/A'}</td>
            </tr>
            <tr>
              <td>Preferred Exam Date<br>પસંદગીની પરીક્ષા તારીખ</td>
              <td>${reg.preferred_exam_date ? (() => {
                const date = new Date(reg.preferred_exam_date);
                const day = date.getDate();
                const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
                return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }).replace(/\d+/, day + suffix);
              })() : 'N/A'}</td>
            </tr>
            <tr>
              <td>Mobile Number<br>મોબાઇલ નંબર</td>
              <td>${reg.mobile_number}</td>
            </tr>
            <tr>
              <td>Email Address<br>ઇમેઇલ સરનામું</td>
              <td>${reg.email || 'N/A'}</td>
            </tr>
            <tr>
              <td>Exam Date<br>પરીક્ષા તારીખ</td>
              <td>${reg.exam_date ? (() => {
                const date = new Date(reg.exam_date);
                const day = date.getDate();
                const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
                return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long' }).replace(/\d+/, day + suffix);
              })() : 'To be announced'}</td>
            </tr>
            <tr>
              <td>Exam Pattern<br>પરીક્ષા પેટર્ન</td>
              <td>
                <strong>MCQ (Multiple Choice Questions)</strong>
                <div class="exam-pattern-box">
                  <strong>Subjects / વિષયો:</strong>
                  Science (વિજ્ઞાન), Maths (ગણિત), English (અંગ્રેજી)
                </div>
              </td>
            </tr>
            <tr>
              <td>Exam Center<br>પરીક્ષા કેન્દ્ર</td>
              <td>P P Savani Chaitanya Vidya Sankul<br>Mota Varachha-Abrama Road, Abrama, Kamrej,<br>Surat-394150. (Gujarat) India.</td>
            </tr>
          </table>

          <div class="notes">
            <h3>Notes / નોંધ:</h3>
            <ul>
              <li>પરીક્ષાનો રિપોર્ટિંગ સમય સવારે 8:00 કલાકે રહેશે</li>
              <li>દરેક વિદ્યાર્થીએ આ હોલ ટિકિટ ની પ્રિન્ટ કાઢી સાથે રાખવી</li>
            </ul>
          </div>


          <div style="text-align: center; margin: 20px 0;">
            <img src="${hallTicketFooterImage}" style="max-width: 100%; height: auto;" alt="PP Savani Banner" />
          </div>

          <div class="footer">
            <p><strong>MEGA SPARK EXAM COMMITTEE</strong></p>
            <p><em>Best Wishes for Your Examination! / તમારી પરીક્ષા માટે શુભેચ્છાઓ!</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(hallTicketHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      
      toast({
        title: "Hall Ticket Ready",
        description: "Opening print dialog for hall ticket",
      });
    } else {
      toast({
        title: "Error",
        description: "Please allow popups to download hall ticket",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Registration Number",
      "Student Name",
      "Parent Name",
      "Mobile Number",
      "WhatsApp Number",
      "Email",
      "District",
      "City/Village",
      "School Name",
      "School Medium",
      "Standard",
      "Previous Year %",
      "Preferred Exam Date",
      "Exam Date",
      "Medium",
      "Exam Center",
      "Room No",
      "Floor",
      "Building Name",
      "Exam Pattern",
      "Registration Date",
    ];

    const csvData = filteredRegistrations.map((reg) => [
      reg.registration_number,
      reg.student_name,
      reg.parent_name || 'N/A',
      reg.mobile_number,
      reg.whatsapp_number || 'N/A',
      reg.email || 'N/A',
      reg.state || 'N/A',
      reg.district || 'N/A',
      reg.school_name || 'N/A',
      reg.school_medium || 'N/A',
      reg.standard,
      reg.previous_year_percentage || 'N/A',
      reg.preferred_exam_date ? new Date(reg.preferred_exam_date).toLocaleDateString() : 'N/A',
      reg.exam_date ? new Date(reg.exam_date).toLocaleDateString() : 'N/A',
      reg.medium,
      reg.exam_center,
      reg.room_no || 'N/A',
      reg.floor || 'N/A',
      reg.building_name || 'N/A',
      reg.exam_pattern || 'N/A',
      new Date(reg.created_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Registration data has been exported to CSV",
    });
  };

  const printRegistrations = () => {
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Registration Data - MEGA SPARK EXAM 2025</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header p { margin: 5px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; font-size: 9px; }
          td { font-size: 9px; }
          .footer { margin-top: 20px; text-align: center; font-size: 9px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEGA SPARK EXAM 2025 - Registration Data</h1>
          <p>Total Registrations: ${filteredRegistrations.length} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Reg. No.</th>
              <th>Student Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Standard</th>
              <th>Medium</th>
              <th>District</th>
              <th>School</th>
              <th>Exam Date</th>
              <th>Room</th>
              <th>Floor</th>
              <th>Building</th>
              <th>Pattern</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRegistrations.map(reg => `
              <tr>
                <td>${reg.registration_number}</td>
                <td>${reg.student_name}</td>
                <td>${reg.mobile_number}</td>
                <td>${reg.email || 'N/A'}</td>
                <td>${reg.standard}</td>
                <td>${reg.medium}</td>
                <td>${reg.district || 'N/A'}</td>
                <td>${reg.school_name || 'N/A'}</td>
                <td>${reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}</td>
                <td>${reg.room_no || 'N/A'}</td>
                <td>${reg.floor || 'N/A'}</td>
                <td>${reg.building_name || 'N/A'}</td>
                <td>${reg.exam_pattern || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>MEGA SPARK EXAM COMMITTEE | Website: www.megaspark.com</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      
      toast({
        title: "Print Ready",
        description: "Opening print dialog for registration data",
      });
    } else {
      toast({
        title: "Error",
        description: "Please allow popups to print registration data",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    const total = registrations.length;
    const byStandard = registrations.reduce((acc, reg) => {
      acc[reg.standard] = (acc[reg.standard] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byMedium = registrations.reduce((acc, reg) => {
      acc[reg.medium] = (acc[reg.medium] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStandard, byMedium };
  };

  const stats = getStats();

  const handleEditClick = (reg: Registration) => {
    setEditingRegistration(reg);
    setEditFormData({
      room_no: reg.room_no || "",
      floor: reg.floor || "",
      building_name: reg.building_name || "",
      exam_pattern: reg.exam_pattern || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingRegistration) return;

    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          room_no: editFormData.room_no || null,
          floor: editFormData.floor || null,
          building_name: editFormData.building_name || null,
          exam_pattern: editFormData.exam_pattern || null,
        })
        .eq("id", editingRegistration.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Registration details updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating registration:", error);
      toast({
        title: "Error",
        description: "Failed to update registration details",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header Bar */}
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Registrations</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      By Standard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {Object.entries(stats.byStandard).map(([std, count]) => (
                        <p key={std} className="text-sm">
                          <span className="font-semibold">{std}:</span> {count}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      By Medium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {Object.entries(stats.byMedium).map(([medium, count]) => (
                        <p key={medium} className="text-sm">
                          <span className="font-semibold capitalize">{medium}:</span> {count}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Actions */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, mobile, email, or registration number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={exportToCSV} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download CSV
                      </Button>
                      <Button onClick={printRegistrations} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                      <Button onClick={fetchRegistrations} variant="outline">
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registrations Table */}
              <Card className="bg-card">
                <CardHeader className="border-b">
                  <CardTitle className="text-xl font-semibold">
                    All Registrations ({filteredRegistrations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading registrations...</div>
                  ) : filteredRegistrations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No registrations found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Reg. No.</TableHead>
                            <TableHead className="font-semibold">Student Name</TableHead>
                            <TableHead className="font-semibold">Mobile</TableHead>
                            <TableHead className="font-semibold">Standard</TableHead>
                            <TableHead className="font-semibold">Medium</TableHead>
                            <TableHead className="font-semibold">Exam Date</TableHead>
                            <TableHead className="font-semibold">Room Details</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRegistrations.map((reg) => (
                            <TableRow key={reg.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{reg.registration_number}</TableCell>
                              <TableCell>{reg.student_name}</TableCell>
                              <TableCell>{reg.mobile_number}</TableCell>
                              <TableCell>{reg.standard}</TableCell>
                              <TableCell className="capitalize">{reg.medium}</TableCell>
                              <TableCell>
                                {reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {reg.room_no && <div>Room: {reg.room_no}</div>}
                                {reg.floor && <div>Floor: {reg.floor}</div>}
                                {!reg.room_no && !reg.floor && <span className="text-muted-foreground">Not set</span>}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditClick(reg)}
                                    className="gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadHallTicket(reg)}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Hall Ticket
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Registration Details</DialogTitle>
            <DialogDescription>
              Update room details and exam pattern for {editingRegistration?.student_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room_no">Room No</Label>
              <Input
                id="room_no"
                value={editFormData.room_no}
                onChange={(e) => setEditFormData({ ...editFormData, room_no: e.target.value })}
                placeholder="Enter room number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={editFormData.floor}
                onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })}
                placeholder="Enter floor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="building_name">Building Name</Label>
              <Input
                id="building_name"
                value={editFormData.building_name}
                onChange={(e) => setEditFormData({ ...editFormData, building_name: e.target.value })}
                placeholder="Enter building name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exam_pattern">Exam Pattern</Label>
              <Input
                id="exam_pattern"
                value={editFormData.exam_pattern}
                onChange={(e) => setEditFormData({ ...editFormData, exam_pattern: e.target.value })}
                placeholder="Enter exam pattern"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
