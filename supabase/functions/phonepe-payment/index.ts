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

interface PaymentRequest {
  amount: number;
  registrationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  couponCode?: string;
  discountAmount?: number;
  originalAmount?: number;
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

    const { 
      amount, 
      registrationId, 
      customerName, 
      customerPhone, 
      customerEmail,
      couponCode,
      discountAmount,
      originalAmount 
    }: PaymentRequest = await req.json();

    console.log('Payment request received:', { amount, registrationId, customerName, couponCode });

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

    // Get OAuth token
    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = btoa(authString);
    
    // Encode payload to base64 (UTF-8 safe)
    const payloadString = JSON.stringify(paymentPayload);
    const payloadBytes = new TextEncoder().encode(payloadString);
    const base64Payload = btoa(String.fromCharCode(...payloadBytes));

    console.log('Initiating PhonePe payment for transaction:', merchantTransactionId);

    // Decide PhonePe environment
    const phonepeEnv = Deno.env.get('PHONEPE_ENV')?.toUpperCase().trim();
    const isSandbox = (phonepeEnv ?? 'PROD') !== 'PROD';
    const payUrl = isSandbox
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
      : 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
    console.log('PhonePe environment:', isSandbox ? 'SANDBOX' : 'PROD', 'URL:', payUrl);

    // Make API call to PhonePe with OAuth authentication
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Basic ${authBase64}`);
    headers.set('X-CLIENT-ID', clientId);
    headers.set('X-CLIENT-VERSION', '1');

    let response = await fetch(payUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        request: base64Payload
      })
    });

    let raw = await response.text();
    let result: any = null;
    try {
      result = raw ? JSON.parse(raw) : null;
    } catch (_) {
      // not JSON
    }
    console.log('PhonePe raw response:', response.status, raw);

    // If unauthorized on PROD, try SANDBOX automatically
    if (response.status === 401 && !isSandbox) {
      const sandboxUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
      console.log('Retrying PhonePe payment in SANDBOX due to 401 from PROD');
      response = await fetch(sandboxUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ request: base64Payload })
      });
      raw = await response.text();
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_) {
        // not JSON
      }
      console.log('PhonePe SANDBOX raw response:', response.status, raw);
    }

    // Fallback to X-VERIFY flow if OAuth is not configured for this merchant
    if (!response.ok && (result?.code === 'KEY_NOT_CONFIGURED' || response.status === 401)) {
      const saltKey = Deno.env.get('PHONEPE_SALT_KEY')?.trim();
      const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX')?.trim() || '1';
      if (!saltKey) {
        throw new Error('PhonePe salt key not configured for fallback');
      }

      const payPath = '/pg/v1/pay';
      const xVerifyHash = await sha256Hex(base64Payload + payPath + saltKey);
      const xVerify = `${xVerifyHash}###${saltIndex}`;

      const headersV2 = new Headers();
      headersV2.set('Content-Type', 'application/json');
      headersV2.set('Accept', 'application/json');
      headersV2.set('X-VERIFY', xVerify);
      headersV2.set('X-MERCHANT-ID', merchantId);

      console.log('Retrying PhonePe payment with X-VERIFY flow');
      response = await fetch(payUrl, {
        method: 'POST',
        headers: headersV2,
        body: JSON.stringify({ request: base64Payload })
      });

      raw = await response.text();
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_) {}
      console.log('PhonePe X-VERIFY raw response:', response.status, raw);
    }

    if (!response.ok) {
      throw new Error(result?.message || `PhonePe returned ${response.status}`);
    }

    // Create initial payment record with pending status
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id: merchantTransactionId,
        transaction_id: merchantTransactionId,
        student_name: customerName,
        payment_type: 'online',
        status: 'pending',
        amount: amount,
        original_amount: originalAmount || amount,
        discount_amount: discountAmount || 0,
        coupon_code: couponCode || null,
        payment_method: 'phonepe'
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
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
