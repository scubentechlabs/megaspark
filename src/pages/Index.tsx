import { useState } from "react";
import { Header } from "@/components/Header";
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
      <Header onRegisterClick={() => setShowRegistrationForm(true)} />
      <Hero onRegisterClick={() => setShowRegistrationForm(true)} />
      <section id="benefits">
        <Benefits />
      </section>
      <section id="eligibility">
        <Eligibility />
      </section>
      <section id="timeline">
        <Timeline />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <Footer />
      
      {showRegistrationForm && (
        <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}
    </main>
  );
};

export default Index;
