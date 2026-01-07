import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting SQL backup generation...");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define tables to backup - ordered by typical size (smaller first)
    const tables = [
      { name: 'settings', orderBy: 'created_at' },
      { name: 'slot_settings', orderBy: 'created_at' },
      { name: 'slot_date_settings', orderBy: 'created_at' },
      { name: 'coupons', orderBy: 'created_at' },
      { name: 'admin_users', orderBy: 'created_at' },
      { name: 'user_roles', orderBy: 'created_at' },
      { name: 'admin_sessions', orderBy: 'created_at' },
      { name: 'newsletter_subscribers', orderBy: 'created_at' },
      { name: 'payments', orderBy: 'created_at' },
      { name: 'whatsapp_messages', orderBy: 'created_at' },
      { name: 'registrations', orderBy: 'created_at' },
    ];

    // Helper function to escape SQL values
    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
      }
      if (typeof value === 'number') {
        return value.toString();
      }
      if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      }
      // String value - escape single quotes and backslashes
      return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
    };

    // Build SQL content in chunks to reduce memory pressure
    const chunks: string[] = [];
    
    chunks.push(`-- SQL Database Backup\n`);
    chunks.push(`-- Generated: ${new Date().toISOString()}\n`);
    chunks.push(`-- Project: MEGA SPARK NATIONAL CHAMPION\n`);
    chunks.push(`-- ============================================\n\n`);

    // Process each table
    for (const table of tables) {
      console.log(`Processing table: ${table.name}`);
      
      try {
        // Get count first
        const { count, error: countError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error(`Error counting ${table.name}:`, countError.message);
          chunks.push(`-- Error counting ${table.name}: ${countError.message}\n\n`);
          continue;
        }

        const totalCount = count || 0;
        
        chunks.push(`-- ============================================\n`);
        chunks.push(`-- Table: ${table.name}\n`);
        chunks.push(`-- Total Records: ${totalCount}\n`);
        chunks.push(`-- ============================================\n\n`);

        if (totalCount === 0) {
          chunks.push(`-- No data in table ${table.name}\n\n`);
          continue;
        }

        // Generate DELETE statement
        chunks.push(`DELETE FROM public.${table.name};\n\n`);

        // Fetch data in batches of 500 to reduce memory usage
        const batchSize = 500;
        let processedCount = 0;

        for (let offset = 0; offset < totalCount; offset += batchSize) {
          const { data, error } = await supabase
            .from(table.name)
            .select('*')
            .order(table.orderBy, { ascending: true })
            .range(offset, offset + batchSize - 1);

          if (error) {
            console.error(`Error fetching ${table.name} batch:`, error.message);
            chunks.push(`-- Error fetching batch at offset ${offset}: ${error.message}\n`);
            continue;
          }

          if (!data || data.length === 0) {
            break;
          }

          const columns = Object.keys(data[0]);
          
          // Generate INSERT statements for this batch
          for (const row of data) {
            const values = columns.map(col => escapeValue(row[col]));
            chunks.push(`INSERT INTO public.${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`);
            processedCount++;
          }

          console.log(`Processed ${processedCount}/${totalCount} rows from ${table.name}`);
        }

        chunks.push(`\n`);
      } catch (tableError: any) {
        console.error(`Error processing table ${table.name}:`, tableError.message);
        chunks.push(`-- Error processing ${table.name}: ${tableError.message}\n\n`);
      }
    }

    // Add summary
    chunks.push(`\n-- ============================================\n`);
    chunks.push(`-- Backup completed successfully\n`);
    chunks.push(`-- Generated at: ${new Date().toISOString()}\n`);
    chunks.push(`-- ============================================\n`);

    console.log("SQL backup generation completed successfully");

    // Join all chunks
    const sqlContent = chunks.join('');

    return new Response(sqlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="database-backup-${new Date().toISOString().split('T')[0]}.sql"`,
      },
    });

  } catch (error: any) {
    console.error("Error generating SQL backup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
