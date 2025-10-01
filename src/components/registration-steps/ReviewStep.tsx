import { FormData } from "../RegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

interface ReviewStepProps {
  formData: FormData;
}

export const ReviewStep = ({ formData }: ReviewStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Review Your Application</h3>
        <p className="text-muted-foreground">
          Please review all information carefully before submitting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{formData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{formData.dateOfBirth || "Not provided"}</p>
            </div>
          </div>
          {formData.address && (
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{formData.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Academic Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">School</p>
              <p className="font-medium">{formData.currentSchool}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade Level</p>
              <p className="font-medium">{formData.grade}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GPA</p>
              <p className="font-medium">{formData.gpa}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Intended Major</p>
              <p className="font-medium">{formData.intendedMajor || "Not specified"}</p>
            </div>
          </div>
          {formData.achievements && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Achievements</p>
              <p className="text-sm leading-relaxed">{formData.achievements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{formData.essay}</p>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Word count: {formData.essay.trim().split(/\s+/).filter(w => w.length > 0).length} words
          </p>
        </CardContent>
      </Card>

      <Card className="bg-accent/10 border-accent/20">
        <CardContent className="p-6">
          <p className="text-sm text-foreground leading-relaxed">
            By submitting this application, I certify that all information provided is true and accurate 
            to the best of my knowledge. I understand that providing false information may result in 
            disqualification from the scholarship program.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
