import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "../RegistrationForm";

interface AcademicInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const AcademicInfoStep = ({ formData, updateFormData }: AcademicInfoStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="currentSchool">Current School/Institution *</Label>
        <Input
          id="currentSchool"
          value={formData.currentSchool}
          onChange={(e) => updateFormData({ currentSchool: e.target.value })}
          placeholder="Enter your school name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="grade">Current Grade Level *</Label>
          <Select value={formData.grade} onValueChange={(value) => updateFormData({ grade: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9th">9th Grade</SelectItem>
              <SelectItem value="10th">10th Grade</SelectItem>
              <SelectItem value="11th">11th Grade</SelectItem>
              <SelectItem value="12th">12th Grade</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gpa">GPA (Grade Point Average) *</Label>
          <Input
            id="gpa"
            value={formData.gpa}
            onChange={(e) => updateFormData({ gpa: e.target.value })}
            placeholder="3.8"
            type="number"
            step="0.01"
            min="0"
            max="4"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intendedMajor">Intended Major/Field of Study</Label>
        <Input
          id="intendedMajor"
          value={formData.intendedMajor}
          onChange={(e) => updateFormData({ intendedMajor: e.target.value })}
          placeholder="e.g., Computer Science, Medicine, Engineering"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements">Academic Achievements & Extracurriculars</Label>
        <Textarea
          id="achievements"
          value={formData.achievements}
          onChange={(e) => updateFormData({ achievements: e.target.value })}
          placeholder="List your awards, honors, leadership positions, volunteer work, sports, clubs, etc."
          className="min-h-[150px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Include any academic awards, leadership roles, community service, or notable achievements
        </p>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        * Required fields
      </p>
    </div>
  );
};
