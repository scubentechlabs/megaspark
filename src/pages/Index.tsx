import { useState, useEffect } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ResultsPoster } from "@/components/ResultsPoster";

import { Toppers } from "@/components/Toppers";
import { RegistrationSection } from "@/components/RegistrationSection";
import { HelpBox } from "@/components/HelpBox";
import { FinalCTA } from "@/components/FinalCTA";
import { NewFooter } from "@/components/NewFooter";
import { MultiStepRegistration } from "@/components/MultiStepRegistration";
import { MaintenancePage } from "@/components/MaintenancePage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();
    
    // Open popup after 10 seconds
    const timer = setTimeout(() => {
      setIsPopupOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      // Fetch maintenance mode setting
      const { data, error } = await supabase
        .from('settings')
        .select('maintenance_mode')
        .single();

      if (error) {
        console.error('Error fetching maintenance mode:', error);
        setIsLoading(false);
        return;
      }

      // Check if we're on a Lovable preview domain
      const hostname = window.location.hostname;
      const isLovableDomain = hostname.includes('lovable.app') || hostname.includes('lovableproject.com');
      
      // Show maintenance mode only if:
      // 1. Maintenance mode is enabled in settings
      // 2. NOT on a Lovable preview domain
      if (data?.maintenance_mode && !isLovableDomain) {
        setIsMaintenanceMode(true);
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <main className="min-h-screen">
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <VisuallyHidden>
            <DialogTitle>Registration Form</DialogTitle>
            <DialogDescription>Complete your exam registration</DialogDescription>
          </VisuallyHidden>
          <MultiStepRegistration onClose={() => setIsPopupOpen(false)} />
        </DialogContent>
      </Dialog>

      <NewHeader onRegisterClick={() => {
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <NewHero onRegisterClick={() => {
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <BenefitsSection />
      <ResultsPoster />
      <RegistrationSection />
      <Toppers />
      <HelpBox />
      <FinalCTA onRegisterClick={() => {
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <NewFooter />
    </main>
  );
};

export default Index;
