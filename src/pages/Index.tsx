import { useState } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ExamDatesVenue } from "@/components/ExamDatesVenue";
import { EligibilityCriteria } from "@/components/EligibilityCriteria";
import { DownloadGuide } from "@/components/DownloadGuide";
import { RegistrationSection } from "@/components/RegistrationSection";
import { FAQ } from "@/components/FAQ";
import { NewFooter } from "@/components/NewFooter";

const Index = () => {
  return (
    <main className="min-h-screen">
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
      <FAQ />
      <NewFooter />
    </main>
  );
};

export default Index;
