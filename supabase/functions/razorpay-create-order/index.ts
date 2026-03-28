import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  amount: number;
  studentName: string;
  mobileNumber: string;
  email?: string;
  discountAmount?: number;
  couponCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const requestData: CreateOrderRequest = await req.json();
    const { amount, studentName, mobileNumber, email, discountAmount, couponCode } = requestData;

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      throw new Error('Invalid amount');
    }
    if (!studentName || typeof studentName !== 'string' || studentName.length > 200) {
      throw new Error('Invalid student name');
    }
    if (!mobileNumber || typeof mobileNumber !== 'string' || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, '').slice(-10))) {
      throw new Error('Invalid mobile number');
    }

    // Create Razorpay order
    const orderAmount = Math.round(amount * 100); // Convert to paise
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const razorpayOrderPayload = {
      amount: orderAmount,
      currency: 'INR',
      receipt: orderId,
      notes: {
        student_name: studentName,
        mobile: mobileNumber,
        email: email || '',
      }
    };

    console.log('Creating Razorpay order:', razorpayOrderPayload);

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrderPayload),
    });

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order response:', razorpayOrder);

    if (!razorpayResponse.ok) {
      throw new Error(`Razorpay API error: ${JSON.stringify(razorpayOrder)}`);
    }

    // Create payment record in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const originalAmount = discountAmount ? amount + discountAmount : amount;

    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id: razorpayOrder.id,
        amount: amount,
        original_amount: originalAmount,
        discount_amount: discountAmount || 0,
        coupon_code: couponCode || null,
        student_name: studentName,
        payment_type: 'registration',
        status: 'pending',
        payment_method: 'razorpay',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log('Payment record created:', paymentRecord);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: razorpayOrder.id,
        amount: orderAmount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
        paymentId: paymentRecord.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
