import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <img src={logo} alt="P.P. SAVANI Centre for Excellence" className="h-16 mx-auto mb-4" />
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Terms & Conditions
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Last updated: January 2025
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="prose prose-sm max-w-none">
              <section className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to <strong>MegaSpark</strong> (megasparkexam.com) ("we", "us", "our", "Site"). 
                  Please read these Terms & Conditions ("Terms") carefully before using the Site or any of our services 
                  (including payment via PhonePe). By accessing or using the Site, you agree to these Terms, our Privacy Policy, 
                  and any amendments made from time to time. If you do not agree, you should not use the Site or services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">1. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>"User", "you", "your"</strong> means any individual or entity using the Site or availing services.</li>
                  <li><strong>"Services"</strong> means any products, programs, or features offered via the Site.</li>
                  <li><strong>"Payment Gateway"</strong> refers to the mechanism (e.g. PhonePe) used for online payments.</li>
                  <li><strong>"Transaction"</strong> means any payment or purchase carried out on the Site.</li>
                  <li><strong>"Content"</strong> includes all text, images, videos, audio, graphics, code, and other materials on the Site.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">2. Use of the Site</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.1 Eligibility</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You must be at least 18 years old (or of legal age to make binding contracts) to use our services. 
                  By using the Site, you represent that you meet this age requirement.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.2 Account Registration</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  You may need to register an account to access certain services or features. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-3">
                  <li>Provide accurate, current and complete information</li>
                  <li>Maintain and promptly update your information to keep it accurate</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.3 Prohibited Acts</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">You shall not:</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Use the Site for any unlawful purpose</li>
                  <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity</li>
                  <li>Upload, post, transmit any content that is infringing, defamatory, obscene, abusive, harassing, hateful, or objectionable</li>
                  <li>Interfere with or disrupt the Site or servers or networks connected to the Site</li>
                  <li>Attempt to gain unauthorized access to other accounts, computer systems, or networks</li>
                  <li>Use any automated means (bots, scrapers) to access or use the Site, except as explicitly permitted</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">3. Orders, Payments & Transactions</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.1 Placing Orders</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you place an order or subscribe to a program, you must provide required details (name, contact, billing address). 
                  We reserve the right to refuse or cancel any order at our discretion (for example, due to product unavailability, fraud, or error in pricing).
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.2 Payment Gateway</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We accept payments through PhonePe (or any alternative gateway we specify).
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-3">
                  <li>You authorize us to charge your selected payment method for all transactions you initiate</li>
                  <li>You agree to follow the payment gateway's terms, which may include user agreements, dispute resolution, etc.</li>
                  <li>We do not store or process your full payment method details (e.g. complete credit/debit card numbers) — the payment gateway handles that</li>
                  <li>If a transaction fails, is disputed, reversed, or flagged, we may cancel or suspend your access to the relevant service until resolved</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.3 Pricing & Taxes</h3>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-3">
                  <li>Prices listed are inclusive/exclusive of applicable taxes (as specified)</li>
                  <li>You are responsible for any taxes, duties, or levies imposed by relevant authorities</li>
                  <li>We may change or revise prices at any time; but any change will not apply retroactively to transactions already accepted</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3.4 Refunds & Cancellations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our refund and cancellation policies are described separately (see Refund Policy). To the extent permitted by law, 
                  you agree not to dispute a valid charge on your Payment Method.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">4. Access, Use & Intellectual Property</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">4.1 Licenses</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to use the Site for your personal 
                  or internal use, subject to compliance with these Terms.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">4.2 Ownership</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  All content, trademarks, logos, etc. on the Site are owned or licensed by us. You may not copy, reproduce, 
                  distribute, modify, create derivative works, or publicly display the content without prior written permission.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">4.3 User-Submitted Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you upload or post content (reviews, comments), you grant us a worldwide, perpetual, irrevocable, royalty-free, 
                  sub-licensable license to use, reproduce, modify, distribute, and display such content. You represent that you own 
                  or have rights to submit such content and that it does not infringe third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">5. Disclaimers & Limitation of Liability</h2>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">5.1 Warranty Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  To the fullest extent permitted by law, the Site, services, and content are provided "as is" and "as available", 
                  without warranty of any kind (express or implied). We disclaim warranties of merchantability, fitness for a particular 
                  purpose, non-infringement, and any warranties arising from course of dealing or usage.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">5.2 Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall we (or our directors, employees, agents) be liable for any indirect, special, incidental, 
                  consequential, exemplary, or punitive damages, including loss of profits, data, or goodwill, arising out of or 
                  in connection with your use (or inability to use) the Site or services, even if advised of the possibility of such damages. 
                  Our total liability for all claims under these Terms will not exceed the amount you paid for the service that caused 
                  the liability (or, if no payment was made, one hundred rupees).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">6. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to defend, indemnify and hold harmless MegaSpark, its affiliates, officers, agents, and employees from 
                  any claims, demands, losses, liabilities, damages, costs or expenses (including attorneys' fees) arising from or 
                  related to (a) your breach of these Terms; (b) your violation of any law or third-party rights; (c) your use of 
                  the Site or services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">7. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your account, access to the Site, or provision of services at any time without notice 
                  if you breach these Terms or for any other reason in our discretion. After termination, your rights under these Terms 
                  cease, but obligations (e.g. indemnification, liability limitations) which should survive will continue.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">8. Governing Law & Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws of India. Any dispute, claim, or controversy arising out of or relating to 
                  these Terms or the Site shall be resolved by the competent courts in the state of Gujarat, India.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">9. Amendments & Updates</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may revise or update these Terms at any time. The updated version will be effective from the "Last updated" date 
                  shown above. Your continued use of the Site after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  If you have any questions or concerns about these Terms, or wish to contact us regarding your rights or issues, 
                  please get in touch:
                </p>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>MegaSpark / ScubenTech Labs</strong></p>
                  <p><strong>Email:</strong> digital.cfe.ppsavani@gmail.com</p>
                  <p><strong>Phone:</strong> 9978651002 / 3 / 4 / 5</p>
                  <p><strong>Address:</strong> P.P. Savani School Campus, Surat, Gujarat, India</p>
                </div>
              </section>

              <section className="bg-accent/5 border border-accent/20 rounded-lg p-4 mt-6">
                <p className="text-sm text-foreground font-semibold mb-2">
                  By clicking "I Accept" or "Register Now" during the registration process, you acknowledge that you have 
                  read, understood, and agree to be bound by these Terms and Conditions.
                </p>
                <p className="text-xs text-muted-foreground">
                  Last Updated: January 2025
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
