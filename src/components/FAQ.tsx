import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who can apply for the Mega Spark Exam?",
    answer: "Students from Class 5 to Class 12 studying in any recognized school can apply. The exam is open to all students who wish to compete for scholarships and showcase their academic excellence across multiple subjects."
  },
  {
    question: "What is the syllabus for the exam?",
    answer: "The syllabus is based on the respective class curriculum covering Mathematics, Science, English, and General Knowledge. Detailed syllabus for each class can be downloaded from our study material section. The exam focuses on conceptual understanding and application skills."
  },
  {
    question: "Is the ₹50 registration fee refundable?",
    answer: "No, the ₹50 registration fee is non-refundable as it covers administrative costs, exam materials, and logistics. However, this nominal fee ensures your seat is confirmed for the exam and you receive all study materials and updates."
  },
  {
    question: "How will scholarships be distributed?",
    answer: "Scholarships will be awarded based on exam performance and merit. Top performers in each category will receive scholarships ranging from ₹10,000 to ₹1,00,000. Results will be announced within 30 days of the exam, and scholarships will be directly credited to the winners' accounts or applied to their school fees."
  },
  {
    question: "What is the exam format and duration?",
    answer: "The exam consists of multiple-choice questions (MCQs) and will be conducted in offline mode at designated centers. Duration varies by class: Classes 5-7 (90 minutes), Classes 8-10 (120 minutes), and Classes 11-12 (150 minutes)."
  },
  {
    question: "Can I change my exam center after registration?",
    answer: "Yes, you can request an exam center change up to 7 days before the exam date by contacting our support team. Changes are subject to seat availability at the requested center."
  },
  {
    question: "Will I receive a hall ticket?",
    answer: "Yes, your hall ticket will be available for download after successful payment confirmation. You can also generate it from the registration success page by entering your registered mobile number. Please bring a printed copy of your hall ticket on exam day."
  },
  {
    question: "What should I bring on the exam day?",
    answer: "You must bring your hall ticket, a valid student ID card or school ID, two blue/black pens, a pencil, eraser, and a geometry box (if required for your class). Electronic devices including calculators and mobile phones are strictly prohibited."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about the Mega Spark Exam
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
              <a href="mailto:digital.cfe.ppsavani@gmail.com" className="text-primary hover:underline font-medium">
                digital.cfe.ppsavani@gmail.com
              </a>
              {" "}or call{" "}
              <a href="tel:+919978651005" className="text-primary hover:underline font-medium">
                9978651005
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
