import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const generatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return generatedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: VerifyPaymentRequest = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required parameters');
    }

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment record
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: payment, error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: 'success',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', razorpay_order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment verified and updated:', payment);

    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: true,
        payment: payment 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    return new Response(
      JSON.stringify({ success: false, verified: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
