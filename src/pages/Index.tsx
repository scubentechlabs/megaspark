import { useState } from "react";
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
      <HelpBox />
      <FinalCTA onRegisterClick={() => {
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />
      <NewFooter />
    </main>
  );
};

export default Index;
