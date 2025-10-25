import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    const saltKey = Deno.env.get('PHONEPE_SALT_KEY')?.trim();
    const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX')?.trim() || '1';
    if (!saltKey) {
      throw new Error('PhonePe salt key not configured');
    }

    const statusPath = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const xVerifyHash = await sha256Hex(statusPath + saltKey);
    const xVerify = `${xVerifyHash}###${saltIndex}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('X-VERIFY', xVerify);
    headers.set('X-MERCHANT-ID', merchantId);

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers
    });

let statusResult = await statusResponse.json();
console.log('Payment status:', statusResult);

// Cross-environment fallback if merchant keys belong to opposite environment
if ((!statusResponse.ok || statusResult?.code === 'KEY_NOT_CONFIGURED') && merchantId) {
  try {
    const otherBaseUrl = isSandbox
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    const otherStatusUrl = `${otherBaseUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const otherStatusPath = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const otherHash = await sha256Hex(otherStatusPath + saltKey);
    const otherXVerify = `${otherHash}###${saltIndex}`;
    const otherHeaders = new Headers();
    otherHeaders.set('Content-Type', 'application/json');
    otherHeaders.set('Accept', 'application/json');
    otherHeaders.set('X-VERIFY', otherXVerify);
    otherHeaders.set('X-MERCHANT-ID', merchantId);
    console.log('Retrying status in opposite environment:', otherStatusUrl);
    const otherResp = await fetch(otherStatusUrl, { method: 'GET', headers: otherHeaders });
    const otherJson = await otherResp.json().catch(() => null);
    if (otherJson) {
      statusResult = otherJson;
    }
    console.log('Cross-env status response:', otherResp.status, statusResult);
  } catch (crossErr) {
    console.error('Cross-env status retry failed:', crossErr);
  }
}

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
