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
              Terms and Conditions
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Mega Spark Exam 2025 - Registration Terms
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="prose prose-sm max-w-none">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to the Mega Spark Exam 2025 registration portal operated by P.P. SAVANI Centre for Excellence. 
                  By registering for the exam and using this website, you agree to comply with and be bound by the following 
                  terms and conditions. Please read them carefully before proceeding with your registration.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">2. Eligibility Criteria</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Students currently studying in standards 5th to 10th are eligible to register.</li>
                  <li>Students must be enrolled in a recognized school at the time of registration.</li>
                  <li>The registration must be completed by a parent or legal guardian for students under 18 years of age.</li>
                  <li>All information provided during registration must be accurate and truthful.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">3. Registration Process</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Registration requires completion of all mandatory fields in the online form.</li>
                  <li>A non-refundable registration fee of ₹50 must be paid to confirm your registration.</li>
                  <li>Once payment is completed, a registration number and hall ticket will be generated.</li>
                  <li>Registration closes on the specified deadline date and will not be accepted thereafter.</li>
                  <li>Multiple registrations by the same student are not permitted.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">4. Payment Terms</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>The registration fee is ₹50 per student, payable online through UPI or other accepted payment methods.</li>
                  <li>Payment must be completed to confirm registration. Incomplete payments will result in registration cancellation.</li>
                  <li>All payments are processed securely through our payment gateway partners.</li>
                  <li>Payment receipts will be sent to the registered email address and WhatsApp number.</li>
                  <li>In case of payment disputes, please contact our support team within 7 days of payment.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">5. Exam Conduct</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Students must arrive at the exam center 30 minutes before the scheduled exam time.</li>
                  <li>Entry to the exam hall will require a printed or digital copy of the hall ticket.</li>
                  <li>Students must carry a valid school ID card or any government-issued ID for verification.</li>
                  <li>Mobile phones, calculators, and electronic devices are strictly prohibited in the exam hall.</li>
                  <li>Any form of malpractice or misconduct will result in immediate disqualification.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">6. Cancellation & Changes</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>P.P. SAVANI Centre for Excellence reserves the right to change exam dates, venues, or timings due to unforeseen circumstances.</li>
                  <li>Registered candidates will be notified of any changes via email, SMS, and WhatsApp.</li>
                  <li>Students cannot change their registered exam date after payment confirmation.</li>
                  <li>In case of exam cancellation by the organizers, full refunds will be processed within 14 working days.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">7. Results & Scholarships</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Exam results will be announced on the official website and communicated to registered candidates.</li>
                  <li>Scholarship awards are based solely on exam performance and eligibility criteria.</li>
                  <li>The decision of the scholarship committee is final and binding.</li>
                  <li>Scholarship recipients must accept the award within the specified deadline.</li>
                  <li>Scholarship terms and conditions will be provided separately to selected candidates.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">8. Data Privacy & Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect and process personal information in accordance with our Privacy Policy. By registering, 
                  you consent to the collection, storage, and use of your data for exam administration, communication, 
                  and scholarship processing purposes. We do not share your personal information with third parties 
                  except as required for exam operations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  P.P. SAVANI Centre for Excellence shall not be liable for any direct, indirect, incidental, or 
                  consequential damages arising from the use of this website or participation in the exam. This includes 
                  but is not limited to technical issues, payment failures, exam disruptions, or any other circumstances 
                  beyond our reasonable control.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">10. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on this website, including text, graphics, logos, images, and exam materials, is the 
                  property of P.P. SAVANI Centre for Excellence and is protected by copyright laws. Unauthorized use, 
                  reproduction, or distribution of any content is strictly prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">11. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms and conditions at any time. Changes will be effective 
                  immediately upon posting on this website. Continued use of the website and participation in the exam 
                  after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">12. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms and conditions are governed by the laws of India. Any disputes arising from these terms 
                  or your use of this website shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none space-y-1 text-muted-foreground">
                  <li><strong>Email:</strong> digital.cfe.ppsavani@gmail.com</li>
                  <li><strong>Phone:</strong> 9978651002 / 3 / 4 / 5</li>
                  <li><strong>Address:</strong> P.P. Savani School Campus, Surat, Gujarat, India</li>
                </ul>
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
