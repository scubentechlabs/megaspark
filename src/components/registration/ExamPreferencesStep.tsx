import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface ExamPreferencesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const staticExamDates = [
  { value: "2026-03-15", label: "15 March 2026 - Sunday" },
  { value: "2026-03-22", label: "22 March 2026 - Sunday" },
];

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  // Auto-set morning slot since it's the only option
  if (!formData.timeSlot) {
    updateFormData({ timeSlot: "morning" });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="examDate">Preferred Exam Date *</Label>
        <Select value={formData.examDate} onValueChange={(value) => updateFormData({ examDate: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select exam date" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {staticExamDates.map((date) => (
              <SelectItem key={date.value} value={date.value}>
                {date.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-primary/5 border-primary/20 p-3">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Time Slot:</strong> Morning Slot — 8:00 AM to 12:00 PM (Reporting: 8:00 AM)
        </p>
      </Card>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Important:</strong> Please select your preferred exam date and arrive at the exam center by 8:00 AM. Late arrivals will not be permitted.
        </p>
      </Card>
    </div>
  );
};
