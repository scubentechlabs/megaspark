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
import { MaintenancePage } from "@/components/MaintenancePage";
import { useMaintenanceMode } from "@/hooks/useExamData";

const Index = () => {
  const { data: isMaintenanceMode, isLoading } = useMaintenanceMode();

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <main className="min-h-screen">
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
