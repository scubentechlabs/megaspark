import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Download, Users, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";

interface Registration {
  id: string;
  mobile_number: string;
  student_name: string;
  email: string;
  standard: string;
  medium: string;
  exam_center: string;
  registration_number: string;
  hall_ticket_url: string | null;
  created_at: string;
}

export default function Admin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

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

  const exportToCSV = () => {
    const headers = [
      "Registration Number",
      "Student Name",
      "Email",
      "Mobile Number",
      "Standard",
      "Medium",
      "Exam Center",
      "Registration Date",
    ];

    const csvData = filteredRegistrations.map((reg) => [
      reg.registration_number,
      reg.student_name,
      reg.email,
      reg.mobile_number,
      reg.standard,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src={logo} alt="Logo" className="h-12" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground">Manage all exam registrations</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
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

          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                By Medium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.byMedium).map(([medium, count]) => (
                  <p key={medium} className="text-sm">
                    <span className="font-semibold">{medium}:</span> {count}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, email, or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle>
              All Registrations ({filteredRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading registrations...</div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registrations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg. No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Medium</TableHead>
                      <TableHead>Exam Center</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.registration_number}</TableCell>
                        <TableCell>{reg.student_name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.mobile_number}</TableCell>
                        <TableCell>{reg.standard}</TableCell>
                        <TableCell>{reg.medium}</TableCell>
                        <TableCell>{reg.exam_center}</TableCell>
                        <TableCell>
                          {new Date(reg.created_at).toLocaleDateString()}
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
    </div>
  );
}
