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

interface SlotDateSetting {
  exam_date: string;
  slot_name: string;
  is_enabled: boolean;
}

const allExamDates = [
  { value: "2025-11-30", label: "30th November 2025 - Sunday" },
  { value: "2025-12-07", label: "7th December 2025 - Sunday" },
  { value: "2025-12-14", label: "14th December 2025 - Sunday" },
  { value: "2025-12-28", label: "28th December 2025 - Sunday" }
];

// Filter out past and current dates - only show future dates
const getAvailableExamDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return allExamDates.filter(date => {
    const examDate = new Date(date.value);
    return examDate > today; // Only future dates, not today
  });
};

const examDates = getAvailableExamDates();

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  const [slots, setSlots] = useState<SlotSetting[]>([]);
  const [dateSlots, setDateSlots] = useState<SlotDateSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlotSettings();
    fetchDateSlotSettings();
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

  const fetchDateSlotSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_date_settings')
        .select('*');

      if (error) throw error;
      setDateSlots(data || []);
    } catch (error) {
      console.error('Error fetching date slot settings:', error);
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
    // Check date-specific overrides
    if (formData.examDate) {
      const dateOverride = dateSlots.find(
        ds => ds.exam_date === formData.examDate && ds.slot_name === slot.slot_name
      );
      if (dateOverride && !dateOverride.is_enabled) {
        return false;
      }
    }
    return slot.is_enabled && slot.current_count < slot.max_capacity;
  };

  const getSlotStatusMessage = (slot: SlotSetting) => {
    // Check date-specific overrides
    if (formData.examDate) {
      const dateOverride = dateSlots.find(
        ds => ds.exam_date === formData.examDate && ds.slot_name === slot.slot_name
      );
      if (dateOverride && !dateOverride.is_enabled) {
        return "Slot Is Full";
      }
    }
    if (!slot.is_enabled) return "Disabled";
    if (slot.current_count >= slot.max_capacity) return "Full";
    return "";
  };

  const getReportingTime = (slotName: string | null) => {
    if (!slotName) return 'TBA';
    const slotData = slots.find(s => s.slot_name === slotName);
    if (slotData) return slotData.reporting_time;
    if (slotName.toLowerCase() === 'morning') return '8:00 AM';
    if (slotName.toLowerCase() === 'afternoon') return '2:30 PM';
    return 'TBA';
  };

  const handleDateChange = (newDate: string) => {
    // Check if current time slot is available for the new date
    if (formData.timeSlot) {
      const currentSlot = slots.find(s => s.slot_name === formData.timeSlot);
      if (currentSlot) {
        const dateOverride = dateSlots.find(
          ds => ds.exam_date === newDate && ds.slot_name === currentSlot.slot_name
        );
        // If slot is disabled for new date or full, clear the selection
        if ((dateOverride && !dateOverride.is_enabled) || 
            !currentSlot.is_enabled || 
            currentSlot.current_count >= currentSlot.max_capacity) {
          updateFormData({ examDate: newDate, timeSlot: '' });
          toast.warning("Time slot cleared", {
            description: "Your previously selected slot is not available for this date. Please select a new slot."
          });
          return;
        }
      }
    }
    updateFormData({ examDate: newDate });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="examDate">Preferred Exam Date *</Label>
        <Select value={formData.examDate} onValueChange={handleDateChange}>
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
                const statusMessage = getSlotStatusMessage(slot);
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
                      {statusMessage && (
                        <span className="text-xs ml-4 text-red-600 font-medium">
                          {statusMessage}
                        </span>
                      )}
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
