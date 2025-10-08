import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, User, Users, CreditCard } from "lucide-react";
import { StudentDetailsStep } from "./registration/StudentDetailsStep";
import { ParentSchoolStep } from "./registration/ParentSchoolStep";
import { PaymentStep } from "./registration/PaymentStep";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RegistrationSection = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Student Details", icon: User, description: "Basic information" },
    { number: 2, title: "School Info", icon: Users, description: "School and academic details" },
    { number: 3, title: "Payment", icon: CreditCard, description: "Complete registration" }
  ];

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      // Validate all required fields
      if (!formData.studentName || formData.studentName.trim() === "") {
        toast.error("Please enter student's name");
        return false;
      }
      if (!formData.parentName || formData.parentName.trim() === "") {
        toast.error("Please enter parent's name");
        return false;
      }
      // Validate phone number - must be exactly 10 digits
      if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return false;
      }
      // Validate WhatsApp number - must be exactly 10 digits
      if (!formData.whatsappNumber || formData.whatsappNumber.length !== 10) {
        toast.error("WhatsApp number must be exactly 10 digits");
        return false;
      }
      if (!formData.district || formData.district.trim() === "") {
        toast.error("Please enter district");
        return false;
      }
      if (!formData.cityVillage || formData.cityVillage.trim() === "") {
        toast.error("Please enter city/village name");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.schoolName || formData.schoolName.trim() === "") {
        toast.error("Please enter school name");
        return false;
      }
      if (!formData.schoolMedium) {
        toast.error("Please select school medium");
        return false;
      }
      if (!formData.standard) {
        toast.error("Please select current standard");
        return false;
      }
      // Validate percentage - must be between 0-100
      if (!formData.previousYearPercentage || formData.previousYearPercentage.trim() === "") {
        toast.error("Please enter previous year percentage");
        return false;
      }
      const percentage = parseFloat(formData.previousYearPercentage.replace('%', ''));
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        toast.error("Percentage must be between 0 and 100");
        return false;
      }
      if (!formData.preferredExamDate) {
        toast.error("Please select preferred exam date");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        // Scroll to top of form
        document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Scroll to top of form
      document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentComplete = async () => {
    try {
      const registrationNumber = `SPARK${Date.now()}`;

      const { error } = await supabase
        .from('registrations')
        .insert({
          student_name: formData.studentName,
          parent_name: formData.parentName,
          mobile_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber,
          state: formData.state,
          district: formData.district,
          school_name: formData.schoolName,
          school_medium: formData.schoolMedium,
          standard: formData.standard,
          previous_year_percentage: formData.previousYearPercentage,
          preferred_exam_date: formData.preferredExamDate,
          medium: (formData.schoolMedium || '').toString().toLowerCase() === 'english' ? 'English' : 'Gujarati',
          exam_center: 'To be announced',
          registration_number: registrationNumber,
        });

      if (error) throw error;

      toast.success('Registration Successful!', { description: 'Redirecting to confirmation...' });
      setTimeout(() => navigate('/registration-success'), 1500);
    } catch (err: any) {
      console.error('Registration save error:', err);
      toast.error('Could not save registration', { description: err.message || 'Please try again.' });
    }
  };

  return (
    <section id="registration-section" className="py-20 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <span className="text-accent text-sm font-semibold uppercase tracking-wide">Register Now</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-primary mb-4">
            Complete Your <span className="text-accent">Registration</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill in the details below to secure your spot in the Mega Spark Exam 2025
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/10">
          <CardHeader className="pb-8 border-b bg-gradient-to-br from-primary/5 to-accent/5">
            <CardTitle className="text-3xl font-bold text-center mb-2 text-primary">
              Registration Form
            </CardTitle>
            <CardDescription className="text-center text-lg">
              {steps[currentStep - 1].description}
            </CardDescription>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all mb-2 ${
                        step.number < currentStep
                          ? 'bg-primary text-white'
                          : step.number === currentStep
                          ? 'bg-accent text-white ring-4 ring-accent/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="h-6 w-6" />
                    </div>
                    <div className={`text-xs font-medium text-center ${
                      step.number === currentStep ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="min-h-[350px]">
              {currentStep === 1 && (
                <StudentDetailsStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <ParentSchoolStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <PaymentStep onPaymentComplete={handlePaymentComplete} />
              )}
            </div>

            {currentStep < 3 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="min-w-[140px] py-6 text-lg"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>

                <Button 
                  onClick={handleNext} 
                  className="min-w-[140px] py-6 text-lg bg-accent hover:bg-accent/90"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-primary mb-2">🔒</div>
              <div className="font-semibold text-foreground mb-1">Secure Payment</div>
              <div className="text-sm text-muted-foreground">Your data is protected with encryption</div>
            </Card>
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-accent mb-2">⚡</div>
              <div className="font-semibold text-foreground mb-1">Instant Confirmation</div>
              <div className="text-sm text-muted-foreground">Get admit card immediately after payment</div>
            </Card>
            <Card className="p-6 hover:shadow-card transition-all">
              <div className="text-3xl font-bold text-primary mb-2">💯</div>
              <div className="font-semibold text-foreground mb-1">100% Genuine</div>
              <div className="text-sm text-muted-foreground">Official P.P. Savani CFE registration</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
