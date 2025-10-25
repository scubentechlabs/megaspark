import { CouponManagement } from "@/components/admin/CouponManagement";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Coupons() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="h-16 border-b flex items-center px-6 bg-background">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold">Coupon Management</h1>
          </header>
          <main className="p-6">
            <CouponManagement />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}