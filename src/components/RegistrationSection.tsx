import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, User, Users, CheckCircle, Calendar } from "lucide-react";
import { StudentDetailsStep } from "./registration/StudentDetailsStep";
import { ParentSchoolStep } from "./registration/ParentSchoolStep";
import { ExamPreferencesStep } from "./registration/ExamPreferencesStep";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RegistrationSection = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileError, setMobileError] = useState<string>("");
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Student Details", icon: User, description: "Basic information" },
    { number: 2, title: "School Info", icon: Users, description: "School and academic details" },
    { number: 3, title: "Exam Preferences", icon: Calendar, description: "Select exam slot and preferences" }
  ];

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
    // Clear mobile error when user changes the phone number
    if (updates.phoneNumber !== undefined) {
      setMobileError("");
    }
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
      // Validate phone confirmation checkbox
      if (!formData.confirmPhoneNumber) {
        toast.error("Please confirm your mobile number by checking the confirmation box");
        return false;
      }
      // Validate WhatsApp number - must be exactly 12 digits (91 + 10)
      if (!formData.whatsappNumber || formData.whatsappNumber.length !== 12 || !formData.whatsappNumber.startsWith('91')) {
        toast.error("WhatsApp number must be exactly 12 digits (91 + 10-digit number)");
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
    } else if (currentStep === 3) {
      if (!formData.standard) {
        toast.error("Please select current standard");
        return false;
      }
      if (!formData.medium) {
        toast.error("Please select medium of instruction");
        return false;
      }
      if (!formData.examDate) {
        toast.error("Please select an exam date");
        return false;
      }
      if (!formData.timeSlot) {
        toast.error("Please select a time slot");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    // Check for duplicate mobile number before moving to next step
    if (currentStep === 1 && formData.phoneNumber) {
      try {
        const { data: existingRegistrations, error: checkError } = await supabase
          .from('registrations')
          .select('id, mobile_number')
          .eq('mobile_number', formData.phoneNumber)
          .limit(1);

        if (checkError) {
          console.error('Error checking existing registration:', checkError);
          toast.error("Error checking mobile number");
          return;
        }

        if (existingRegistrations && existingRegistrations.length > 0) {
          setMobileError("This mobile number is already registered. Each mobile number can only be used once.");
          return;
        }
      } catch (error) {
        console.error('Error checking mobile number:', error);
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top of form
      document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Scroll to top of form
      document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    try {
      console.log('Starting registration save with data:', formData);

      // Check if mobile number already exists
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('registrations')
        .select('id, mobile_number')
        .eq('mobile_number', formData.phoneNumber)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing registration:', checkError);
        throw checkError;
      }

      if (existingRegistrations && existingRegistrations.length > 0) {
        setMobileError("This mobile number is already registered. Each mobile number can only be used once.");
        setIsSubmitting(false);
        setCurrentStep(1); // Go back to first step to show error
        return;
      }

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
          time_slot: formData.timeSlot,
          medium: formData.medium,
          exam_date: formData.examDate,
          preferred_exam_date: formData.examDate,
          exam_center: 'PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150',
          registration_number: ''
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Registration saved successfully');

      toast.success('Registration Successful!', { description: 'Redirecting to confirmation page...' });
      
      navigate('/registration-success');
    } catch (err: any) {
      console.error('Registration save error:', err);
      toast.error('Could not save registration', { description: err.message || 'Please contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="registration-section" className="py-12 bg-background relative overflow-hidden">
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
                <StudentDetailsStep formData={formData} updateFormData={updateFormData} mobileError={mobileError} />
              )}
              {currentStep === 2 && (
                <ParentSchoolStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <ExamPreferencesStep formData={formData} updateFormData={updateFormData} />
              )}
            </div>

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

              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="min-w-[140px] py-6 text-lg bg-accent hover:bg-accent/90"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="min-w-[180px] py-6 text-lg bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirm Registration
                    </>
                  )}
                </Button>
              )}
            </div>
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
              <div className="text-sm text-muted-foreground">Official PP Savani Cfe registration</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
