import { useState } from "react";
import { NewHeader } from "@/components/NewHeader";
import { NewHero } from "@/components/NewHero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { Categories } from "@/components/Categories";
import { About } from "@/components/About";
import { Newsletter } from "@/components/Newsletter";
import { NewFooter } from "@/components/NewFooter";
import { RegistrationForm } from "@/components/RegistrationForm";

const Index = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <main className="min-h-screen">
      <NewHeader onRegisterClick={() => setShowRegistrationForm(true)} />
      <NewHero onRegisterClick={() => setShowRegistrationForm(true)} />
      <BenefitsSection />
      <Categories />
      <About />
      <Newsletter />
      <NewFooter />
      
      {showRegistrationForm && (
        <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}
    </main>
  );
};

export default Index;
