import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Mail, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Subscriber {
  id: string;
  email: string;
  phone_number: string | null;
  subscribed_at: string;
}

export default function NewsletterManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      fetchData();
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);

      toast({
        title: "Data Loaded",
        description: `Loaded ${data?.length || 0} newsletter subscribers`,
      });
    } catch (error: any) {
      console.error("Error fetching newsletter data:", error);
      toast({
        title: "Error",
        description: "Failed to load newsletter data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!phoneNumber || !whatsappMessage) {
      toast({
        title: "Error",
        description: "Please provide phone number and message",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phoneNumber,
          messageType: 'newsletter',
          messageBody: whatsappMessage,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp message sent successfully!",
      });

      setPhoneNumber("");
      setWhatsappMessage("");
    } catch (error: any) {
      console.error("Error sending WhatsApp:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send WhatsApp message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-lg">Loading newsletter data...</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Newsletter Management</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send WhatsApp Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      placeholder="Enter phone number (e.g., 919876543210)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Enter your message"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <Button 
                    onClick={handleSendWhatsApp} 
                    disabled={isSending}
                    className="w-full"
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </header>

          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <Card className="bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Total Subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{subscribers.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-xl font-semibold">Newsletter Subscribers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Subscribed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              No subscribers found
                            </TableCell>
                          </TableRow>
                        ) : (
                          subscribers.map((subscriber) => (
                            <TableRow key={subscriber.id}>
                              <TableCell className="font-medium">{subscriber.email}</TableCell>
                              <TableCell>{subscriber.phone_number || '-'}</TableCell>
                              <TableCell>
                                {new Date(subscriber.subscribed_at).toLocaleString()}
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
