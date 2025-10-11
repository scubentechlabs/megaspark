import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to verify checksum
async function verifyChecksum(params: Record<string, any>, checksum: string, merchantKey: string): Promise<boolean> {
  const { CHECKSUMHASH, ...paramsWithoutChecksum } = params;
  
  const paramString = Object.keys(paramsWithoutChecksum)
    .sort()
    .map(key => `${key}=${paramsWithoutChecksum[key]}`)
    .join('&');
  
  const stringToHash = paramString + merchantKey;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const generatedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return generatedChecksum === checksum;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const merchantKey = Deno.env.get('PAYTM_MERCHANT_KEY');

    if (!merchantKey) {
      throw new Error('Paytm credentials not configured');
    }

    // Parse form data from Paytm
    const formData = await req.formData();
    const body: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    
    console.log('Paytm callback received:', body);

    const { CHECKSUMHASH, ...paytmParams } = body;
    
    // Verify checksum
    const isValidChecksum = await verifyChecksum(body, CHECKSUMHASH, merchantKey);
    
    if (!isValidChecksum) {
      throw new Error('Invalid checksum');
    }

    // Check payment status
    if (paytmParams.STATUS === 'TXN_SUCCESS') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Extract registration ID from order ID
      const orderIdParts = paytmParams.ORDERID.split('_');
      const registrationId = orderIdParts[1];

      console.log('Payment completed for registration:', registrationId);
      
      // You can update the registration status here if needed
      // await supabaseClient
      //   .from('registrations')
      //   .update({ payment_status: 'completed' })
      //   .eq('id', registrationId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: paytmParams.STATUS,
        orderId: paytmParams.ORDERID 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Paytm callback error:', error);
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
