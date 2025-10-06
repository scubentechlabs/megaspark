import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

interface ExamPreferencesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const examDates = [
  { value: "2025-11-30", label: "30th November 2025 - Sunday" },
  { value: "2025-12-07", label: "7th December 2025 - Sunday" },
  { value: "2025-12-14", label: "14th December 2025 - Sunday" },
  { value: "2025-12-28", label: "28th December 2025 - Sunday" }
];

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="space-y-3">
        <Label>Medium of Instruction *</Label>
        <RadioGroup
          value={formData.medium}
          onValueChange={(value) => updateFormData({ medium: value })}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="relative cursor-pointer hover:shadow-card transition-all">
            <label className="flex items-center space-x-3 p-4 cursor-pointer">
              <RadioGroupItem value="gujarati" id="gujarati" />
              <div className="flex-1">
                <div className="font-semibold text-primary">Gujarati Medium</div>
                <div className="text-xs text-muted-foreground">ગુજરાતી માધ્યમ</div>
              </div>
            </label>
          </Card>

          <Card className="relative cursor-pointer hover:shadow-card transition-all">
            <label className="flex items-center space-x-3 p-4 cursor-pointer">
              <RadioGroupItem value="english" id="english" />
              <div className="flex-1">
                <div className="font-semibold text-accent">English Medium</div>
                <div className="text-xs text-muted-foreground">આંગ્લ માધ્યમ</div>
              </div>
            </label>
          </Card>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Preferred Exam Date *</Label>
        <RadioGroup
          value={formData.examDate}
          onValueChange={(value) => updateFormData({ examDate: value })}
          className="space-y-3"
        >
          {examDates.map((date) => (
            <Card
              key={date.value}
              className="relative cursor-pointer hover:shadow-card transition-all"
            >
              <label className="flex items-center space-x-3 p-4 cursor-pointer">
                <RadioGroupItem value={date.value} id={date.value} />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{date.label}</div>
                  <div className="text-xs text-muted-foreground">Time: 10:00 AM - 12:00 PM</div>
                </div>
              </label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Note:</strong> Please arrive at the exam center by 8:00 AM. 
          Reporting time is strictly 8:00 AM onwards. Exam starts at 10:00 AM sharp.
        </p>
      </Card>
    </div>
  );
};
