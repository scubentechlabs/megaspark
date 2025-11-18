import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, FileText, Send, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMedium, formatRegistrationNumber } from "@/lib/formatters";
import { fetchAll } from "@/lib/fetchAll";

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
}

export default function Reports() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingHallTicket, setSendingHallTicket] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedExamDate, setSelectedExamDate] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
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

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAll<Registration>(
        "registrations",
        "*",
        { column: "created_at", ascending: false }
      );

      setRegistrations(data || []);
      toast({
        title: "Data Refreshed",
        description: `Loaded all ${data?.length || 0} registrations`,
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

  // Auto-select first available option when report type changes
  useEffect(() => {
    const uniqueVals = getUniqueValues();
    
    if (reportType === "exam-date" && uniqueVals.examDates.length > 0 && !selectedExamDate) {
      setSelectedExamDate(uniqueVals.examDates[0]);
    }
    if (reportType === "school" && uniqueVals.schools.length > 0 && !selectedSchool) {
      setSelectedSchool(uniqueVals.schools[0]);
    }
    setCurrentPage(1); // Reset to first page when filters change
  }, [reportType, selectedDate, selectedExamDate, selectedSchool]);

  const getUniqueValues = () => {
    const examDates = [...new Set(registrations.map(r => r.exam_date).filter(Boolean))].sort();
    const schools = [...new Set(registrations.map(r => r.school_name).filter(Boolean))].sort();
    
    return { examDates, schools };
  };

  const getFilteredReportData = () => {
    let data = [...registrations];

    switch (reportType) {
      case "date":
        if (selectedDate) {
          data = data.filter(reg => {
            const regDate = new Date(reg.created_at).toLocaleDateString('en-CA');
            return regDate === selectedDate;
          });
        }
        break;
      case "exam-date":
        if (selectedExamDate) {
          data = data.filter(reg => reg.exam_date === selectedExamDate);
        }
        break;
      case "school":
        if (selectedSchool) {
          data = data.filter(reg => reg.school_name === selectedSchool);
        }
        break;
      default:
        break;
    }

    return data;
  };

  const downloadReport = () => {
    const data = getFilteredReportData();
    
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

    const headers = [
      "Registration Number",
      "Student Name",
      "Parent Name",
      "Mobile Number",
      "WhatsApp Number",
      "Email",
      "State",
      "District",
      "School Name",
      "School Medium",
      "Standard",
      "Previous Year %",
      "Exam Date",
      "Time Slot",
      "Reporting Time",
      "Medium",
      "Exam Center",
      "Registration Date",
    ];

    const csvData = data.map((reg) => [
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
      reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA',
      formatTimeSlot(reg.time_slot),
      getReportingTime(reg.time_slot),
      formatMedium(reg.medium),
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
    
    let fileName = `report-${reportType}`;
    if (reportType === "date" && selectedDate) fileName += `-${selectedDate}`;
    if (reportType === "exam-date" && selectedExamDate) fileName += `-${selectedExamDate}`;
    if (reportType === "school" && selectedSchool) fileName += `-${selectedSchool.substring(0, 20)}`;
    
    a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded!",
      description: `Downloaded ${data.length} registrations`,
    });
  };

  const printReport = () => {
    const data = getFilteredReportData();
    
    let reportTitle = "All Registrations";
    if (reportType === "date" && selectedDate) reportTitle = `Registrations on ${new Date(selectedDate).toLocaleDateString('en-GB')}`;
    if (reportType === "exam-date" && selectedExamDate) reportTitle = `Exam Date: ${new Date(selectedExamDate).toLocaleDateString('en-GB')}`;
    if (reportType === "school" && selectedSchool) reportTitle = `School: ${selectedSchool}`;

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle} - MEGA SPARK EXAM 2025</title>
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
          <h1>MEGA SPARK EXAM 2025 - ${reportTitle}</h1>
          <p>Total Registrations: ${data.length} | Generated: ${new Date().toLocaleString()}</p>
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
              <th>Time Slot</th>
              <th>Reporting Time</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(reg => {
              const formatTimeSlot = (slot: string | null) => {
                if (!slot) return 'TBA';
                if (slot.toLowerCase() === 'morning') return 'Morning';
                if (slot.toLowerCase() === 'afternoon') return 'Afternoon';
                return slot;
              };
              
              const getReportingTime = (slot: string | null) => {
                if (!slot) return 'TBA';
                if (slot.toLowerCase() === 'morning') return '8:00 AM';
                if (slot.toLowerCase() === 'afternoon') return '2:30 PM';
                return 'TBA';
              };
              
              return `
              <tr>
                <td>${reg.registration_number}</td>
                <td>${reg.student_name}</td>
                <td>${reg.mobile_number}</td>
                <td>${reg.email || 'N/A'}</td>
                <td>${reg.standard}</td>
                <td>${formatMedium(reg.medium)}</td>
                <td>${reg.district || 'N/A'}</td>
                <td>${reg.school_name || 'N/A'}</td>
                <td>${reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}</td>
                <td>${formatTimeSlot(reg.time_slot)}</td>
                <td>${getReportingTime(reg.time_slot)}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Report generated from MEGA SPARK Exam Management System</p>
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
        description: "Opening print dialog for report",
      });
    } else {
      toast({
        title: "Error",
        description: "Please allow popups to print report",
        variant: "destructive",
      });
    }
  };

  const handleSendHallTicket = async (registrationId: string) => {
    try {
      setSendingHallTicket(registrationId);
      
      const { error } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Hall ticket sent via WhatsApp",
      });

      // Refresh registrations to show updated hall_ticket_url
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Error sending hall ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send hall ticket",
        variant: "destructive",
      });
    } finally {
      setSendingHallTicket(null);
    }
  };

  const uniqueValues = getUniqueValues();
  const filteredData = getFilteredReportData();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading...</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1">
          <header className="h-14 border-b flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          </header>
          <div className="p-6 space-y-6">

        {/* Reports Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Report Type Selection */}
            <div>
              <p className="text-sm font-medium mb-3">Select Report Type</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant={reportType === "all" ? "default" : "outline"}
                  onClick={() => setReportType("all")}
                  className="w-full"
                >
                  All
                </Button>
                <Button
                  variant={reportType === "date" ? "default" : "outline"}
                  onClick={() => setReportType("date")}
                  className="w-full"
                >
                  Date Wise
                </Button>
                <Button
                  variant={reportType === "exam-date" ? "default" : "outline"}
                  onClick={() => setReportType("exam-date")}
                  className="w-full"
                >
                  Exam Date
                </Button>
                <Button
                  variant={reportType === "school" ? "default" : "outline"}
                  onClick={() => setReportType("school")}
                  className="w-full"
                >
                  School Wise
                </Button>
              </div>
            </div>

            {/* Filter Inputs */}
            {reportType === "date" && (
              <div>
                <p className="text-sm font-medium mb-2">Select Registration Date</p>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            )}

            {reportType === "exam-date" && (
              <div>
                <p className="text-sm font-medium mb-2">Select Exam Date</p>
                <Select value={selectedExamDate} onValueChange={setSelectedExamDate}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select exam date" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueValues.examDates.map(date => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-GB')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "school" && (
              <div>
                <p className="text-sm font-medium mb-2">Select School</p>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueValues.schools.map(school => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Report Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">Report Summary</p>
              <p className="text-2xl font-bold mt-1">Total Records: {filteredData.length}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={downloadReport} className="h-auto py-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Download Report CSV</span>
                </div>
                <p className="text-xs opacity-90 text-left">
                  Export filtered data to CSV file
                </p>
              </Button>
              <Button onClick={printReport} variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  <span className="font-semibold">Print Report</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Print filtered registration data
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Registrations Table */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold">All Registrations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Hall Ticket</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{formatRegistrationNumber(reg.registration_number)}</TableCell>
                        <TableCell>{reg.student_name}</TableCell>
                        <TableCell>{reg.mobile_number}</TableCell>
                        <TableCell>{reg.standard}</TableCell>
                        <TableCell>{formatMedium(reg.medium)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{reg.school_name || 'N/A'}</TableCell>
                        <TableCell>
                          {reg.exam_date ? new Date(reg.exam_date).toLocaleDateString('en-GB') : 'TBA'}
                        </TableCell>
                        <TableCell>
                          {reg.hall_ticket_url ? (
                            <a 
                              href={reg.hall_ticket_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendHallTicket(reg.id)}
                            disabled={sendingHallTicket === reg.id || !reg.registration_number}
                            className="gap-2"
                          >
                            {sendingHallTicket === reg.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Send Hall Ticket
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {filteredData.length > 0 && (
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} registrations
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return [
                          <PaginationItem key={`ellipsis-${page}`}>
                            <span className="px-2">...</span>
                          </PaginationItem>,
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ];
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredData.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
