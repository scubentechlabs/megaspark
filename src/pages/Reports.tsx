import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, FileText, Home } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  room_no: string | null;
  floor: string | null;
  building_name: string | null;
  exam_pattern: string | null;
}

function AppSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", icon: Home, onClick: () => navigate("/admin") },
    { title: "Reports", icon: FileText, onClick: () => navigate("/admin/reports") },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-4">
          <img src={logo} alt="MEGA SPARK" className="h-12 mx-auto" />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.onClick}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Reports() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedExamDate, setSelectedExamDate] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
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
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
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

  // Auto-select first available option when report type changes
  useEffect(() => {
    const uniqueVals = getUniqueValues();
    
    if (reportType === "exam-date" && uniqueVals.examDates.length > 0 && !selectedExamDate) {
      setSelectedExamDate(uniqueVals.examDates[0]);
    }
    if (reportType === "room" && uniqueVals.rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(uniqueVals.rooms[0]);
    }
    if (reportType === "floor" && uniqueVals.floors.length > 0 && !selectedFloor) {
      setSelectedFloor(uniqueVals.floors[0]);
    }
    if (reportType === "school" && uniqueVals.schools.length > 0 && !selectedSchool) {
      setSelectedSchool(uniqueVals.schools[0]);
    }
  }, [reportType, registrations]);

  const getUniqueValues = () => {
    const examDates = [...new Set(registrations.map(r => r.exam_date).filter(Boolean))].sort();
    const rooms = [...new Set(registrations.map(r => r.room_no).filter(Boolean))].sort();
    const floors = [...new Set(registrations.map(r => r.floor).filter(Boolean))].sort();
    const schools = [...new Set(registrations.map(r => r.school_name).filter(Boolean))].sort();
    
    return { examDates, rooms, floors, schools };
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
      case "room":
        if (selectedRoom) {
          data = data.filter(reg => reg.room_no === selectedRoom);
        }
        break;
      case "floor":
        if (selectedFloor) {
          data = data.filter(reg => reg.floor === selectedFloor);
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

    const csvData = data.map((reg) => [
      reg.registration_number,
      reg.student_name,
      reg.parent_name || 'N/A',
      reg.mobile_number,
      reg.whatsapp_number || 'N/A',
      reg.email || 'N/A',
      reg.district || 'N/A',
      reg.city_village || 'N/A',
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
    
    let fileName = `report-${reportType}`;
    if (reportType === "date" && selectedDate) fileName += `-${selectedDate}`;
    if (reportType === "exam-date" && selectedExamDate) fileName += `-${selectedExamDate}`;
    if (reportType === "room" && selectedRoom) fileName += `-room-${selectedRoom}`;
    if (reportType === "floor" && selectedFloor) fileName += `-floor-${selectedFloor}`;
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
    if (reportType === "room" && selectedRoom) reportTitle = `Room: ${selectedRoom}`;
    if (reportType === "floor" && selectedFloor) reportTitle = `Floor: ${selectedFloor}`;
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
              <th>Room</th>
              <th>Floor</th>
              <th>Building</th>
              <th>Pattern</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(reg => `
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

  const uniqueValues = getUniqueValues();
  const filteredData = getFilteredReportData();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
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
        <AppSidebar />
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                  variant={reportType === "room" ? "default" : "outline"}
                  onClick={() => setReportType("room")}
                  className="w-full"
                >
                  Room Wise
                </Button>
                <Button
                  variant={reportType === "floor" ? "default" : "outline"}
                  onClick={() => setReportType("floor")}
                  className="w-full"
                >
                  Floor Wise
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

            {reportType === "room" && (
              <div>
                <p className="text-sm font-medium mb-2">Select Room Number</p>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueValues.rooms.map(room => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "floor" && (
              <div>
                <p className="text-sm font-medium mb-2">Select Floor</p>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueValues.floors.map(floor => (
                      <SelectItem key={floor} value={floor}>
                        {floor}
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
