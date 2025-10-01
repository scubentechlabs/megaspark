import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { Eligibility } from "@/components/Eligibility";
import { Timeline } from "@/components/Timeline";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { RegistrationForm } from "@/components/RegistrationForm";

const Index = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  return (
    <main className="min-h-screen">
      <Hero onRegisterClick={() => setShowRegistrationForm(true)} />
      <Benefits />
      <Eligibility />
      <Timeline />
      <FAQ />
      <Footer />
      
      {showRegistrationForm && (
        <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}
    </main>
  );
};

export default Index;
