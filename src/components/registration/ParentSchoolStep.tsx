import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParentSchoolStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const ParentSchoolStep = ({ formData, updateFormData }: ParentSchoolStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
        <Select 
          value={formData.schoolMedium} 
          onValueChange={(value) => updateFormData({ schoolMedium: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gujarati">Gujarati</SelectItem>
            <SelectItem value="english">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="standard">Current Standard *</Label>
        <Select 
          value={formData.standard} 
          onValueChange={(value) => updateFormData({ standard: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6th">6th Standard</SelectItem>
            <SelectItem value="7th">7th Standard</SelectItem>
            <SelectItem value="8th">8th Standard</SelectItem>
            <SelectItem value="9th">9th Standard</SelectItem>
            <SelectItem value="10th">10th Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousYearPercentage">Your Previous Year Percentage *</Label>
        <Input
          id="previousYearPercentage"
          value={formData.previousYearPercentage || ""}
          onChange={(e) => updateFormData({ previousYearPercentage: e.target.value })}
          placeholder="Enter percentage (e.g., 85%)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredExamDate">Preferred Exam Date *</Label>
        <Select 
          value={formData.preferredExamDate} 
          onValueChange={(value) => updateFormData({ preferredExamDate: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred exam date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-12-07">7th December 2025</SelectItem>
            <SelectItem value="2025-12-14">14th December 2025</SelectItem>
            <SelectItem value="2025-12-21">21st December 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
