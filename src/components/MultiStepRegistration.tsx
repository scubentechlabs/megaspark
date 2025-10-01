import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft, User, Users, Calendar, CreditCard } from "lucide-react";
import { StudentDetailsStep } from "./registration/StudentDetailsStep";
import { ParentSchoolStep } from "./registration/ParentSchoolStep";
import { ExamPreferencesStep } from "./registration/ExamPreferencesStep";
import { PaymentStep } from "./registration/PaymentStep";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MultiStepRegistrationProps {
  onClose: () => void;
}

export const MultiStepRegistration = ({ onClose }: MultiStepRegistrationProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Student Details", icon: User, description: "Basic information" },
    { number: 2, title: "Parent & School", icon: Users, description: "Guardian and school info" },
    { number: 3, title: "Exam Preferences", icon: Calendar, description: "Choose your options" },
    { number: 4, title: "Payment", icon: CreditCard, description: "Complete registration" }
  ];

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.studentFirstName || !formData.studentLastName || !formData.studentEmail || !formData.studentPhone) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.parentFirstName || !formData.parentEmail || !formData.schoolName) {
        toast.error("Please fill in all required fields");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.standard || !formData.medium || !formData.examDate) {
        toast.error("Please complete all selections");
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

  const handlePaymentComplete = () => {
    console.log("Registration completed:", formData);
    toast.success("Payment Successful!", {
      description: "Redirecting to confirmation page..."
    });
    
    // Redirect to success page after 2 seconds
    setTimeout(() => {
      navigate("/registration-success");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 shadow-2xl">
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
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <StudentDetailsStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <ParentSchoolStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <ExamPreferencesStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <PaymentStep onPaymentComplete={handlePaymentComplete} />
            )}
          </div>

          {currentStep < 4 && (
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
    </div>
  );
};
