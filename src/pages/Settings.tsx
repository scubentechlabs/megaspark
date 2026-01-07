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
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Save, Download, Database, FileText, Code, HardDrive } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [examSettings, setExamSettings] = useState({
    examName: "MEGA SPARK NATIONAL CHAMPION",
    organizationName: "P.R. SAVANI",
    contactEmail: "info@megaspark.com",
    contactPhone: "+91 1234567890",
    maintenanceMode: false,
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
              exam_name: "MEGA SPARK NATIONAL CHAMPION",
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
              maintenanceMode: newSettings.maintenance_mode || false,
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
          maintenanceMode: data.maintenance_mode || false,
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
          maintenance_mode: examSettings.maintenanceMode,
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

  const downloadBackup = async (type: 'registrations' | 'payments' | 'coupons' | 'all' | 'sql') => {
    setIsDownloading(true);
    try {
      // Handle SQL backup separately
      if (type === 'sql') {
        toast({
          title: "Generating SQL Backup",
          description: "Please wait while we generate your SQL database backup...",
        });

        const { data: sqlData, error: sqlError } = await supabase.functions.invoke('generate-sql-backup');
        
        if (sqlError) throw sqlError;

        const blob = new Blob([sqlData], { type: 'application/sql' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database-backup-${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "SQL Backup Complete",
          description: "SQL database backup downloaded successfully",
        });
        return;
      }

      let data: any[] = [];
      let filename = '';
      
      if (type === 'all') {
        // Download all data as complete backup
        const [regData, payData, couponData, settingsData] = await Promise.all([
          supabase.from('registrations').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*').order('created_at', { ascending: false }),
          supabase.from('coupons').select('*').order('created_at', { ascending: false }),
          supabase.from('settings').select('*')
        ]);

        const backup = {
          backup_date: new Date().toISOString(),
          version: '3.1.1',
          data: {
            registrations: regData.data || [],
            payments: payData.data || [],
            coupons: couponData.data || [],
            settings: settingsData.data || []
          },
          stats: {
            total_registrations: regData.data?.length || 0,
            total_payments: payData.data?.length || 0,
            total_coupons: couponData.data?.length || 0
          }
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `full-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Backup Complete",
          description: "Complete database backup downloaded successfully",
        });
        return;
      }

      // Download specific table data
      const { data: tableData, error } = await supabase
        .from(type)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      data = tableData || [];
      filename = `${type}-backup-${new Date().toISOString().split('T')[0]}.csv`;

      // Convert to CSV
      if (data.length === 0) {
        toast({
          title: "No Data",
          description: `No ${type} data found to download`,
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${type} data downloaded successfully (${data.length} records)`,
      });
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download backup data",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1">
          <header className="h-14 border-b flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </header>
          <div className="p-6 space-y-6">
            
            {/* Maintenance Mode */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Maintenance Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="maintenance-mode" className="text-base font-medium">
                      Enable Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, visitors will see a maintenance message.
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={examSettings.maintenanceMode}
                    onCheckedChange={(checked) => {
                      setExamSettings({ ...examSettings, maintenanceMode: checked });
                      // Auto-save maintenance mode changes
                      handleSave();
                    }}
                  />
                </div>
              </CardContent>
            </Card>

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

            {/* Backup & Download */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Download
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-6">
                  Download backup copies of your database for safekeeping and data analysis.
                </p>
                
                {/* Primary Backup Options */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Complete Backups</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="default"
                      onClick={() => downloadBackup('sql')}
                      disabled={isDownloading}
                      className="h-auto py-4 flex flex-col items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      <HardDrive className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">SQL Database Backup</div>
                        <div className="text-xs opacity-80">All tables with INSERT statements</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => downloadBackup('all')}
                      disabled={isDownloading}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <Database className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">JSON Backup</div>
                        <div className="text-xs text-muted-foreground">All data in JSON format</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Individual Table Downloads */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Individual Tables (CSV)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => downloadBackup('registrations')}
                      disabled={isDownloading}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <FileText className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium text-sm">Registrations</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => downloadBackup('payments')}
                      disabled={isDownloading}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <Download className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium text-sm">Payments</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => downloadBackup('coupons')}
                      disabled={isDownloading}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <FileText className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium text-sm">Coupons</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Source Code Note */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Source Code Backup</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        To download the complete source code, use GitHub. Go to your repository and click "Code" → "Download ZIP".
                      </p>
                    </div>
                  </div>
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
                    <span className="font-medium">3.1.1 (Beta)</span>
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
