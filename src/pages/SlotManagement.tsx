import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SlotSetting {
  id: string;
  slot_name: string;
  is_enabled: boolean;
  max_capacity: number;
  current_count: number;
  reporting_time: string;
}

export default function SlotManagement() {
  const [slots, setSlots] = useState<SlotSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

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

  const getSlotLabel = (slotName: string) => {
    return slotName.charAt(0).toUpperCase() + slotName.slice(1) + " Slot";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Time Slot Management</h1>
        <p className="text-muted-foreground">Manage exam time slots and their availability</p>
      </div>

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
  );
}
