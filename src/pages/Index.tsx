import { useState, useEffect } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ResultsPoster } from "@/components/ResultsPoster";
import { ExamDatesVenue } from "@/components/ExamDatesVenue";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { DownloadGuide } from "@/components/DownloadGuide";
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
import { useMaintenanceMode } from "@/hooks/useExamData";

const Index = () => {
  const { data: isMaintenanceMode, isLoading } = useMaintenanceMode();

  // Don't block rendering for maintenance check - show page immediately

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
      <ExamDatesVenue />
      <EligibilityCriteria />
      <DownloadGuide />
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
