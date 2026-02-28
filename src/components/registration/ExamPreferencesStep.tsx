import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useExamDateOptions, useSlotSettings, useDateSlotSettings } from "@/hooks/useExamData";
import type { SlotSetting } from "@/hooks/useExamData";

interface ExamPreferencesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export const ExamPreferencesStep = ({ formData, updateFormData }: ExamPreferencesStepProps) => {
  const { data: examDates = [] } = useExamDateOptions();
  const { data: slots = [], isLoading: loading } = useSlotSettings();
  const { data: dateSlots = [] } = useDateSlotSettings();

  const getSlotLabel = (slotName: string) => {
    return slotName.charAt(0).toUpperCase() + slotName.slice(1) + " Slot";
  };

  const isSlotAvailable = (slot: SlotSetting) => {
    if (formData.examDate) {
      const dateOverride = dateSlots.find(
        ds => ds.exam_date === formData.examDate && ds.slot_name === slot.slot_name
      );
      if (dateOverride && !dateOverride.is_enabled) return false;
    }
    return slot.is_enabled && slot.current_count < slot.max_capacity;
  };

  const getSlotStatusMessage = (slot: SlotSetting) => {
    if (formData.examDate) {
      const dateOverride = dateSlots.find(
        ds => ds.exam_date === formData.examDate && ds.slot_name === slot.slot_name
      );
      if (dateOverride && !dateOverride.is_enabled) return "Slot Is Full";
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
    if (formData.timeSlot) {
      const currentSlot = slots.find(s => s.slot_name === formData.timeSlot);
      if (currentSlot) {
        const dateOverride = dateSlots.find(
          ds => ds.exam_date === newDate && ds.slot_name === currentSlot.slot_name
        );
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
