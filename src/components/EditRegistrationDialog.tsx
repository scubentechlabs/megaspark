import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, User, Users, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatRegistrationNumber } from "@/lib/formatters";

interface Registration {
  id: string;
  mobile_number: string;
  student_name: string;
  email: string;
  standard: string;
  medium: string;
  exam_center: string;
  exam_date: string;
  registration_number: string;
  hall_ticket_url: string | null;
  created_at: string;
  room_no: string | null;
  floor: string | null;
  building_name: string | null;
  exam_pattern: string | null;
  time_slot: string | null;
  whatsapp_number: string | null;
  state: string | null;
  district: string | null;
  school_name: string | null;
  school_address: string | null;
  school_medium: string | null;
  previous_year_percentage: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_name: string | null;
}

interface EditRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: Registration | null;
  onUpdate: () => void;
}

const stateDistrictsData: Record<string, string[]> = {
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
};

export const EditRegistrationDialog = ({ open, onOpenChange, registration, onUpdate }: EditRegistrationDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Student Details", icon: User, description: "Basic information" },
    { number: 2, title: "School Info", icon: Users, description: "School and academic details" },
    { number: 3, title: "Review", icon: CheckCircle, description: "Confirm changes" }
  ];

  // Initialize form data when dialog opens
  useEffect(() => {
    if (registration && open) {
      setFormData({
        studentName: registration.student_name,
        parentName: registration.parent_name,
        phoneNumber: registration.mobile_number,
        whatsappNumber: registration.whatsapp_number || "",
        state: registration.state || "",
        district: registration.district || "",
        standard: registration.standard,
        schoolName: registration.school_name || "",
        schoolMedium: registration.school_medium || "",
        previousYearPercentage: registration.previous_year_percentage || "",
        email: registration.email || "",
        gender: registration.gender || "",
        dateOfBirth: registration.date_of_birth || "",
        address: registration.address || "",
        parentFirstName: registration.parent_first_name || "",
        parentLastName: registration.parent_last_name || "",
        parentEmail: registration.parent_email || "",
        parentPhone: registration.parent_phone || "",
        // Read-only fields
        registrationNumber: registration.registration_number,
        examDate: registration.exam_date,
        timeSlot: registration.time_slot,
        examCenter: registration.exam_center,
      });
      setCurrentStep(1);
    }
  }, [registration, open]);

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0 && !value.startsWith('91')) {
      value = '91' + value;
    }
    value = value.slice(0, 12);
    updateFormData({ whatsappNumber: value });
  };

  const handleStateChange = (value: string) => {
    updateFormData({ state: value, district: "" });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.studentName || formData.studentName.trim() === "") {
        toast.error("Please enter student's name");
        return false;
      }
      if (!formData.parentName || formData.parentName.trim() === "") {
        toast.error("Please enter parent's name");
        return false;
      }
      if (formData.whatsappNumber && (formData.whatsappNumber.length !== 12 || !formData.whatsappNumber.startsWith('91'))) {
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
      if (!formData.standard) {
        toast.error("Please select current standard");
        return false;
      }
      if (!formData.schoolName || formData.schoolName.trim() === "") {
        toast.error("Please enter school name");
        return false;
      }
      if (!formData.schoolMedium) {
        toast.error("Please select school medium");
        return false;
      }
      if (!formData.previousYearPercentage || formData.previousYearPercentage.trim() === "") {
        toast.error("Please enter previous year percentage");
        return false;
      }
      const percentage = parseFloat(formData.previousYearPercentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        toast.error("Percentage must be between 0 and 100");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirmUpdate = () => {
    if (!validateStep()) return;
    setConfirmDialogOpen(true);
  };

  const handleUpdateRegistration = async () => {
    if (!registration) return;

    setConfirmDialogOpen(false);
    setIsUpdating(true);

    try {
      toast.info("Updating...", {
        description: "Saving changes to database",
      });

      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          student_name: formData.studentName,
          email: formData.email || null,
          standard: formData.standard,
          exam_center: formData.examCenter,
          whatsapp_number: formData.whatsappNumber || null,
          state: formData.state,
          district: formData.district,
          school_name: formData.schoolName,
          school_address: formData.address || null,
          school_medium: formData.schoolMedium,
          previous_year_percentage: formData.previousYearPercentage,
          date_of_birth: formData.dateOfBirth || null, // Convert empty string to null
          gender: formData.gender || null,
          address: formData.address || null,
          parent_first_name: formData.parentFirstName || null,
          parent_last_name: formData.parentLastName || null,
          parent_email: formData.parentEmail || null,
          parent_phone: formData.parentPhone || null,
          parent_name: formData.parentName,
          medium: formData.schoolMedium, // Sync medium with school_medium
        })
        .eq("id", registration.id);

      if (updateError) throw updateError;

      toast.info("Generating Hall Ticket...", {
        description: "Creating new hall ticket and sending via WhatsApp",
      });

      const { data: hallTicketData, error: hallTicketError } = await supabase.functions.invoke('generate-hall-ticket', {
        body: { registrationId: registration.id }
      });

      if (hallTicketError) {
        console.error("Hall ticket error:", hallTicketError);
        throw new Error("Failed to generate hall ticket: " + hallTicketError.message);
      }

      if (!hallTicketData?.success) {
        throw new Error(hallTicketData?.error || "Failed to generate hall ticket");
      }

      onOpenChange(false);
      onUpdate();

      toast.success("✅ Update Successful!", {
        description: "Details updated, new hall ticket generated and sent via WhatsApp",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error updating registration:", error);

      let errorMessage = "Failed to update registration";
      if (error.message?.includes("hall ticket")) {
        errorMessage = "Details updated but failed to generate/send hall ticket. Please try downloading manually.";
      } else {
        errorMessage = error.message || "Failed to update registration";
      }

      toast.error("Error", {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const availableDistricts = formData.state ? stateDistrictsData[formData.state] || [] : [];

  const formatTimeSlot = (slot: string | null) => {
    if (!slot) return 'TBA';
    if (slot.toLowerCase() === 'morning') return 'Morning Slot';
    if (slot.toLowerCase() === 'afternoon') return 'Afternoon Slot';
    return slot;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update student information. Registration number, exam date, time slot, and mobile number cannot be changed.
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    currentStep >= step.number ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.number
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="py-6">
            {/* Step 1: Student Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Read-only fields */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Registration Number</Label>
                    <Input value={formatRegistrationNumber(formData.registrationNumber)} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Mobile Number</Label>
                    <Input value={formData.phoneNumber} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Exam Date</Label>
                    <Input value={formData.examDate ? new Date(formData.examDate).toLocaleDateString('en-GB') : 'TBA'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Time Slot</Label>
                    <Input value={formatTimeSlot(formData.timeSlot)} disabled />
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student's Full Name *</Label>
                    <Input
                      id="studentName"
                      value={formData.studentName || ""}
                      onChange={(e) => updateFormData({ studentName: e.target.value })}
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent's Full Name *</Label>
                    <Input
                      id="parentName"
                      value={formData.parentName || ""}
                      onChange={(e) => updateFormData({ parentName: e.target.value })}
                      placeholder="Enter parent's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                    <Input
                      id="whatsappNumber"
                      type="text"
                      value={formData.whatsappNumber || ""}
                      onChange={handleWhatsAppChange}
                      placeholder="91XXXXXXXXXX"
                      maxLength={12}
                    />
                    {formData.whatsappNumber && formData.whatsappNumber.length !== 12 && (
                      <p className="text-xs text-destructive">WhatsApp number must be 12 digits (91 + 10-digit number)</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state || ""} onValueChange={handleStateChange}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(stateDistrictsData).sort().map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select
                      value={formData.district || ""}
                      onValueChange={(value) => updateFormData({ district: value })}
                      disabled={!formData.state}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder={formData.state ? "Select district" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: School Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="standard">Current Standard *</Label>
                  <Select value={formData.standard} onValueChange={(value) => updateFormData({ standard: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Standard 5</SelectItem>
                      <SelectItem value="6">Standard 6</SelectItem>
                      <SelectItem value="7">Standard 7</SelectItem>
                      <SelectItem value="8">Standard 8</SelectItem>
                      <SelectItem value="9">Standard 9</SelectItem>
                      <SelectItem value="10">Standard 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Current School Name *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName || ""}
                      onChange={(e) => updateFormData({ schoolName: e.target.value })}
                      placeholder="Enter current school name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolMedium">School Medium / School Language *</Label>
                    <Select value={formData.schoolMedium} onValueChange={(value) => updateFormData({ schoolMedium: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="previousYearPercentage">Your Previous Year Percentage *</Label>
                    <Input
                      id="previousYearPercentage"
                      type="text"
                      value={formData.previousYearPercentage || ""}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d.]/g, '');
                        const parts = value.split('.');
                        if (parts.length > 2) {
                          value = parts[0] + '.' + parts.slice(1).join('');
                        }
                        if (parts[1] && parts[1].length > 2) {
                          value = parts[0] + '.' + parts[1].substring(0, 2);
                        }
                        const numValue = parseFloat(value);
                        if (numValue > 100) {
                          value = '100';
                        }
                        updateFormData({ previousYearPercentage: value });
                      }}
                      placeholder="Enter percentage (e.g., 85 or 85.5)"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-lg mb-4">Review Your Changes</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Student Name:</span>
                      <span className="col-span-2 font-medium">{formData.studentName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Parent Name:</span>
                      <span className="col-span-2 font-medium">{formData.parentName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">WhatsApp:</span>
                      <span className="col-span-2 font-medium">{formData.whatsappNumber}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="col-span-2 font-medium">{formData.district}, {formData.state}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Standard:</span>
                      <span className="col-span-2 font-medium">Standard {formData.standard}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">School:</span>
                      <span className="col-span-2 font-medium">{formData.schoolName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">School Medium:</span>
                      <span className="col-span-2 font-medium">{formData.schoolMedium}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Previous Year %:</span>
                      <span className="col-span-2 font-medium">{formData.previousYearPercentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> After confirming, a new hall ticket will be generated with your updated details and sent to your WhatsApp number.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
              disabled={isUpdating}
            >
              {currentStep === 1 ? (
                "Cancel"
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </>
              )}
            </Button>
            <Button
              onClick={currentStep === totalSteps ? handleConfirmUpdate : handleNext}
              disabled={isUpdating}
            >
              {currentStep === totalSteps ? (
                isUpdating ? "Updating..." : "Update & Generate Hall Ticket"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Details Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the student details? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update all the modified information</li>
                <li>Generate a new hall ticket with updated details</li>
                <li>Send the new hall ticket via WhatsApp (if available)</li>
              </ul>
              <p className="mt-3 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRegistration} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Yes, Update Details"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
