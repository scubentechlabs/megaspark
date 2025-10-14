import { useState, useEffect } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ExamDatesVenue } from "@/components/ExamDatesVenue";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { DownloadGuide } from "@/components/DownloadGuide";
import { RegistrationSection } from "@/components/RegistrationSection";
import { HelpBox } from "@/components/HelpBox";
import { FinalCTA } from "@/components/FinalCTA";
import { NewFooter } from "@/components/NewFooter";
import { MultiStepRegistration } from "@/components/MultiStepRegistration";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const Index = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    // Open popup when website loads
    setIsPopupOpen(true);
  }, []);

  return (
    <main className="min-h-screen">
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
      <ExamDatesVenue />
      <EligibilityCriteria />
      <DownloadGuide />
      <RegistrationSection />
      <HelpBox />
      <FinalCTA onRegisterClick={() => {
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <NewFooter />
    </main>
  );
};

export default Index;
