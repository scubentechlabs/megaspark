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
    const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID');
    const saltKey = Deno.env.get('PHONEPE_SALT_KEY');
    const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX');

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
    const xVerify = `${checksum}###${saltIndex}`;

    const statusResponse = await fetch(
      `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
        }
      }
    );

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

      // You could update the registration status here
      // For now, we'll just log it
      console.log('Payment completed for registration:', registrationId);
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
