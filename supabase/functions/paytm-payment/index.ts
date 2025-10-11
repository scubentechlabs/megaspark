import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  registrationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

// Function to generate checksum
async function generateChecksum(params: Record<string, any>, merchantKey: string): Promise<string> {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToHash = paramString + merchantKey;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return checksum;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const merchantId = Deno.env.get('PAYTM_MERCHANT_ID');
    const merchantKey = Deno.env.get('PAYTM_MERCHANT_KEY');

    if (!merchantId || !merchantKey) {
      throw new Error('Paytm credentials not configured');
    }

    const { amount, registrationId, customerName, customerPhone, customerEmail }: PaymentRequest = await req.json();

    // Generate unique order ID
    const orderId = `ORDER_${registrationId}_${Date.now()}`;

    // Paytm payment request parameters
    const paytmParams: Record<string, any> = {
      MID: merchantId,
      WEBSITE: 'DEFAULT',
      INDUSTRY_TYPE_ID: 'Retail',
      CHANNEL_ID: 'WEB',
      ORDER_ID: orderId,
      CUST_ID: `CUST_${registrationId}`,
      TXN_AMOUNT: amount.toString(),
      CALLBACK_URL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paytm-callback`,
      EMAIL: customerEmail || '',
      MOBILE_NO: customerPhone,
    };

    console.log('Payment params:', paytmParams);

    // Generate checksum
    const checksum = await generateChecksum(paytmParams, merchantKey);
    
    // Paytm uses form-based redirect, so we'll return the params and checksum
    // The frontend will create a form and submit it
    return new Response(
      JSON.stringify({
        success: true,
        paytmParams: {
          ...paytmParams,
          CHECKSUMHASH: checksum
        },
        paytmUrl: 'https://securegw-stage.paytm.in/order/process', // Use production URL: https://securegw.paytm.in/order/process
        orderId: orderId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Paytm payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
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
