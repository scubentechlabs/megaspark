import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('PHONEPE_CLIENT_ID')?.trim();
    const clientSecret = Deno.env.get('PHONEPE_CLIENT_SECRET')?.trim();
    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')?.trim();

    if (!clientId || !clientSecret || !merchantId) {
      throw new Error('PhonePe credentials not configured');
    }

    const body = await req.json();
    console.log('PhonePe callback received:', body);

    const { merchantTransactionId } = body;

    if (!merchantTransactionId) {
      throw new Error('Missing transaction ID');
    }

    // Get OAuth token
    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = btoa(authString);

    // Decide PhonePe environment
    const phonepeEnv = Deno.env.get('PHONEPE_ENV')?.toUpperCase().trim();
    const isSandbox = (phonepeEnv ?? 'PROD') !== 'PROD';
    const baseUrl = isSandbox
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
      : 'https://api.phonepe.com/apis/hermes';
    const statusUrl = `${baseUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    console.log('PhonePe callback env:', isSandbox ? 'SANDBOX' : 'PROD', 'URL:', statusUrl);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Basic ${authBase64}`);

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers
    });

    const statusResult = await statusResponse.json();
    console.log('Payment status:', statusResult);

    // Update payment record in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (statusResult.success && statusResult.data?.state === 'COMPLETED') {
      // Update payment status to success
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: 'success',
          transaction_id: statusResult.data.transactionId,
          payment_method: statusResult.data.paymentInstrument?.type || 'phonepe'
        })
        .eq('order_id', merchantTransactionId);

      if (updateError) {
        console.error('Error updating payment:', updateError);
      } else {
        console.log('Payment updated successfully for:', merchantTransactionId);
      }
    } else if (statusResult.data?.state === 'FAILED') {
      // Update payment status to failed
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: statusResult.data.responseCode || 'Payment failed'
        })
        .eq('order_id', merchantTransactionId);

      if (updateError) {
        console.error('Error updating failed payment:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: statusResult }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('PhonePe callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Callback processing failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
