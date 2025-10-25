import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, FileText, Settings, Users, CreditCard, LayoutDashboard, Tag } from "lucide-react";
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
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { title: "Registrations", icon: Users, path: "/admin" },
    { title: "Coupons", icon: Tag, path: "/admin/coupons" },
    { title: "Payments", icon: CreditCard, path: "/admin/payments" },
    { title: "Reports", icon: FileText, path: "/admin/reports" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent>
        {/* Header with Logo */}
        <div className="p-6 border-b">
          <img src={logo} alt="P.R. SAVANI MEGA SPARK" className="h-16 mx-auto mb-3" />
          <div className="text-center">
            <h2 className="font-bold text-lg">MEGA SPARK</h2>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
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
                  >
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
