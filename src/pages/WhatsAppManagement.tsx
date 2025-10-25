import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MessageSquare, CheckCircle, XCircle, Link, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppMessage {
  id: string;
  phone_number: string;
  message_type: string;
  status: string;
  link_opened: boolean;
  certificate_downloaded: boolean;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface Stats {
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  linksOpened: number;
  certificatesDownloaded: number;
}

export default function WhatsAppManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    sentMessages: 0,
    failedMessages: 0,
    linksOpened: 0,
    certificatesDownloaded: 0,
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
    fetchData();
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const messages = data || [];
      setMessages(messages);

      // Calculate stats
      const stats = {
        totalMessages: messages.length,
        sentMessages: messages.filter(m => m.status === 'sent' || m.status === 'delivered').length,
        failedMessages: messages.filter(m => m.status === 'failed').length,
        linksOpened: messages.filter(m => m.link_opened).length,
        certificatesDownloaded: messages.filter(m => m.certificate_downloaded).length,
      };

      setStats(stats);

      toast({
        title: "Data Loaded",
        description: `Loaded ${messages.length} WhatsApp messages`,
      });
    } catch (error: any) {
      console.error("Error fetching WhatsApp data:", error);
      toast({
        title: "Error",
        description: "Failed to load WhatsApp data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading WhatsApp data...</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header Bar */}
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">WhatsApp Management</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Total Messages Sent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalMessages}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Success WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{stats.sentMessages}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Failed WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{stats.failedMessages}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-600" />
                      Links Opened
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">{stats.linksOpened}</p>
                  </CardContent>
                </Card>

                <Card className="bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4 text-purple-600" />
                      Certificates Downloaded
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600">{stats.certificatesDownloaded}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Messages Table */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-xl font-semibold">Recent WhatsApp Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Message Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Link Opened</TableHead>
                          <TableHead>Certificate Downloaded</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No WhatsApp messages found
                            </TableCell>
                          </TableRow>
                        ) : (
                          messages.map((msg) => (
                            <TableRow key={msg.id}>
                              <TableCell className="font-medium">{msg.phone_number}</TableCell>
                              <TableCell className="capitalize">{msg.message_type}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  msg.status === 'sent' || msg.status === 'delivered'
                                    ? 'bg-green-100 text-green-700'
                                    : msg.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {msg.status === 'sent' || msg.status === 'delivered' ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : msg.status === 'failed' ? (
                                    <XCircle className="h-3 w-3" />
                                  ) : null}
                                  {msg.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {msg.link_opened ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400" />
                                )}
                              </TableCell>
                              <TableCell>
                                {msg.certificate_downloaded ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400" />
                                )}
                              </TableCell>
                              <TableCell>
                                {msg.sent_at
                                  ? new Date(msg.sent_at).toLocaleString()
                                  : 'Not sent'}
                              </TableCell>
                              <TableCell className="text-xs text-red-600">
                                {msg.error_message || '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
