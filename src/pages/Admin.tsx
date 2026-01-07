import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, LogOut, Printer, Users, Calendar, Edit, Send, ChevronLeft, ChevronRight, Check, X, Clock, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import hallTicketHeaderImage from "@/assets/hall-ticket-header.jpg";
import hallTicketFooterImage from "@/assets/hall-ticket-footer-new.jpg";

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
  city: string | null;
  class_rank: string | null;
  olympiad_appeared: string | null;
  olympiad_certificate_url: string | null;
  marksheet_url: string | null;
  status: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingRegistration, setViewingRegistration] = useState<Registration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, todayRegistrations: 0, yesterdayRegistrations: 0, pending: 0, approved: 0, rejected: 0 });
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

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      toast({
        title: "Approving...",
        description: "Processing registration approval",
      });

      const { error } = await supabase
        .from('registrations')
        .update({ status: 'approved' })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Registration approved and registration number generated",
      });
      fetchRegistrations();
    } catch (error: any) {
      console.error("Error approving registration:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      });
    }
  };

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'rejected' })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Registration Rejected",
        description: "The registration has been rejected",
      });
      fetchRegistrations();
    } catch (error: any) {
      console.error("Error rejecting registration:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration",
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

      // Get status counts
      const { count: pendingCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: approvedCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: rejectedCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
      
      setStats({
        total: count || 0,
        todayRegistrations: todayCount || 0,
        yesterdayRegistrations: yesterdayCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0
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
    const slotLower = slot.toLowerCase();
    if (slotLower.includes('morning')) return 'Morning Slot';
    if (slotLower.includes('afternoon')) return 'Afternoon Slot';
    return slot;
  };

  const getReportingTime = (slot: string | null) => {
    if (!slot) return 'TBA';
    const slotLower = slot.toLowerCase();
    if (slotLower.includes('morning')) return '8:00 AM';
    if (slotLower.includes('afternoon')) return '2:30 PM';
    return 'TBA';
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
            <h1>🌟 MEGA SPARK NATIONAL CHAMPION 🌟</h1>
            <h2>મેગા સ્પાર્ક નેશનલ ચેમ્પિયન</h2>
            <p><strong>HALL TICKET / પ્રવેશ પત્ર</strong></p>
          </div>
          
          <table class="info-table">
            <tr>
              <td>Registration Number<br>નોંધણી નંબર</td>
              <td><strong style="font-size: 18px;">${formatRegistrationNumber(reg.registration_number)}</strong></td>
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
              <td>${formatMedium(reg.medium)}</td>
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
              <td>PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150</td>
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
            <img src="${hallTicketFooterImage}" style="max-width: 70%; height: auto;" alt="PP Savani Banner" />
          </div>

          <div class="footer">
            <p><strong>MEGA SPARK NATIONAL CHAMPION COMMITTEE</strong></p>
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
        <title>Registration Data - MEGA SPARK NATIONAL CHAMPION</title>
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
          <h1>MEGA SPARK NATIONAL CHAMPION - Registration Data</h1>
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
          <p>MEGA SPARK NATIONAL CHAMPION COMMITTEE | Website: www.megasparkexam.com</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-yellow-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-green-600 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-red-600 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Rejected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold">{stats.todayRegistrations}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Yesterday
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold">{stats.yesterdayRegistrations}</p>
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
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Reg. No.</TableHead>
                            <TableHead className="font-semibold">Student Name</TableHead>
                            <TableHead className="font-semibold">Mobile</TableHead>
                            <TableHead className="font-semibold">Class</TableHead>
                            <TableHead className="font-semibold">School</TableHead>
                            <TableHead className="font-semibold">City/Dist</TableHead>
                            <TableHead className="font-semibold">Documents</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRegistrations.map((reg: any) => (
                            <TableRow key={reg.id} className="hover:bg-muted/50">
                              <TableCell>
                                {reg.status === 'pending' && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                {reg.status === 'approved' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                    <Check className="h-3 w-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {reg.status === 'rejected' && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                    <X className="h-3 w-3 mr-1" />
                                    Rejected
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {reg.status === 'approved' && reg.registration_number 
                                  ? formatRegistrationNumber(reg.registration_number) 
                                  : <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell>{reg.student_name}</TableCell>
                              <TableCell>{reg.mobile_number}</TableCell>
                              <TableCell>{reg.standard}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{reg.school_name || 'N/A'}</TableCell>
                              <TableCell>{reg.city || reg.district || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {reg.marksheet_url && (
                                    <a 
                                      href={reg.marksheet_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      Marksheet
                                    </a>
                                  )}
                                  {reg.olympiad_certificate_url && (
                                    <a 
                                      href={reg.olympiad_certificate_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline ml-1"
                                    >
                                      Certificate
                                    </a>
                                  )}
                                  {!reg.marksheet_url && !reg.olympiad_certificate_url && (
                                    <span className="text-xs text-muted-foreground">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setViewingRegistration(reg);
                                      setIsViewDialogOpen(true);
                                    }}
                                    className="gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditRegistration(reg)}
                                    className="gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  {reg.status === 'approved' && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleSendHallTicket(reg.id)}
                                      className="gap-1"
                                    >
                                      <Send className="h-3 w-3" />
                                      WhatsApp
                                    </Button>
                                  )}
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

      {/* View Registration Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Registration Details</DialogTitle>
          </DialogHeader>
          {viewingRegistration && (
            <div className="space-y-4">
              {/* Status & Reg Number Row */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {viewingRegistration.status === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {viewingRegistration.status === 'approved' && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <Check className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                  {viewingRegistration.status === 'rejected' && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      <X className="h-3 w-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Reg. No:</span>
                  <span className="font-bold text-primary">
                    {viewingRegistration.registration_number ? formatRegistrationNumber(viewingRegistration.registration_number) : '—'}
                  </span>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Personal & School */}
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                      <Users className="h-4 w-4" />
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-muted-foreground">Name</label>
                        <p className="font-medium">{viewingRegistration.student_name}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Mobile</label>
                        <p className="font-medium">{viewingRegistration.mobile_number}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">WhatsApp</label>
                        <p className="font-medium">{viewingRegistration.whatsapp_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Email</label>
                        <p className="font-medium truncate">{viewingRegistration.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                      <Calendar className="h-4 w-4" />
                      School Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-muted-foreground">Class</label>
                        <p className="font-medium">Class {viewingRegistration.standard}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">School</label>
                        <p className="font-medium truncate">{viewingRegistration.school_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">City</label>
                        <p className="font-medium">{viewingRegistration.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">District</label>
                        <p className="font-medium">{viewingRegistration.district || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Previous %</label>
                        <p className="font-medium">{viewingRegistration.previous_year_percentage ? `${viewingRegistration.previous_year_percentage}%` : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Class Rank</label>
                        <p className="font-medium">{viewingRegistration.class_rank || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Documents */}
                <div className="border rounded-lg p-3">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                    <Download className="h-4 w-4" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <label className="text-muted-foreground">Olympiad</label>
                      <p className="font-medium">{viewingRegistration.olympiad_appeared || 'None'}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Registered</label>
                      <p className="font-medium">{new Date(viewingRegistration.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {/* Document Thumbnails */}
                  <div className="grid grid-cols-2 gap-2">
                    {viewingRegistration.marksheet_url && (
                      <a 
                        href={viewingRegistration.marksheet_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block border rounded-lg p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        {viewingRegistration.marksheet_url.toLowerCase().endsWith('.pdf') ? (
                          <div className="h-24 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                            PDF Document
                          </div>
                        ) : (
                          <img 
                            src={viewingRegistration.marksheet_url} 
                            alt="Marksheet" 
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                        <p className="text-xs font-medium mt-1 text-center">Marksheet</p>
                      </a>
                    )}
                    {viewingRegistration.olympiad_certificate_url && (
                      <a 
                        href={viewingRegistration.olympiad_certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block border rounded-lg p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        {viewingRegistration.olympiad_certificate_url.toLowerCase().endsWith('.pdf') ? (
                          <div className="h-24 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                            PDF Document
                          </div>
                        ) : (
                          <img 
                            src={viewingRegistration.olympiad_certificate_url} 
                            alt="Certificate" 
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                        <p className="text-xs font-medium mt-1 text-center">Certificate</p>
                      </a>
                    )}
                    {!viewingRegistration.marksheet_url && !viewingRegistration.olympiad_certificate_url && (
                      <p className="text-muted-foreground text-xs col-span-2">No documents uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {viewingRegistration.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t">
                  <Button
                    onClick={() => {
                      handleApproveRegistration(viewingRegistration.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectRegistration(viewingRegistration.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {viewingRegistration.status === 'approved' && (
                <div className="flex gap-3 pt-3 border-t">
                  <Button
                    onClick={() => handleSendHallTicket(viewingRegistration.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Hall Ticket via WhatsApp
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}
