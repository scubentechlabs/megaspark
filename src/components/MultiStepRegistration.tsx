import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, User, Users, CreditCard } from "lucide-react";
import { StudentDetailsStep } from "./registration/StudentDetailsStep";
import { ParentSchoolStep } from "./registration/ParentSchoolStep";
import { PaymentStep } from "./registration/PaymentStep";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MultiStepRegistrationProps {
  onClose: () => void;
}

export const MultiStepRegistration = ({ onClose }: MultiStepRegistrationProps) => {
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
      if (!formData.state || formData.state.trim() === "") {
        toast.error("Please select state");
        return false;
      }
      if (!formData.district || formData.district.trim() === "") {
        toast.error("Please select district");
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
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      // Generate registration number
      const registrationNumber = `SPARK${Date.now()}`;
      
      // Save to database with all fields
      const { data, error } = await supabase
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
          medium: formData.schoolMedium, // Using school medium as exam medium
          exam_center: 'To be announced',
          registration_number: registrationNumber
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Registration saved:", data);
      toast.success("Registration Successful!", {
        description: "Your exam registration has been completed."
      });
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate("/registration-success");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration Failed", {
        description: error.message || "Please try again."
      });
    }
  };

  return (
    <Card className="w-full border-0 shadow-none rounded-lg">
        <CardHeader className="relative pb-8 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 hover:bg-destructive/10"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <CardTitle className="text-3xl font-bold text-center mb-2 text-primary">
            Mega Spark Exam Registration
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {steps[currentStep - 1].description}
          </CardDescription>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center flex-1 ${
                    step.number < steps.length ? 'relative' : ''
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                      step.number < currentStep
                        ? 'bg-primary text-white'
                        : step.number === currentStep
                        ? 'bg-accent text-white ring-4 ring-accent/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <div className={`mt-2 text-xs font-medium text-center hidden md:block ${
                    step.number === currentStep ? 'text-accent' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-8">
          <div className="min-h-[350px]">
            {currentStep === 1 && (
              <StudentDetailsStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <ParentSchoolStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <PaymentStep onPaymentComplete={handlePaymentComplete} formData={formData} />
            )}
          </div>

          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="min-w-[120px]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button 
                onClick={handleNext} 
                className="min-w-[120px] bg-accent hover:bg-accent/90"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
  );
};
