import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Search, Download, Users, Calendar, Settings, BarChart3, FileText, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  city_village: string | null;
  school_name: string | null;
  school_medium: string | null;
  previous_year_percentage: string | null;
  preferred_exam_date: string | null;
  exam_date: string | null;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
          .header h1 { margin: 0; font-size: 24px; color: #000; }
          .header h2 { margin: 5px 0; font-size: 18px; color: #333; }
          .header p { margin: 5px 0; font-size: 14px; }
          .medium-badge { display: inline-block; padding: 5px 15px; background: #f0f0f0; border-radius: 5px; margin: 10px 0; font-weight: bold; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px; border: 1px solid #000; }
          .info-table td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
          .notes { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #000; }
          .notes h3 { margin-top: 0; }
          .notes ul { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; }
          .photo-box { width: 120px; height: 150px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 150px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 MEGA SPARK EXAM 2025 🌟</h1>
            <h2>મેગા સ્પાર્ક પરીક્ષા - 2025</h2>
            <p><strong>HALL TICKET / પ્રવેશ પત્ર</strong></p>
            <div class="medium-badge">${reg.medium === 'gujarati' ? 'ગુજરાતી માધ્યમ (Gujarati Medium)' : 'English Medium (આંગ્લ માધ્યમ)'}</div>
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
              <td>District<br>જિલ્લો</td>
              <td>${reg.district || 'N/A'}</td>
            </tr>
            <tr>
              <td>City/Village<br>શહેર/ગામ</td>
              <td>${reg.city_village || 'N/A'}</td>
            </tr>
            <tr>
              <td>Standard<br>ધોરણ</td>
              <td>${reg.standard}</td>
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
              <td>${reg.preferred_exam_date ? new Date(reg.preferred_exam_date).toLocaleDateString('en-GB') : 'N/A'}</td>
            </tr>
            <tr>
              <td>Mobile Number<br>મોબાઇલ નંબર</td>
              <td>${reg.mobile_number}</td>
            </tr>
            <tr>
              <td>Email Address<br>ઇમેઇલ સરનામું</td>
              <td>${reg.email}</td>
            </tr>
            <tr>
              <td>Exam Date<br>પરીક્ષા તારીખ</td>
              <td>${reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be announced'}</td>
            </tr>
            <tr>
              <td>Exam Center<br>પરીક્ષા કેન્દ્ર</td>
              <td>${reg.exam_center}</td>
            </tr>
          </table>

          <div class="notes">
            <h3>Important Instructions / મહત્વની સૂચનાઓ:</h3>
            <ul>
              <li>Bring this hall ticket to the exam center / આ પ્રવેશ પત્ર પરીક્ષા કેન્દ્ર પર લાવવું</li>
              <li>Reporting Time: 8:00 AM | Exam Time: 10:00 AM - 12:00 PM</li>
              <li>Bring valid ID proof / માન્ય ઓળખ પુરાવો સાથે લાવવો</li>
              <li>Mobile phones not allowed in exam hall / પરીક્ષા હોલમાં મોબાઇલ ફોન માન્ય નથી</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>MEGA SPARK EXAM COMMITTEE</strong></p>
            <p>Website: www.megaspark.com | Email: info@megaspark.com</p>
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
      "District",
      "City/Village",
      "School Name",
      "School Medium",
      "Standard",
      "Previous Year %",
      "Preferred Exam Date",
      "Medium",
      "Exam Center",
      "Registration Date",
    ];

    const csvData = filteredRegistrations.map((reg) => [
      reg.registration_number,
      reg.student_name,
      reg.parent_name || 'N/A',
      reg.mobile_number,
      reg.whatsapp_number || 'N/A',
      reg.district || 'N/A',
      reg.city_village || 'N/A',
      reg.school_name || 'N/A',
      reg.school_medium || 'N/A',
      reg.standard,
      reg.previous_year_percentage || 'N/A',
      reg.preferred_exam_date ? new Date(reg.preferred_exam_date).toLocaleDateString() : 'N/A',
      reg.medium,
      reg.exam_center,
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-6 border-b">
              <img src={logo} alt="Logo" className="h-10 mb-2" />
              <h2 className="font-semibold text-lg">MEGA SPARK</h2>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-3" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full justify-start bg-accent">
                      <Users className="h-4 w-4 mr-3" />
                      <span>Registrations</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-3" />
                      <span>Reports</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full justify-start" onClick={() => navigate("/")}>
                      <Home className="h-4 w-4 mr-3" />
                      <span>Back to Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

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
                        Export CSV
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
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleDownloadHallTicket(reg)}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Hall Ticket
                                </Button>
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
    </SidebarProvider>
  );
}
