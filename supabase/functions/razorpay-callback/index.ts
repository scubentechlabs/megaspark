import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
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
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!keySecret) {
      throw new Error('Razorpay secret not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    console.log('Razorpay callback received:', body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment parameters');
    }

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.error('Invalid signature');
      
      // Update payment to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: 'Signature verification failed',
        })
        .eq('order_id', razorpay_order_id);

      throw new Error('Payment verification failed');
    }

    console.log('Payment verified successfully:', razorpay_payment_id);

    // Fetch payment method details from Razorpay
    let paymentMethod = 'razorpay';
    try {
      const keyId = Deno.env.get('RAZORPAY_KEY_ID');
      const auth = btoa(`${keyId}:${keySecret}`);
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        paymentMethod = paymentData.method || 'razorpay';
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }

    // Update payment to success
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        transaction_id: razorpay_payment_id,
        payment_method: paymentMethod,
      })
      .eq('order_id', razorpay_order_id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
    }

    // Insert registration if provided
    if (registrationData) {
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .insert(registrationData)
        .select()
        .single();

      if (regError) {
        console.error('Registration error:', regError);
      } else {
        // Link payment to registration
        await supabase
          .from('payments')
          .update({ registration_id: regData.id })
          .eq('order_id', razorpay_order_id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Razorpay callback error:', error);
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
