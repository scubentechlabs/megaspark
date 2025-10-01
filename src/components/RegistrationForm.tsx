import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { PersonalInfoStep } from "./registration-steps/PersonalInfoStep";
import { AcademicInfoStep } from "./registration-steps/AcademicInfoStep";
import { EssayStep } from "./registration-steps/EssayStep";
import { ReviewStep } from "./registration-steps/ReviewStep";
import { toast } from "sonner";

interface RegistrationFormProps {
  onClose: () => void;
}

export interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  
  // Academic Info
  currentSchool: string;
  grade: string;
  gpa: string;
  intendedMajor: string;
  achievements: string;
  
  // Essay
  essay: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  currentSchool: "",
  grade: "",
  gpa: "",
  intendedMajor: "",
  achievements: "",
  essay: ""
};

export const RegistrationForm = ({ onClose }: RegistrationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Personal Information", description: "Tell us about yourself" },
    { number: 2, title: "Academic Background", description: "Your educational details" },
    { number: 3, title: "Personal Statement", description: "Share your story" },
    { number: 4, title: "Review & Submit", description: "Confirm your application" }
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    // Basic validation for each step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.currentSchool || !formData.grade || !formData.gpa) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 3) {
      if (formData.essay.length < 100) {
        toast.error("Please write at least 100 characters for your essay");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    toast.success("Application submitted successfully!", {
      description: "We'll review your application and get back to you soon."
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 shadow-2xl">
        <CardHeader className="relative pb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 hover:bg-destructive/10"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <CardTitle className="text-3xl font-bold text-center mb-2">
            Scholarship Application
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
          
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <PersonalInfoStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <AcademicInfoStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <EssayStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <ReviewStep formData={formData} />
            )}
          </div>

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

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="min-w-[120px]">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="min-w-[120px] bg-success hover:bg-success/90">
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
