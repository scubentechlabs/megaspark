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
    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')?.trim();
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY')?.replace(/\r?\n/g, '').trim();
    const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX')?.replace(/\r?\n/g, '').trim();

    if (!merchantId || !saltKey || !saltIndex) {
      throw new Error('PhonePe credentials not configured');
    }

    const body = await req.json();
    console.log('PhonePe callback received:', body);

    const { merchantTransactionId } = body;

    if (!merchantTransactionId) {
      throw new Error('Missing transaction ID');
    }

    // Verify payment status with PhonePe
    const checksumString = `/pg/v1/status/${merchantId}/${merchantTransactionId}${saltKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const xVerifyHeader = `${checksum}###${saltIndex}`.replace(/[\r\n]/g, '').trim();

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
    headers.set('X-VERIFY', xVerifyHeader);
    headers.set('X-MERCHANT-ID', merchantId);

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers
    });

    const statusResult = await statusResponse.json();
    console.log('Payment status:', statusResult);

    // Update registration in database if payment successful
    if (statusResult.success && statusResult.data?.state === 'COMPLETED') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Extract registration ID from merchant transaction ID
      const registrationId = merchantTransactionId.split('_')[0];

      // Save payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          order_id: merchantTransactionId,
          payment_id: statusResult.data.transactionId,
          amount: statusResult.data.amount / 100, // Convert from paise to rupees
          status: 'success',
          payment_method: 'phonepe',
          registration_id: null // Will be linked later when registration is created
        });

      if (paymentError) {
        console.error('Error saving payment:', paymentError);
      } else {
        console.log('Payment saved successfully for:', merchantTransactionId);
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
