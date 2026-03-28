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
    const { code } = await req.json();

    if (!code || typeof code !== 'string' || code.length > 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid coupon code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid coupon code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;

    if (now < validFrom) {
      return new Response(
        JSON.stringify({ success: false, error: 'This coupon is not yet valid' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (validUntil && now > validUntil) {
      return new Response(
        JSON.stringify({ success: false, error: 'This coupon has expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      return new Response(
        JSON.stringify({ success: false, error: 'This coupon has reached its usage limit' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return only what the client needs - no internal details
    return new Response(
      JSON.stringify({
        success: true,
        coupon: {
          id: data.id,
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Coupon validation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
