import { NewHeader } from "@/components/NewHeader";
import { NewFooter } from "@/components/NewFooter";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <NewHeader onRegisterClick={() => {}} />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: June 2025</p>

          <div className="space-y-8 text-foreground">
            <p className="leading-relaxed">
              At MegaSpark, powered by ScubenTech Labs, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you access our website, participate in our programs, or make payments through our integrated gateways (including PhonePe and other providers).
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-3">We may collect:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Personal Identifiers:</strong> Name, email, phone number, address.</li>
                <li><strong>Transaction Data:</strong> Payment details, transaction IDs, billing information (processed securely through third-party gateways).</li>
                <li><strong>Usage Data:</strong> IP address, device type, browser information, pages visited, time spent on the site.</li>
                <li><strong>Communications:</strong> Emails, forms, and support messages sent to us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
              <p className="mb-3">Your data helps us to:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Process and confirm your registrations and payments.</li>
                <li>Provide access to exams, results, and related services.</li>
                <li>Communicate important updates, schedules, or announcements.</li>
                <li>Detect and prevent fraudulent activity.</li>
                <li>Improve our services and website experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Sharing of Data</h2>
              <p className="mb-3">We do not sell or rent your personal data. We only share information with:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Payment Gateways:</strong> For secure processing of your payments.</li>
                <li><strong>Service Providers:</strong> Hosting, analytics, and IT support.</li>
                <li><strong>Legal Authorities:</strong> If required to comply with applicable laws or enforce policies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your data only as long as necessary for service delivery, record-keeping, or compliance with legal requirements. Once data is no longer needed, it is safely deleted or anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
              <p className="leading-relaxed">
                We follow industry-standard practices to protect your personal information. However, no system is 100% secure, and we cannot guarantee absolute protection against cyber risks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="leading-relaxed">
                You may request access, correction, or deletion of your personal data by contacting us directly. Depending on your jurisdiction, you may also object to certain processing or withdraw consent for marketing communication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="leading-relaxed">
                Our website may use cookies and tracking technologies to remember preferences, enable login sessions, and improve overall user experience. You can control cookies from your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Updates to Policy</h2>
              <p className="leading-relaxed">
                We may revise this Privacy Policy occasionally. Any significant updates will be posted on this page with a new "last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="leading-relaxed mb-2">
                For any concerns regarding this policy, please reach out at:
              </p>
              <ul className="space-y-1 list-none">
                <li>Email: <a href="mailto:digital.cfe.ppsavani@gmail.com" className="text-primary hover:underline">digital.cfe.ppsavani@gmail.com</a></li>
                <li>Phone: <a href="tel:+919824285623" className="text-primary hover:underline">+91 98242 85623</a></li>
              </ul>
            </section>
          </div>
        </article>
      </main>

      <NewFooter />
    </div>
  );
};

export default PrivacyPolicy;
