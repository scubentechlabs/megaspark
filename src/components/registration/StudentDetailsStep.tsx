import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const StudentDetailsStep = ({ formData, updateFormData }: StudentDetailsStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="studentFirstName">First Name *</Label>
          <Input
            id="studentFirstName"
            value={formData.studentFirstName || ""}
            onChange={(e) => updateFormData({ studentFirstName: e.target.value })}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentLastName">Last Name *</Label>
          <Input
            id="studentLastName"
            value={formData.studentLastName || ""}
            onChange={(e) => updateFormData({ studentLastName: e.target.value })}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ""}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => updateFormData({ gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentEmail">Email Address *</Label>
        <Input
          id="studentEmail"
          type="email"
          value={formData.studentEmail || ""}
          onChange={(e) => updateFormData({ studentEmail: e.target.value })}
          placeholder="student@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentPhone">Mobile Number *</Label>
        <Input
          id="studentPhone"
          type="tel"
          value={formData.studentPhone || ""}
          onChange={(e) => updateFormData({ studentPhone: e.target.value })}
          placeholder="+91 98765 43210"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address || ""}
          onChange={(e) => updateFormData({ address: e.target.value })}
          placeholder="Complete address"
          required
        />
      </div>
    </div>
  );
};
