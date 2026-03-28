import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, FileText, Settings, Users, CreditCard, LayoutDashboard, Tag, MessageSquare, LogOut, User, Mail, Activity, UserCog, Clock, Calendar } from "lucide-react";
import logo from "@/assets/logo.png";
import { forceLocalSignOut, supabase } from "@/lib/supabaseProxy";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>("");
  const { open, setOpen } = useSidebar();
  const queryClient = useQueryClient();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { title: "Registrations", icon: Users, path: "/admin" },
    { title: "Active Sessions", icon: Activity, path: "/admin/active-sessions" },
    { title: "User Management", icon: UserCog, path: "/admin/user-management" },
    { title: "Slot Management", icon: Clock, path: "/admin/slots" },
    { title: "Exam Dates", icon: Calendar, path: "/admin/exam-dates" },
    { title: "Coupons", icon: Tag, path: "/admin/coupons" },
    { title: "WhatsApp", icon: MessageSquare, path: "/admin/whatsapp" },
    { title: "Newsletter", icon: Mail, path: "/admin/newsletter" },
    { title: "Upload Poster", icon: FileText, path: "/upload-poster" },
    { title: "Reports", icon: FileText, path: "/admin/reports" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUserInfo();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await supabase
          .from('admin_sessions')
          .update({ 
            is_active: false, 
            logout_time: new Date().toISOString() 
          })
          .eq('user_id', session.user.id)
          .eq('is_active', true);
      }

      const { error } = await supabase.auth.signOut();
      if (error && !/session not found/i.test(error.message)) {
        throw error;
      }

      await forceLocalSignOut();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <Sidebar 
      className="border-r bg-background"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header with Logo */}
        <div className="p-3 border-b">
          {open ? (
            <>
              <img src={logo} alt="P.R. SAVANI MEGA SPARK" className="h-16 mx-auto mb-3" />
              <div className="text-center">
                <h2 className="font-bold text-lg">MEGA SPARK</h2>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </>
          ) : (
            <img src={logo} alt="P.R. SAVANI MEGA SPARK" className="h-8 mx-auto" />
          )}
        </div>

        {/* Menu */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={
                      isActive(item.path)
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "hover:bg-muted"
                    }
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile & Logout Section */}
        <div className="mt-auto border-t p-4 space-y-3">
          {open ? (
            <>
              {/* User Profile */}
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* User Icon */}
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>

              {/* Logout Icon Button */}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
