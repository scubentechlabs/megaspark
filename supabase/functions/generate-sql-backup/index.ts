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

    // Define tables to backup with their columns
    const tables = [
      { name: 'registrations', orderBy: 'created_at' },
      { name: 'payments', orderBy: 'created_at' },
      { name: 'coupons', orderBy: 'created_at' },
      { name: 'settings', orderBy: 'created_at' },
      { name: 'slot_settings', orderBy: 'created_at' },
      { name: 'slot_date_settings', orderBy: 'created_at' },
      { name: 'newsletter_subscribers', orderBy: 'created_at' },
      { name: 'whatsapp_messages', orderBy: 'created_at' },
      { name: 'admin_users', orderBy: 'created_at' },
      { name: 'admin_sessions', orderBy: 'created_at' },
      { name: 'user_roles', orderBy: 'created_at' },
    ];

    let sqlContent = `-- SQL Database Backup\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Project: MEGA SPARK EXAM 2025\n`;
    sqlContent += `-- ============================================\n\n`;

    // Fetch and generate INSERT statements for each table
    for (const table of tables) {
      console.log(`Processing table: ${table.name}`);
      
      try {
        // Fetch all data from table with pagination
        let allData: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(table.name)
            .select('*')
            .order(table.orderBy, { ascending: true })
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) {
            console.error(`Error fetching ${table.name}:`, error.message);
            sqlContent += `-- Error fetching ${table.name}: ${error.message}\n\n`;
            break;
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            page++;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }

        sqlContent += `-- ============================================\n`;
        sqlContent += `-- Table: ${table.name}\n`;
        sqlContent += `-- Total Records: ${allData.length}\n`;
        sqlContent += `-- ============================================\n\n`;

        if (allData.length === 0) {
          sqlContent += `-- No data in table ${table.name}\n\n`;
          continue;
        }

        // Generate DELETE statement for clean import
        sqlContent += `DELETE FROM public.${table.name};\n\n`;

        // Generate INSERT statements
        const columns = Object.keys(allData[0]);
        
        for (const row of allData) {
          const values = columns.map(col => {
            const value = row[col];
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
            // String value - escape single quotes
            return `'${String(value).replace(/'/g, "''")}'`;
          });

          sqlContent += `INSERT INTO public.${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }

        sqlContent += `\n`;
      } catch (tableError: any) {
        console.error(`Error processing table ${table.name}:`, tableError.message);
        sqlContent += `-- Error processing ${table.name}: ${tableError.message}\n\n`;
      }
    }

    // Add summary at the end
    sqlContent += `\n-- ============================================\n`;
    sqlContent += `-- Backup completed successfully\n`;
    sqlContent += `-- Generated at: ${new Date().toISOString()}\n`;
    sqlContent += `-- ============================================\n`;

    console.log("SQL backup generation completed successfully");

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
