import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is eligible to apply for this scholarship?",
    answer: "Students with a minimum GPA of 3.5, demonstrating financial need, and showing leadership potential are eligible. You must be a citizen or permanent resident and enrolled (or planning to enroll) in an accredited university."
  },
  {
    question: "What does the scholarship cover?",
    answer: "The scholarship provides full tuition coverage for your entire degree program, mentorship opportunities, career development support, and access to exclusive networking events and international exposure programs."
  },
  {
    question: "When is the application deadline?",
    answer: "Applications must be submitted by May 31, 2025. Late applications will not be considered. We recommend submitting your application at least one week early to avoid any technical issues."
  },
  {
    question: "How are recipients selected?",
    answer: "Selection is based on academic excellence, leadership potential, financial need, and the quality of your personal statement. Our review committee evaluates applications holistically, considering all aspects of your profile."
  },
  {
    question: "Can I apply if I already have another scholarship?",
    answer: "Yes, you can apply even if you have other scholarships, as long as they are not full scholarships from other organizations. However, you must disclose all other financial aid in your application."
  },
  {
    question: "Is the scholarship renewable?",
    answer: "Yes, the scholarship is renewable annually throughout your degree program, provided you maintain a minimum GPA of 3.3 and meet the program's academic and ethical standards."
  },
  {
    question: "What documents do I need to submit?",
    answer: "You'll need to submit your academic transcripts, two letters of recommendation, proof of financial need, and your personal statement. Additional documents may be requested during the interview phase."
  },
  {
    question: "When will I know if I've been selected?",
    answer: "The shortlist will be announced on June 15, 2025. Selected candidates will be invited for interviews in early July, and final results will be published on August 1, 2025."
  }
];

export const FAQ = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about the scholarship program
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="border rounded-lg px-6 bg-card hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-6 bg-secondary rounded-lg">
            <p className="text-foreground mb-2">
              <strong>Still have questions?</strong>
            </p>
            <p className="text-muted-foreground">
              Contact us at{" "}
              <a href="mailto:scholarships@example.com" className="text-primary hover:underline font-medium">
                scholarships@example.com
              </a>
              {" "}or call{" "}
              <a href="tel:+15551234567" className="text-primary hover:underline font-medium">
                +1 (555) 123-4567
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
