import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParentSchoolStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const ParentSchoolStep = ({ formData, updateFormData }: ParentSchoolStepProps) => {
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.]/g, ''); // Allow only digits and decimal point
    
    // Limit to 2 decimal places
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Limit to 100
    const numValue = parseFloat(value);
    if (numValue > 100) {
      value = '100';
    }
    
    updateFormData({ previousYearPercentage: value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="standard">Current Standard *</Label>
        <Select value={formData.standard} onValueChange={(value) => updateFormData({ standard: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select your standard" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
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
          <Select 
            value={formData.schoolMedium} 
            onValueChange={(value) => updateFormData({ schoolMedium: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medium" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
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
            onChange={handlePercentageChange}
            placeholder="Enter percentage (e.g., 85 or 85.5)"
            maxLength={6}
            required
          />
          {formData.previousYearPercentage && (parseFloat(formData.previousYearPercentage) < 0 || parseFloat(formData.previousYearPercentage) > 100) && (
            <p className="text-xs text-destructive">Percentage must be between 0 and 100</p>
          )}
        </div>
      </div>
    </div>
  );
};
