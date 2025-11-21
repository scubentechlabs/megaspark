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
  try {
    console.log(`[fetchAll] Fetching from table: ${table}`);
    
    // Get exact count first
    const { count, error: countError } = await (supabase as any)
      .from(table)
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error(`[fetchAll] Count error:`, countError);
      throw countError;
    }

    const total = count ?? 0;
    console.log(`[fetchAll] Total rows: ${total}`);
    
    if (total === 0) return [];

    const pages = Math.ceil(total / pageSize);
    console.log(`[fetchAll] Pages to fetch: ${pages}`);

    const fetchPage = async (pageIndex: number) => {
      const from = pageIndex * pageSize;
      const to = Math.min(from + pageSize - 1, total - 1);

      console.log(`[fetchAll] Fetching page ${pageIndex + 1}/${pages} (rows ${from}-${to})`);

      let query: any = (supabase as any)
        .from(table)
        .select(selectColumns)
        .range(from, to);

      if (orderBy?.column) {
        query = query.order(orderBy.column as any, { ascending: orderBy.ascending ?? false });
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[fetchAll] Page ${pageIndex} error:`, error);
        throw error;
      }
      console.log(`[fetchAll] Page ${pageIndex + 1} fetched: ${data?.length} rows`);
      return data as T[];
    };

    // Fetch all pages in sequence to preserve order across ranges
    const results: T[] = [];
    for (let i = 0; i < pages; i++) {
      const pageData = await fetchPage(i);
      results.push(...pageData);
    }

    console.log(`[fetchAll] Complete. Total fetched: ${results.length}`);
    return results;
  } catch (error) {
    console.error(`[fetchAll] Fatal error:`, error);
    throw error;
  }
}
