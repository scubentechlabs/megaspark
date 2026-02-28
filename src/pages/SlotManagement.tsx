import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface SlotSetting {
  id: string;
  slot_name: string;
  is_enabled: boolean;
  max_capacity: number;
  current_count: number;
  reporting_time: string;
}

interface SlotDateSetting {
  id: string;
  exam_date: string;
  slot_name: string;
  is_enabled: boolean;
}

interface ExamDateOption {
  value: string;
  label: string;
}

export default function SlotManagement() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotSetting[]>([]);
  const [dateSlots, setDateSlots] = useState<SlotDateSetting[]>([]);
  const [examDates, setExamDates] = useState<ExamDateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    fetchSlots();
    fetchDateSlots();
  };

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_settings')
        .select('*')
        .order('slot_name');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error("Failed to load slot settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchDateSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_date_settings')
        .select('*')
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setDateSlots(data || []);
    } catch (error) {
      console.error('Error fetching date slots:', error);
      toast.error("Failed to load date-specific slot settings");
    }
  };

  const updateSlot = async (id: string, updates: Partial<SlotSetting>) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('slot_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success("Slot settings updated successfully");
      fetchSlots();
    } catch (error) {
      console.error('Error updating slot:', error);
      toast.error("Failed to update slot settings");
    } finally {
      setUpdating(null);
    }
  };

  const addDateSlotOverride = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select both date and slot");
      return;
    }

    try {
      const { error } = await supabase
        .from('slot_date_settings')
        .upsert({
          exam_date: selectedDate,
          slot_name: selectedSlot,
          is_enabled: false
        }, {
          onConflict: 'exam_date,slot_name'
        });

      if (error) throw error;

      toast.success("Date-specific slot setting added");
      fetchDateSlots();
      setSelectedDate("");
      setSelectedSlot("");
    } catch (error) {
      console.error('Error adding date slot:', error);
      toast.error("Failed to add date-specific slot setting");
    }
  };

  const toggleDateSlot = async (id: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('slot_date_settings')
        .update({ is_enabled: !currentEnabled })
        .eq('id', id);

      if (error) throw error;

      toast.success("Slot status updated");
      fetchDateSlots();
    } catch (error) {
      console.error('Error updating date slot:', error);
      toast.error("Failed to update slot status");
    }
  };

  const getSlotLabel = (slotName: string) => {
    return slotName.charAt(0).toUpperCase() + slotName.slice(1) + " Slot";
  };

  if (loading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Time Slot Management</h1>
              <p className="text-muted-foreground">Manage exam time slots and their availability</p>
            </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disable Slot for Specific Date</CardTitle>
          <CardDescription>Add date-specific slot overrides to disable slots for particular exam dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {examDates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem key={slot.slot_name} value={slot.slot_name}>
                      {getSlotLabel(slot.slot_name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addDateSlotOverride} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Disable Slot
              </Button>
            </div>
          </div>

          {dateSlots.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Active Date-Specific Overrides</h3>
              <div className="space-y-2">
                {dateSlots.map((dateSlot) => (
                  <div key={dateSlot.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div>
                      <span className="font-medium">
                        {examDates.find((d: ExamDateOption) => d.value === dateSlot.exam_date)?.label || dateSlot.exam_date}
                      </span>
                      <span className="mx-2">-</span>
                      <span>{getSlotLabel(dateSlot.slot_name)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${dateSlot.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {dateSlot.is_enabled ? 'Enabled' : 'Disabled (Full)'}
                      </span>
                      <Switch
                        checked={dateSlot.is_enabled}
                        onCheckedChange={() => toggleDateSlot(dateSlot.id, dateSlot.is_enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {slots.map((slot) => (
          <Card key={slot.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getSlotLabel(slot.slot_name)}</span>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`enabled-${slot.id}`} className="text-sm font-normal">
                    {slot.is_enabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    id={`enabled-${slot.id}`}
                    checked={slot.is_enabled}
                    onCheckedChange={(checked) => 
                      updateSlot(slot.id, { is_enabled: checked })
                    }
                    disabled={updating === slot.id}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                Reporting Time: {slot.reporting_time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`reporting-${slot.id}`}>Reporting Time</Label>
                  <Input
                    id={`reporting-${slot.id}`}
                    value={slot.reporting_time}
                    onChange={(e) => {
                      const updated = slots.map(s => 
                        s.id === slot.id ? { ...s, reporting_time: e.target.value } : s
                      );
                      setSlots(updated);
                    }}
                    placeholder="e.g., 8:00 AM"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateSlot(slot.id, { reporting_time: slot.reporting_time })}
                    disabled={updating === slot.id}
                  >
                    {updating === slot.id ? "Updating..." : "Update Time"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`capacity-${slot.id}`}>Max Capacity</Label>
                  <Input
                    id={`capacity-${slot.id}`}
                    type="number"
                    value={slot.max_capacity}
                    onChange={(e) => {
                      const updated = slots.map(s => 
                        s.id === slot.id ? { ...s, max_capacity: parseInt(e.target.value) || 0 } : s
                      );
                      setSlots(updated);
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => updateSlot(slot.id, { max_capacity: slot.max_capacity })}
                    disabled={updating === slot.id}
                  >
                    {updating === slot.id ? "Updating..." : "Update Capacity"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Current Registrations</Label>
                  <div className="text-2xl font-bold">{slot.current_count}</div>
                  <div className="text-sm text-muted-foreground">
                    {slot.max_capacity - slot.current_count} seats remaining
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((slot.current_count / slot.max_capacity) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {!slot.is_enabled && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ This slot is currently disabled. Students cannot select this time slot during registration.
                  </p>
                </div>
              )}

              {slot.current_count >= slot.max_capacity && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">
                    ⚠️ This slot has reached maximum capacity. Consider disabling it or increasing the capacity.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
