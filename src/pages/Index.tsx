import { useState } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ExamDatesVenue } from "@/components/ExamDatesVenue";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { DownloadGuide } from "@/components/DownloadGuide";
import { Newsletter } from "@/components/Newsletter";
import { NewFooter } from "@/components/NewFooter";
import { MultiStepRegistration } from "@/components/MultiStepRegistration";

const Index = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <main className="min-h-screen">
      <NewHeader onRegisterClick={() => setShowRegistrationForm(true)} />
      <NewHero onRegisterClick={() => setShowRegistrationForm(true)} />
      <BenefitsSection />
      <ExamDatesVenue />
      <EligibilityCriteria />
      <DownloadGuide />
      <Newsletter />
      <NewFooter />
      
      {showRegistrationForm && (
        <MultiStepRegistration onClose={() => setShowRegistrationForm(false)} />
      )}
    </main>
  );
};

export default Index;
