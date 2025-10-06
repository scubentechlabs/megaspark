import { NewHeader } from "@/components/NewHeader";
import { NewFooter } from "@/components/NewFooter";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: June 2025</p>

          <div className="space-y-8 text-foreground">
            <p className="leading-relaxed">
              At MegaSpark, we aim to deliver high-quality exam and educational services. Please read this refund policy carefully before making a payment.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. No Refund Policy</h2>
              <ul className="space-y-2 list-disc pl-6">
                <li>All payments made for registrations, services, or programs through our website or PhonePe payment gateway are final and non-refundable.</li>
                <li>Once a payment is processed and your seat/registration/service is confirmed, no cancellation or refund will be issued.</li>
                <li>By proceeding with a payment, you accept and agree to this strict no-refund policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Exceptional Cases (At Our Discretion)</h2>
              <p className="mb-3">Refunds may only be considered under rare circumstances such as:</p>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li><strong>Duplicate Transaction:</strong> If you are accidentally charged twice for the same service.</li>
                <li><strong>Technical Error:</strong> If a technical failure on our side prevents you from accessing the service you paid for.</li>
                <li><strong>Service Not Delivered:</strong> If, due to unforeseen reasons, we fail to provide the promised service.</li>
              </ul>
              <p className="leading-relaxed">
                Any approved refund will be processed only after verification and may take 7–10 business days, minus applicable charges (transaction/processing fees).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cancellation Policy</h2>
              <ul className="space-y-2 list-disc pl-6">
                <li>Users may cancel their participation before the service/exam begins. However, cancellation does not guarantee a refund.</li>
                <li>Once the service has been initiated (e.g., registration confirmed, access granted), no cancellation or refund will be entertained.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Dispute Resolution</h2>
              <p className="leading-relaxed">
                In case of disputes related to payments, you are encouraged to contact our support team first. If unresolved, disputes will be governed by the jurisdiction and laws applicable at our business location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact for Refund Queries</h2>
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

export default RefundPolicy;
