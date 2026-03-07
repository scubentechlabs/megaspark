import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ExamPreferencesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const staticExamDates = [
  { value: "2026-03-15", label: "15 March 2026 - Sunday" },
  { value: "2026-03-22", label: "22 March 2026 - Sunday" },
];

const MAX_CENTER_CAPACITY = 2500;

const examCenters = [
  { value: "ABRAMA", label: "PP Savani CFE, Abrama – Surat" },
];

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  if (!formData.timeSlot) {
    updateFormData({ timeSlot: "morning" });
  }

  const { data: centerCounts } = useQuery({
    queryKey: ["centerCounts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const center of examCenters) {
        const { count, error } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("exam_center", center.value);
        if (!error) {
          counts[center.value] = count || 0;
        }
      }
      return counts;
    },
    staleTime: 30 * 1000,
  });

  const isCenterFull = (centerValue: string) => {
    if (!centerCounts) return false;
    return (centerCounts[centerValue] || 0) >= MAX_CENTER_CAPACITY;
  };

  // Clear selection if selected center became full
  if (formData.examCenter && isCenterFull(formData.examCenter)) {
    updateFormData({ examCenter: undefined });
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

      <div className="space-y-2">
        <Label htmlFor="examCenter">Preferred Exam Center *</Label>
        <Select value={formData.examCenter} onValueChange={(value) => updateFormData({ examCenter: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select exam center" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {examCenters.map((center) => {
              const full = isCenterFull(center.value);
              return (
                <SelectItem key={center.value} value={center.value} disabled={full}>
                  <span className="flex items-center gap-2">
                    {center.label}
                    {full && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Full</Badge>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-primary/5 border-primary/20 p-3">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Time Slot:</strong> Morning Slot — 9:00 AM to 10:00 AM (Reporting: 8:00 AM)
        </p>
      </Card>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Important:</strong> Each exam center has a maximum capacity of {MAX_CENTER_CAPACITY} students. Please select your preferred exam date and arrive at the exam center by 8:00 AM. Late arrivals will not be permitted.
        </p>
      </Card>
    </div>
  );
};
