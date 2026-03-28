import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ExamDate {
  id: string;
  exam_date: string;
  label: string;
  day_name: string | null;
  exam_time: string | null;
  is_active: boolean;
}

export interface ExamDateOption {
  value: string;
  label: string;
}

export interface SlotSetting {
  id: string;
  slot_name: string;
  is_enabled: boolean;
  max_capacity: number;
  current_count: number;
  reporting_time: string;
}

export interface SlotDateSetting {
  id: string;
  exam_date: string;
  slot_name: string;
  is_enabled: boolean;
}

const fetchActiveExamDates = async (): Promise<ExamDate[]> => {
  const { data, error } = await supabase
    .from("exam_dates")
    .select("*")
    .eq("is_active", true)
    .order("exam_date", { ascending: true });
  if (error) throw error;
  return (data as ExamDate[]) || [];
};

const fetchMaintenanceMode = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('get_maintenance_mode');
  if (error) throw error;
  if (!data) return false;
  const hostname = window.location.hostname;
  const isLovable = hostname.includes("lovable.app") || hostname.includes("lovableproject.com");
  return !isLovable;
};

const fetchSlotSettings = async (): Promise<SlotSetting[]> => {
  const { data, error } = await supabase.rpc('get_enabled_slot_settings');
  if (error) throw error;
  return (data as SlotSetting[]) || [];
};

const fetchDateSlotSettings = async (): Promise<SlotDateSetting[]> => {
  const { data, error } = await supabase.rpc('get_enabled_slot_date_settings');
  if (error) throw error;
  return (data as SlotDateSetting[]) || [];
};

export function useActiveExamDates() {
  return useQuery({
    queryKey: ["examDates", "active"],
    queryFn: fetchActiveExamDates,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useExamDateOptions() {
  const query = useActiveExamDates();
  const options: ExamDateOption[] = (query.data || []).map((d) => ({
    value: d.exam_date,
    label: d.label + (d.day_name ? ` - ${d.day_name}` : ""),
  }));
  return { ...query, data: options };
}

export function useMaintenanceMode() {
  return useQuery({
    queryKey: ["maintenanceMode"],
    queryFn: fetchMaintenanceMode,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 0,
    placeholderData: false,
  });
}

export function useSlotSettings() {
  return useQuery({
    queryKey: ["slotSettings"],
    queryFn: fetchSlotSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDateSlotSettings() {
  return useQuery({
    queryKey: ["dateSlotSettings"],
    queryFn: fetchDateSlotSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
