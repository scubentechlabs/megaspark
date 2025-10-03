import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const StudentDetailsStep = ({ formData, updateFormData }: StudentDetailsStepProps) => {
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
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">Your WhatsApp Number *</Label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={formData.whatsappNumber || ""}
            onChange={(e) => updateFormData({ whatsappNumber: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />
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
