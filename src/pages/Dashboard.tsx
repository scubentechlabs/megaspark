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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatMedium } from "@/lib/formatters";
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch registrations
      const { data: registrations, error: regError } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (regError) throw regError;

      // Fetch payments
      const { data: payments, error: payError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (payError) throw payError;

      // Get today and yesterday dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Calculate today's and yesterday's registrations
      const todayRegistrations = registrations?.filter((reg) => {
        const regDate = new Date(reg.created_at);
        return regDate >= today && regDate < tomorrow;
      }) || [];

      const yesterdayRegistrations = registrations?.filter((reg) => {
        const regDate = new Date(reg.created_at);
        return regDate >= yesterday && regDate < today;
      }) || [];

      // Calculate statistics
      const registrationsByStandard = registrations?.reduce((acc: any, reg) => {
        acc[reg.standard] = (acc[reg.standard] || 0) + 1;
        return acc;
      }, {}) || {};

      const registrationsByMedium = registrations?.reduce((acc: any, reg) => {
        acc[reg.medium] = (acc[reg.medium] || 0) + 1;
        return acc;
      }, {}) || {};

      const successfulPayments = payments?.filter((p) => p.status === "success") || [];
      const failedPayments = payments?.filter((p) => p.status === "failed") || [];
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Generate registration trend data for last 7 days
      const registrationTrendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const count = registrations?.filter((reg) => {
          const regDate = new Date(reg.created_at);
          return regDate >= date && regDate < nextDate;
        }).length || 0;
        
        registrationTrendData.push({
          date: format(date, 'MMM dd'),
          registrations: count,
        });
      }

      setStats({
        totalRegistrations: registrations?.length || 0,
        todayRegistrations: todayRegistrations.length,
        yesterdayRegistrations: yesterdayRegistrations.length,
        totalPayments: payments?.length || 0,
        successfulPayments: successfulPayments.length,
        failedPayments: failedPayments.length,
        totalRevenue,
        registrationsByStandard,
        registrationsByMedium,
        recentRegistrations: registrations?.slice(0, 5) || [],
        recentPayments: payments?.slice(0, 5) || [],
        registrationTrendData,
      });

      toast.success("Dashboard data loaded");
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
    <SidebarProvider>
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
                              {reg.registration_number} • Standard {reg.standard}
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
