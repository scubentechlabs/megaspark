import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExamPreferencesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface SlotSetting {
  slot_name: string;
  is_enabled: boolean;
  max_capacity: number;
  current_count: number;
  reporting_time: string;
}

const examDates = [
  { value: "2025-11-30", label: "30th November 2025 - Sunday" },
  { value: "2025-12-07", label: "7th December 2025 - Sunday" },
  { value: "2025-12-14", label: "14th December 2025 - Sunday" },
  { value: "2025-12-28", label: "28th December 2025 - Sunday" }
];

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  const [slots, setSlots] = useState<SlotSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlotSettings();
  }, []);

  const fetchSlotSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_settings')
        .select('*')
        .order('slot_name');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slot settings:', error);
      toast.error("Failed to load time slots");
    } finally {
      setLoading(false);
    }
  };

  const getSlotLabel = (slotName: string) => {
    return slotName.charAt(0).toUpperCase() + slotName.slice(1) + " Slot";
  };

  const getSlotAvailability = (slot: SlotSetting) => {
    const remaining = slot.max_capacity - slot.current_count;
    if (remaining <= 0) return "Full";
    if (remaining < 100) return `Only ${remaining} seats left`;
    return `${remaining} seats available`;
  };

  const isSlotAvailable = (slot: SlotSetting) => {
    return slot.is_enabled && slot.current_count < slot.max_capacity;
  };

  const getReportingTime = (slotName: string | null) => {
    if (!slotName) return 'TBA';
    const slotData = slots.find(s => s.slot_name === slotName);
    if (slotData) return slotData.reporting_time;
    if (slotName.toLowerCase() === 'morning') return '8:00 AM';
    if (slotName.toLowerCase() === 'afternoon') return '2:30 PM';
    return 'TBA';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="medium">Medium of Instruction *</Label>
        <Select value={formData.medium} onValueChange={(value) => updateFormData({ medium: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select medium" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="gujarati">
              <div className="flex flex-col">
                <span className="font-semibold">Gujarati Medium</span>
                <span className="text-xs text-muted-foreground">ગુજરાતી માધ્યમ</span>
              </div>
            </SelectItem>
            <SelectItem value="english">
              <div className="flex flex-col">
                <span className="font-semibold">English Medium</span>
                <span className="text-xs text-muted-foreground">અંગ્રેજી માધ્યમ</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="examDate">Preferred Exam Date *</Label>
        <Select value={formData.examDate} onValueChange={(value) => updateFormData({ examDate: value })}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select exam date" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {examDates.map((date) => (
              <SelectItem key={date.value} value={date.value}>
                {date.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeSlot">Preferred Time Slot *</Label>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading available slots...</p>
        ) : (
          <Select 
            value={formData.timeSlot} 
            onValueChange={(value) => updateFormData({ timeSlot: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {slots.map((slot) => {
                const available = isSlotAvailable(slot);
                return (
                  <SelectItem 
                    key={slot.slot_name} 
                    value={slot.slot_name}
                    disabled={!available}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{getSlotLabel(slot.slot_name)}</span>
                        <span className="text-xs text-muted-foreground">
                          Reporting: {slot.reporting_time}
                        </span>
                      </div>
                      <span className={`text-xs ml-4 ${available ? 'text-green-600' : 'text-red-600'}`}>
                        {getSlotAvailability(slot)}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
        {formData.timeSlot && (
          <Card className="bg-primary/5 border-primary/20 p-3 mt-2">
            <p className="text-sm text-foreground">
              <strong className="text-primary">Selected:</strong> {getSlotLabel(formData.timeSlot)} - Reporting Time: {getReportingTime(formData.timeSlot)}
            </p>
          </Card>
        )}
      </div>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Important:</strong> Please select your preferred exam date and arrive at the exam center by your selected time slot's reporting time. Late arrivals will not be permitted.
        </p>
      </Card>
    </div>
  );
};
