import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  const getSlotLabel = (slot: SlotSetting) => {
    return slot.slot_name.charAt(0).toUpperCase() + slot.slot_name.slice(1) + " Slot";
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
                <RadioGroupItem value={date.value} id={`date-${date.value}`} />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{date.label}</div>
                </div>
              </label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Preferred Time Slot *</Label>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading available slots...</p>
        ) : (
          <RadioGroup
            value={formData.timeSlot}
            onValueChange={(value) => updateFormData({ timeSlot: value })}
            className="space-y-3"
          >
            {slots.map((slot) => {
              const available = isSlotAvailable(slot);
              return (
                <Card
                  key={slot.slot_name}
                  className={`relative cursor-pointer transition-all ${
                    available ? 'hover:shadow-card' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <label className={`flex items-center space-x-3 p-4 ${available ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <RadioGroupItem 
                      value={slot.slot_name} 
                      id={slot.slot_name}
                      disabled={!available}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{getSlotLabel(slot)}</div>
                      <div className="text-sm text-muted-foreground">Reporting Time: {slot.reporting_time}</div>
                      <div className={`text-xs mt-1 ${available ? 'text-green-600' : 'text-red-600'}`}>
                        {getSlotAvailability(slot)}
                      </div>
                    </div>
                  </label>
                </Card>
              );
            })}
          </RadioGroup>
        )}
      </div>

      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <strong className="text-primary">Note:</strong> Please select your preferred exam date and arrive at the exam center by your selected time slot's reporting time. 
          Late arrivals will not be permitted.
        </p>
      </Card>
    </div>
  );
};
