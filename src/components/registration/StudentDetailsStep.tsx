import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const StudentDetailsStep = ({ formData, updateFormData }: StudentDetailsStepProps) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    // Keep only digits and cap at 10
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateFormData({ [field]: value });
  };

  const formatPhoneDisplay = (value: string) => {
    if (!value) return '+91 ';
    return `+91 ${value}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student's Name *</Label>
          <Input
            id="studentName"
            value={formData.studentName || ""}
            onChange={(e) => updateFormData({ studentName: e.target.value })}
            placeholder="Enter student's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentName">Parent's Name *</Label>
          <Input
            id="parentName"
            value={formData.parentName || ""}
            onChange={(e) => updateFormData({ parentName: e.target.value })}
            placeholder="Enter parent's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Enter Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="text"
            value={formData.phoneNumber || ""}
            onChange={(e) => handlePhoneChange(e, 'phoneNumber')}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            required
          />
          {formData.phoneNumber && formData.phoneNumber.length !== 10 && (
            <p className="text-xs text-destructive">Mobile number must be 10 digits</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">Your WhatsApp Number *</Label>
          <Input
            id="whatsappNumber"
            type="text"
            value={formData.whatsappNumber || ""}
            onChange={(e) => handlePhoneChange(e, 'whatsappNumber')}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            required
          />
          {formData.whatsappNumber && formData.whatsappNumber.length !== 10 && (
            <p className="text-xs text-destructive">WhatsApp number must be 10 digits</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={formData.district || ""}
            onChange={(e) => updateFormData({ district: e.target.value })}
            placeholder="Enter district"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cityVillage">City/Village Name *</Label>
          <Input
            id="cityVillage"
            value={formData.cityVillage || ""}
            onChange={(e) => updateFormData({ cityVillage: e.target.value })}
            placeholder="Enter city or village name"
            required
          />
        </div>
      </div>
    </div>
  );
};
