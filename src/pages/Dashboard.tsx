import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  FileText,
  CreditCard,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatMedium, formatRegistrationNumber } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed fetchAll - using server-side aggregations instead
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalRegistrations: number;
  todayRegistrations: number;
  yesterdayRegistrations: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  registrationsByStandard: Record<string, number>;
  registrationsByMedium: Record<string, number>;
  recentRegistrations: any[];
  recentPayments: any[];
  registrationTrendData: Array<{ date: string; registrations: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExamDate, setSelectedExamDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSendingHallTickets, setIsSendingHallTickets] = useState(false);
  const [examDates, setExamDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<Array<{ slot_name: string }>>([]);

  useEffect(() => {
    checkAuth();
    fetchExamDates();
    fetchSlots();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardData();
  };

  const fetchExamDates = async () => {
    try {
      // Fetch all unique exam dates with a very high limit to get all records
      const { data, error } = await supabase
        .from("registrations")
        .select("exam_date")
        .not("exam_date", "is", null)
        .order("exam_date", { ascending: true })
        .limit(50000); // Very high limit to ensure we get all records

      if (error) throw error;

      // Get unique dates and filter out nulls
      const allDates = data?.map(d => d.exam_date).filter(Boolean) || [];
      const uniqueDates = Array.from(new Set(allDates));
      
      console.log("Total exam date records fetched:", data?.length);
      console.log("Unique exam dates found:", uniqueDates.length);
      console.log("Exam dates:", uniqueDates);
      
      setExamDates(uniqueDates);
      
      if (uniqueDates.length > 0) {
        toast.success(`Loaded ${uniqueDates.length} exam dates`);
      }
    } catch (error) {
      console.error("Error fetching exam dates:", error);
      toast.error("Failed to load exam dates");
    }
  };

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("slot_settings")
        .select("slot_name")
        .order("slot_name", { ascending: true });

      if (error) throw error;

      setSlots(data || []);
      console.log("Slots loaded:", data?.length);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const resendHallTickets = async () => {
    if (!selectedExamDate) {
      toast.error("Please select an exam date");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setIsSendingHallTickets(true);
    
    try {
      // Fetch all registrations for the selected exam date AND time slot
      const { data: registrations, error: fetchError } = await supabase
        .from("registrations")
        .select("id, student_name, mobile_number, whatsapp_number, registration_number, hall_ticket_url")
        .eq("exam_date", selectedExamDate)
        .eq("time_slot", selectedSlot)
        .not("registration_number", "is", null);

      if (fetchError) throw fetchError;

      if (!registrations || registrations.length === 0) {
        toast.error(`No registrations found for ${selectedSlot} on this exam date`);
        setIsSendingHallTickets(false);
        return;
      }

      toast.info(`Sending hall tickets to ${registrations.length} students in ${selectedSlot}...`);

      let successCount = 0;
      let failCount = 0;

      // Send WhatsApp messages to all registrations
      for (const reg of registrations) {
        try {
          const phoneNumber = reg.whatsapp_number || reg.mobile_number;
          
          if (!phoneNumber) {
            failCount++;
            continue;
          }

          // Call the send-whatsapp edge function
          const { error: sendError } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              phoneNumber: phoneNumber,
              messageType: 'hall_ticket',
              templateName: 'hallticketmegaspark_2',
              registrationId: reg.id,
              studentName: reg.student_name,
              registrationNumber: reg.registration_number,
              hallTicketUrl: reg.hall_ticket_url
            }
          });

          if (sendError) {
            console.error(`Failed to send to ${phoneNumber}:`, sendError);
            failCount++;
          } else {
            successCount++;
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Error sending individual message:", error);
          failCount++;
        }
      }

      toast.success(
        `Hall tickets sent successfully!\nSuccess: ${successCount}\nFailed: ${failCount}`,
        { duration: 5000 }
      );
    } catch (error: any) {
      console.error("Error resending hall tickets:", error);
      toast.error(error.message || "Failed to resend hall tickets");
    } finally {
      setIsSendingHallTickets(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get date boundaries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch total counts efficiently
      const { count: totalRegistrations } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true });

      const { count: todayCount } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      const { count: yesterdayCount } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", yesterday.toISOString())
        .lt("created_at", today.toISOString());

      // Fetch recent registrations only (last 5)
      const { data: recentRegistrations } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch payment stats
      const { count: totalPayments } = await supabase
        .from("payments")
        .select("*", { count: 'exact', head: true });

      const { count: successfulPayments } = await supabase
        .from("payments")
        .select("*", { count: 'exact', head: true })
        .eq("status", "success");

      const { count: failedPayments } = await supabase
        .from("payments")
        .select("*", { count: 'exact', head: true })
        .eq("status", "failed");

      // Fetch recent payments only (last 5)
      const { data: recentPayments } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Calculate total revenue from successful payments only
      const { data: successPaymentData } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "success");
      
      const totalRevenue = successPaymentData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch registrations by standard (use limit and pagination for large datasets)
      const registrationsByStandard: Record<string, number> = {};
      const standards = ["5", "6", "7", "8", "9", "10"];
      
      for (const standard of standards) {
        const { count } = await supabase
          .from("registrations")
          .select("*", { count: 'exact', head: true })
          .eq("standard", standard);
        if (count && count > 0) {
          registrationsByStandard[standard] = count;
        }
      }

      // Fetch registrations by medium (use count queries)
      const registrationsByMedium: Record<string, number> = {};
      const mediums = ["English", "Gujarati"];
      
      for (const medium of mediums) {
        const { count } = await supabase
          .from("registrations")
          .select("*", { count: 'exact', head: true })
          .eq("medium", medium);
        if (count && count > 0) {
          registrationsByMedium[medium] = count;
        }
      }

      // Generate registration trend data for last 7 days
      const registrationTrendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const { count } = await supabase
          .from("registrations")
          .select("*", { count: 'exact', head: true })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDate.toISOString());
        
        registrationTrendData.push({
          date: format(date, 'MMM dd'),
          registrations: count || 0,
        });
      }

      setStats({
        totalRegistrations: totalRegistrations || 0,
        todayRegistrations: todayCount || 0,
        yesterdayRegistrations: yesterdayCount || 0,
        totalPayments: totalPayments || 0,
        successfulPayments: successfulPayments || 0,
        failedPayments: failedPayments || 0,
        totalRevenue,
        registrationsByStandard,
        registrationsByMedium,
        recentRegistrations: recentRegistrations || [],
        recentPayments: recentPayments || [],
        registrationTrendData,
      });

      toast.success(`Dashboard refreshed - ${totalRegistrations || 0} total registrations`);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const standardChartData = Object.entries(stats.registrationsByStandard).map(([key, value]) => ({
    name: `Standard ${key}`,
    value: value,
  }));

  const mediumChartData = Object.entries(stats.registrationsByMedium).map(([key, value]) => ({
    name: formatMedium(key),
    value: value,
  }));

  const paymentStatusData = [
    { name: "Success", value: stats.successfulPayments },
    { name: "Failed", value: stats.failedPayments },
    { name: "Pending", value: stats.totalPayments - stats.successfulPayments - stats.failedPayments },
  ].filter((item) => item.value > 0);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your exam management system</p>
              </div>
              <Button onClick={fetchDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                  <p className="text-xs text-muted-foreground">All-time students enrolled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today Registrations</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayRegistrations}</div>
                  <p className="text-xs text-muted-foreground">Registered today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Yesterday Registrations</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.yesterdayRegistrations}</div>
                  <p className="text-xs text-muted-foreground">Registered yesterday</p>
                </CardContent>
              </Card>
            </div>

            {/* Hall Ticket Reminder Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Reminder Hall Ticket
                </CardTitle>
                <CardDescription>
                  Select an exam date and resend hall tickets to all registered students via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedExamDate} onValueChange={setSelectedExamDate}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Exam Date" />
                      </SelectTrigger>
                      <SelectContent>
                        {examDates.length === 0 ? (
                          <SelectItem value="no-dates" disabled>
                            No exam dates available
                          </SelectItem>
                        ) : (
                          examDates.map((date) => (
                            <SelectItem key={date} value={date}>
                              {format(new Date(date), "dd MMMM yyyy")}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Time Slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.length === 0 ? (
                          <SelectItem value="no-slots" disabled>
                            No slots available
                          </SelectItem>
                        ) : (
                          slots.map((slot) => (
                            <SelectItem key={slot.slot_name} value={slot.slot_name}>
                              {slot.slot_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={resendHallTickets}
                    disabled={!selectedExamDate || !selectedSlot || isSendingHallTickets}
                    className="gap-2"
                  >
                    {isSendingHallTickets ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Resend All Hall Tickets
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registration Trend Graph */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Registration Trend (Last 7 Days)
                </CardTitle>
                <CardDescription>Daily registration count over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.registrationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="registrations" 
                      fill="hsl(var(--primary))" 
                      name="Registrations"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stats Comparison Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalRegistrations}</div>
                  <p className="text-xs text-muted-foreground mt-1">All-time students enrolled</p>
                  <ResponsiveContainer width="100%" height={60} className="mt-3">
                    <BarChart data={[
                      { name: 'Total', value: stats.totalRegistrations }
                    ]}>
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today Registrations</CardTitle>
                  <Calendar className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.todayRegistrations}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered today</p>
                  <ResponsiveContainer width="100%" height={60} className="mt-3">
                    <BarChart data={[
                      { name: 'Today', value: stats.todayRegistrations }
                    ]}>
                      <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Yesterday Registrations</CardTitle>
                  <Calendar className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.yesterdayRegistrations}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered yesterday</p>
                  <ResponsiveContainer width="100%" height={60} className="mt-3">
                    <BarChart data={[
                      { name: 'Yesterday', value: stats.yesterdayRegistrations }
                    ]}>
                      <Bar dataKey="value" fill="#ea580c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Registrations</CardTitle>
                  <CardDescription>Latest 5 student registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentRegistrations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No registrations yet
                      </p>
                    ) : (
                      stats.recentRegistrations.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{reg.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatRegistrationNumber(reg.registration_number)} • Standard {reg.standard}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(reg.created_at), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest 5 payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentPayments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No payments yet
                      </p>
                    ) : (
                      stats.recentPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{payment.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{payment.amount} • {payment.payment_type}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge
                              className={
                                payment.status === "success"
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : payment.status === "failed"
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : ""
                              }
                              variant={
                                payment.status === "success" || payment.status === "failed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.created_at), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
