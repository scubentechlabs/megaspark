import { supabase } from "@/integrations/supabase/client";

interface OrderBy {
  column: string;
  ascending?: boolean;
}

// Fetch all rows from a table, bypassing the 1000-rows-per-request cap by batching
export async function fetchAll<T = any>(
  table: string,
  selectColumns: string = "*",
  orderBy?: OrderBy,
  pageSize: number = 1000
): Promise<T[]> {
  // Get exact count first
  const { count, error: countError } = await (supabase as any)
    .from(table)
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;

  const total = count ?? 0;
  if (total === 0) return [];

  const pages = Math.ceil(total / pageSize);

  const fetchPage = async (pageIndex: number) => {
    const from = pageIndex * pageSize;
    const to = Math.min(from + pageSize - 1, total - 1);

    let query: any = (supabase as any)
      .from(table)
      .select(selectColumns)
      .range(from, to);

    if (orderBy?.column) {
      query = query.order(orderBy.column as any, { ascending: orderBy.ascending ?? false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  };

  // Fetch all pages in sequence to preserve order across ranges
  const results: T[] = [];
  for (let i = 0; i < pages; i++) {
    const pageData = await fetchPage(i);
    results.push(...pageData);
  }

  return results;
}
