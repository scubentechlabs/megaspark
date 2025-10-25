import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [examSettings, setExamSettings] = useState({
    examName: "MEGA SPARK EXAM 2025",
    organizationName: "P.R. SAVANI",
    contactEmail: "info@megaspark.com",
    contactPhone: "+91 1234567890",
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
    await loadSettings();
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default
          const { data: newSettings, error: insertError } = await supabase
            .from("settings")
            .insert({
              exam_name: "MEGA SPARK EXAM 2025",
              organization_name: "P.R. SAVANI",
              contact_email: "info@megaspark.com",
              contact_phone: "+91 1234567890"
            })
            .select()
            .single();

          if (insertError) throw insertError;
          if (newSettings) {
            setSettingsId(newSettings.id);
            setExamSettings({
              examName: newSettings.exam_name,
              organizationName: newSettings.organization_name,
              contactEmail: newSettings.contact_email,
              contactPhone: newSettings.contact_phone,
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setSettingsId(data.id);
        setExamSettings({
          examName: data.exam_name,
          organizationName: data.organization_name,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
        });
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settingsId) {
      toast({
        title: "Error",
        description: "Settings not initialized",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("settings")
        .update({
          exam_name: examSettings.examName,
          organization_name: examSettings.organizationName,
          contact_email: examSettings.contactEmail,
          contact_phone: examSettings.contactPhone,
        })
        .eq("id", settingsId);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <h1 className="text-2xl font-bold">Settings</h1>
          </header>
          <div className="p-6 space-y-6">
            
            {/* Exam Settings */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Exam Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="examName">Exam Name</Label>
                    <Input
                      id="examName"
                      value={examSettings.examName}
                      onChange={(e) => setExamSettings({ ...examSettings, examName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={examSettings.organizationName}
                      onChange={(e) => setExamSettings({ ...examSettings, organizationName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={examSettings.contactEmail}
                      onChange={(e) => setExamSettings({ ...examSettings, contactEmail: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={examSettings.contactPhone}
                      onChange={(e) => setExamSettings({ ...examSettings, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold">System Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
