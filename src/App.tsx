import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Coupons from "./pages/Coupons";

import RegistrationSuccess from "./pages/RegistrationSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsConditions from "./pages/TermsConditions";
import WhatsAppManagement from "./pages/WhatsAppManagement";
import NewsletterManagement from "./pages/NewsletterManagement";
import NotFound from "./pages/NotFound";
import UploadPoster from "./pages/UploadPoster";
import ActiveSessions from "./pages/ActiveSessions";
import UserManagement from "./pages/UserManagement";
import SlotManagement from "./pages/SlotManagement";
import ExamDateManagement from "./pages/ExamDateManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    let isBlocked = false;
    const blockPage = () => {
      if (isBlocked) return;
      isBlocked = true;
      try {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0a0a0a;color:#fff;"><div style="text-align:center;"><h1 style="font-size:2rem;margin-bottom:1rem;">⚠️ Access Denied</h1><p>Developer tools are not allowed on this website.</p><p style="margin-top:1rem;color:#888;">Please close developer tools and refresh the page.</p></div></div>';
      } catch {}
    };

    // 1. Disable right-click
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); return false; };

    // 2. Block all dev tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); e.stopPropagation(); return false; }
      if (e.ctrlKey && e.shiftKey && /^[IJCEKMijcekm]$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); return false; }
      if (e.ctrlKey && /^[uUsS]$/.test(e.key) && !e.shiftKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); return false; }
      if (e.metaKey && e.altKey && /^[IJCUijcu]$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); return false; }
    };

    // 3. Disable selection, drag, copy
    const handleSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return true;
      e.preventDefault(); return false;
    };
    const handleDragStart = (e: DragEvent) => { e.preventDefault(); return false; };
    const handleCopy = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return true;
      e.preventDefault(); return false;
    };

    // 4. DevTools detection: window size diff
    const checkWindowSize = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        blockPage();
      }
    };

    // 5. DevTools detection: debugger timing
    const checkDebuggerTiming = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const duration = performance.now() - start;
      if (duration > 100) {
        blockPage();
      }
    };

    // 6. DevTools detection: console-based (image trick)
    const checkConsoleOpen = () => {
      const element = new Image();
      let consoleOpen = false;
      Object.defineProperty(element, 'id', {
        get: () => {
          consoleOpen = true;
          blockPage();
          return '';
        },
      });
      // Accessing console.log with the element triggers getter if DevTools console is open
      console.log('%c', element as any);
      console.clear();
    };

    // 7. Neutralize console to prevent data leakage
    const noop = () => {};
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      Object.keys(console).forEach((key) => {
        try { (console as any)[key] = noop; } catch {}
      });
    }
    // Always clear console periodically
    const consoleClearInterval = setInterval(() => {
      try { console.clear(); } catch {}
    }, 500);

    // 8. Run all detection checks
    const detectionInterval = setInterval(() => {
      checkWindowSize();
      try { checkConsoleOpen(); } catch {}
    }, 1000);

    // Run debugger check less frequently (it pauses execution when DevTools open)
    const debuggerInterval = setInterval(() => {
      try { checkDebuggerTiming(); } catch {}
    }, 3000);

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      clearInterval(detectionInterval);
      clearInterval(debuggerInterval);
      clearInterval(consoleClearInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/active-sessions" element={<ActiveSessions />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/slots" element={<SlotManagement />} />
        <Route path="/admin/exam-dates" element={<ExamDateManagement />} />
        <Route path="/admin/coupons" element={<Coupons />} />
        <Route path="/admin/whatsapp" element={<WhatsAppManagement />} />
        <Route path="/admin/newsletter" element={<NewsletterManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
          
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/upload-poster" element={<UploadPoster />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
