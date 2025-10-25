import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting pending payment expiration check...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log('Looking for pending payments older than:', twentyFourHoursAgo.toISOString());

    // Find all pending payments older than 24 hours
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, order_id, student_name, created_at')
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching pending payments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingPayments?.length || 0} pending payments to expire`);

    if (!pendingPayments || pendingPayments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending payments to expire',
          expiredCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Update all found payments to failed status
    const { data: updatedPayments, error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'failed',
        failure_reason: 'Payment expired - No response received within 24 hours',
        updated_at: new Date().toISOString()
      })
      .in('id', pendingPayments.map(p => p.id))
      .select();

    if (updateError) {
      console.error('Error updating payments:', updateError);
      throw updateError;
    }

    console.log(`Successfully expired ${updatedPayments?.length || 0} payments`);

    // Log details of expired payments
    updatedPayments?.forEach(payment => {
      console.log(`Expired payment: Order ID: ${payment.order_id}, Student: ${payment.student_name}`);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully expired ${updatedPayments?.length || 0} pending payments`,
        expiredCount: updatedPayments?.length || 0,
        expiredPayments: updatedPayments?.map(p => ({
          orderId: p.order_id,
          studentName: p.student_name
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in expire-pending-payments function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
