import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ParentSchoolStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const ParentSchoolStep = ({ formData, updateFormData }: ParentSchoolStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-primary mb-2">Parent Details</h3>
        <p className="text-sm text-muted-foreground">Guardian/Parent information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="parentFirstName">Parent First Name *</Label>
          <Input
            id="parentFirstName"
            value={formData.parentFirstName || ""}
            onChange={(e) => updateFormData({ parentFirstName: e.target.value })}
            placeholder="Enter parent's first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentLastName">Parent Last Name *</Label>
          <Input
            id="parentLastName"
            value={formData.parentLastName || ""}
            onChange={(e) => updateFormData({ parentLastName: e.target.value })}
            placeholder="Enter parent's last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="parentEmail">Parent Email *</Label>
          <Input
            id="parentEmail"
            type="email"
            value={formData.parentEmail || ""}
            onChange={(e) => updateFormData({ parentEmail: e.target.value })}
            placeholder="parent@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentPhone">Parent Mobile *</Label>
          <Input
            id="parentPhone"
            type="tel"
            value={formData.parentPhone || ""}
            onChange={(e) => updateFormData({ parentPhone: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-xl font-bold text-primary mb-2">School Information</h3>
        <p className="text-sm text-muted-foreground mb-4">Current school details</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name *</Label>
            <Input
              id="schoolName"
              value={formData.schoolName || ""}
              onChange={(e) => updateFormData({ schoolName: e.target.value })}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="schoolCity">City *</Label>
              <Input
                id="schoolCity"
                value={formData.schoolCity || ""}
                onChange={(e) => updateFormData({ schoolCity: e.target.value })}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolBoard">Board *</Label>
              <Input
                id="schoolBoard"
                value={formData.schoolBoard || ""}
                onChange={(e) => updateFormData({ schoolBoard: e.target.value })}
                placeholder="GSEB/CBSE/ICSE"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
