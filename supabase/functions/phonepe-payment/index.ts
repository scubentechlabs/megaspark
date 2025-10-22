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

    const { amount, registrationId, customerName, customerPhone, customerEmail }: PaymentRequest = await req.json();

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const merchantTransactionId = `${registrationId}_${transactionId}`;

    // PhonePe payment request payload
    const paymentPayload = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: `USER_${registrationId}`,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${(req.headers.get('origin') || (req.headers.get('referer') ? new URL(req.headers.get('referer')!).origin : 'https://megasparkexam.com'))}/registration-success?txnId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-callback`,
      mobileNumber: customerPhone,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    console.log('Payment payload:', paymentPayload);

    // Encode payload to base64
    const base64Payload = btoa(JSON.stringify(paymentPayload));

    // Generate X-VERIFY checksum
    const checksumString = `${base64Payload}/pg/v1/pay${saltKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(checksumString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const xVerifyHeader = `${checksum}###${saltIndex}`;
    const xVerifyAscii = xVerifyHeader.replace(/[^\x00-\x7F]/g, '');

    console.log('Initiating PhonePe payment for transaction:', merchantTransactionId, 'headerBuilder:v3');

    // Make API call to PhonePe
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('X-VERIFY', xVerifyAscii);
    headers.set('X-MERCHANT-ID', merchantId);

    const response = await fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        request: base64Payload
      })
    });

    const raw = await response.text();
    let result: any = null;
    try {
      result = raw ? JSON.parse(raw) : null;
    } catch (_) {
      // not JSON
    }
    console.log('PhonePe raw response:', response.status, raw);

    if (!response.ok) {
      throw new Error(result?.message || `PhonePe returned ${response.status}`);
    }

    if (result?.success && result?.data?.instrumentResponse?.redirectInfo?.url) {
      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: result.data.instrumentResponse.redirectInfo.url,
          transactionId: merchantTransactionId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      throw new Error(result?.message || 'Payment initiation failed');
    }

  } catch (error) {
    console.error('PhonePe payment error:', error);
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
