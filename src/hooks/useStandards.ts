import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseProxy";

export interface Standard {
  id: string;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

const fetchActiveStandards = async (): Promise<Standard[]> => {
  const { data, error } = await supabase
    .from("standards")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data as Standard[]) || [];
};

export function useActiveStandards() {
  return useQuery({
    queryKey: ["standards", "active"],
    queryFn: fetchActiveStandards,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
