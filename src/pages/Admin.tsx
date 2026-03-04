import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, LogOut, Printer, Users, Calendar, Edit, Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { formatMedium, formatRegistrationNumber } from "@/lib/formatters";
import { fetchAll } from "@/lib/fetchAll";
import { EditRegistrationDialog } from "@/components/EditRegistrationDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
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
  time_slot: string | null;
  school_address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [downloadingHallTicketId, setDownloadingHallTicketId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, todayRegistrations: 0, yesterdayRegistrations: 0 });
  const itemsPerPage = 100;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Set up realtime subscription for registrations
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Registration change detected:', payload);
          // Refresh registrations when any change occurs
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      fetchRegistrations();
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoading(false);
    }
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
        fetchRegistrations();
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

  useEffect(() => {
    // When search term or page changes, fetch matching results
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchFilteredRegistrations();
      } else {
        fetchRegistrations();
      }
    }, 500); // Debounce search
    
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const fetchFilteredRegistrations = async () => {
    if (!searchTerm) {
      setCurrentPage(1);
      fetchRegistrations();
      return;
    }
    
    setIsLoading(true);
    try {
      // For search, use ilike pattern matching in the database
      const { data, error, count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .or(`student_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,registration_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) throw error;
      
      setFilteredRegistrations(data || []);
      setRegistrations(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error filtering:", error);
      toast({
        title: "Error",
        description: "Failed to search registrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching registrations page ${currentPage}...`);
      
      // Get total count
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Get today's and yesterday's counts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();
      
      const { count: todayCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);
      
      const { count: yesterdayCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterdayISO)
        .lt('created_at', todayISO);
      
      setStats({
        total: count || 0,
        todayRegistrations: todayCount || 0,
        yesterdayRegistrations: yesterdayCount || 0
      });
      
      // Fetch current page
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) throw error;
      
      console.log(`Fetched ${data?.length} registrations for page ${currentPage}`);
      
      setRegistrations(data || []);
      setFilteredRegistrations(data || []);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const handleDownloadHallTicket = async (reg: Registration) => {
    setDownloadingHallTicketId(reg.id);
    try {
      // If hall ticket URL already exists, download directly
      if (reg.hall_ticket_url) {
        const link = document.createElement('a');
        link.href = reg.hall_ticket_url;
        link.target = '_blank';
        link.download = `hall-ticket-${reg.registration_number || reg.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Hall Ticket Downloaded" });
        return;
      }

      // Generate hall ticket PDF via edge function
      toast({ title: "Generating PDF...", description: "Please wait while the hall ticket is being generated." });

      const { data, error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId: reg.id }
      });

      if (error) throw error;

      if (data?.success && data?.hallTicketUrl) {
        // Update local state
        setRegistrations(prev => prev.map(r => 
          r.id === reg.id ? { ...r, hall_ticket_url: data.hallTicketUrl } : r
        ));

        const link = document.createElement('a');
        link.href = data.hallTicketUrl;
        link.target = '_blank';
        link.download = `hall-ticket-${reg.registration_number || reg.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Hall Ticket Downloaded" });
      } else {
        throw new Error(data?.error || 'Failed to generate hall ticket');
      }
    } catch (error: any) {
      console.error("Error downloading hall ticket:", error);
      toast({ title: "Download Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setDownloadingHallTicketId(null);
    }
  };

  const exportToCSV = async () => {
    try {
      // For CSV export, fetch all data matching current search
      let allData: Registration[];
      
      if (searchTerm) {
        const { data } = await supabase
          .from('registrations')
          .select('*')
          .or(`student_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,registration_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });
        allData = data || [];
      } else {
        allData = await fetchAll<Registration>(
          'registrations',
          '*',
          { column: 'created_at', ascending: false }
        );
      }
      
      const headers = [
        "Registration Number",
        "Student Name",
        "Parent Name",
        "Mobile Number",
        "WhatsApp Number",
        "State",
        "District",
        "School Name",
        "School Medium",
        "Standard",
        "Previous Year %",
        "Time Slot",
        "Reporting Time",
        "Medium",
        "Exam Center",
        "Registration Date",
      ];

      const csvData = allData.map((reg) => [
        reg.registration_number,
        reg.student_name,
        reg.parent_name || 'N/A',
        reg.mobile_number,
        reg.whatsapp_number || 'N/A',
        reg.state || 'N/A',
        reg.district || 'N/A',
        reg.school_name || 'N/A',
        reg.school_medium || 'N/A',
        reg.standard,
        reg.previous_year_percentage || 'N/A',
        formatTimeSlot(reg.time_slot),
        getReportingTime(reg.time_slot),
        formatMedium(reg.medium),
        'PP Savani Center for excellence',
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
        description: `${allData.length} registrations exported to CSV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const printRegistrations = async () => {
    try {
      // For print, fetch all data matching current search
      let allData: Registration[];
      
      if (searchTerm) {
        const { data } = await supabase
          .from('registrations')
          .select('*')
          .or(`student_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,registration_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,parent_name.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });
        allData = data || [];
      } else {
        allData = await fetchAll<Registration>(
          'registrations',
          '*',
          { column: 'created_at', ascending: false }
        );
      }
      
      const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Registration Data - MEGA SPARK EXAM 2026</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { margin: 0; padding: 10px; font-family: Arial, sans-serif; font-size: 7px; }
          .header { text-align: center; margin-bottom: 10px; }
          .header h1 { margin: 0; font-size: 16px; }
          .header p { margin: 3px 0; font-size: 9px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #000; padding: 3px 4px; text-align: left; word-wrap: break-word; }
          th { background: #f0f0f0; font-weight: bold; font-size: 7px; white-space: nowrap; }
          td { font-size: 7px; }
          .footer { margin-top: 10px; text-align: center; font-size: 7px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEGA SPARK EXAM 2026 - Registration Data</h1>
          <p>Total Registrations: ${allData.length} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">Reg. No.</th>
              <th style="width: 13%;">Student Name</th>
              <th style="width: 11%;">Parent Name</th>
              <th style="width: 8%;">Mobile</th>
              <th style="width: 8%;">WhatsApp</th>
              <th style="width: 7%;">State</th>
              <th style="width: 7%;">District</th>
              <th style="width: 13%;">School Name</th>
              <th style="width: 5%;">Std</th>
              <th style="width: 5%;">Medium</th>
              <th style="width: 5%;">Sch. Med.</th>
              <th style="width: 4%;">Prev %</th>
              <th style="width: 8%;">Exam Date</th>
            </tr>
          </thead>
          <tbody>
            ${allData.map(reg => `
              <tr>
                <td>${reg.registration_number}</td>
                <td>${reg.student_name}</td>
                <td>${reg.parent_name || 'N/A'}</td>
                <td>${reg.mobile_number}</td>
                <td>${reg.whatsapp_number || 'N/A'}</td>
                <td>${reg.state || 'N/A'}</td>
                <td>${reg.district || 'N/A'}</td>
                <td>${reg.school_name || 'N/A'}</td>
                <td>${reg.standard}</td>
                <td>${formatMedium(reg.medium)}</td>
                <td>${formatMedium(reg.school_medium || '')}</td>
                <td>${reg.previous_year_percentage || 'N/A'}</td>
                <td>${reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>MEGA SPARK EXAM COMMITTEE | Website: www.megasparkexam.com</p>
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
          description: `Opening print dialog for ${allData.length} registrations`,
        });
      } else {
        toast({
          title: "Error",
          description: "Please allow popups to print data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Error",
        description: "Failed to prepare print data",
        variant: "destructive",
      });
    }
  };

  const getStats = () => {
    return stats;
  };

  const handleEditRegistration = (reg: Registration) => {
    setEditingRegistration(reg);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingRegistration(null);
    fetchRegistrations();
  };

  return (
    <SidebarProvider defaultOpen={false}>
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
                      Today Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.todayRegistrations}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Yesterday Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.yesterdayRegistrations}</p>
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
                    All Registrations ({totalCount} total, showing {filteredRegistrations.length})
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
                              <TableCell className="font-medium">{formatRegistrationNumber(reg.registration_number)}</TableCell>
                              <TableCell>{reg.student_name}</TableCell>
                              <TableCell>{reg.mobile_number}</TableCell>
                              <TableCell>{reg.standard}</TableCell>
                              <TableCell>{formatMedium(reg.school_medium)}</TableCell>
                              <TableCell>
                                {reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditRegistration(reg)}
                                    className="gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadHallTicket(reg)}
                                    className="gap-2"
                                    disabled={downloadingHallTicketId === reg.id}
                                  >
                                    {downloadingHallTicketId === reg.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                    {downloadingHallTicketId === reg.id ? 'Generating...' : 'Hall Ticket'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleSendHallTicket(reg.id)}
                                    className="gap-2"
                                  >
                                    <Send className="h-4 w-4" />
                                    Send on WhatsApp
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {!isLoading && filteredRegistrations.length > 0 && (
                    <div className="border-t p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} registrations
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="gap-2"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                            </PaginationItem>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                              const totalPages = Math.ceil(totalCount / itemsPerPage);
                              let pageNum;
                              
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNum)}
                                    isActive={currentPage === pageNum}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            
                            <PaginationItem>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                                className="gap-2"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Registration Dialog */}
      {editingRegistration && (
        <EditRegistrationDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          registration={editingRegistration}
          onUpdate={handleEditSuccess}
        />
      )}

    </SidebarProvider>
  );
}
