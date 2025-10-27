import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICIALWA_API_KEY = Deno.env.get('OFFICIALWA_API_KEY');
const OFFICIALWA_INSTANCE_ID = Deno.env.get('OFFICIALWA_INSTANCE_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let messageId: string | null = null;
  try {
    const { phoneNumber, messageType, registrationId, messageBody, templateName, variables } = await req.json();

    console.log('Sending WhatsApp message:', { phoneNumber, messageType, registrationId });
    // messageId declared above for catch scope

    if (!OFFICIALWA_API_KEY || !OFFICIALWA_INSTANCE_ID) {
      throw new Error('OfficialWA API credentials not configured');
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Ensure phone has country code
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create WhatsApp message record
    const { data: messageRecord, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        phone_number: formattedPhone,
        message_type: messageType,
        status: 'pending',
        registration_id: registrationId || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating message record:', insertError);
      throw insertError;
    }

    messageId = messageRecord.id;
    console.log('Message record created:', messageRecord.id);

    // Prepare API request and fallback paths
    const tryPaths = [
      'https://crm.officialwa.com/whatsapp/message/send',
      'https://crm.officialwa.com/v1/whatsapp/message/send',
      'https://crm.officialwa.com/api/whatsapp/message/send',
      'https://crm.officialwa.com/api/v1/whatsapp/message/send',
    ];

    let apiPayload: any;

    if (messageType === 'hall_ticket' && messageBody) {
      // Send hall ticket template with document (add instance_id to be safe)
      apiPayload = {
        instance_id: OFFICIALWA_INSTANCE_ID,
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: { policy: "deterministic", code: "en" },
          name: "hall_ticket_mega",
          components: [
            {
              type: "header",
              parameters: [
                { type: "document", document: { link: messageBody } }
              ]
            }
          ]
        }
      };
    } else if (templateName) {
      // Send template message using OfficialWA template format
      apiPayload = {
        instance_id: OFFICIALWA_INSTANCE_ID,
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: { policy: "deterministic", code: "en" },
          name: templateName,
          components: Array.isArray(variables) && variables.length > 0
            ? [
                {
                  type: "body",
                  parameters: variables.map((v: any) =>
                    typeof v === "object" && v?.type ? v : { type: "text", text: String(v) }
                  ),
                },
              ]
            : [],
        },
      };


    }

    console.log('Attempting OfficialWA API paths with fallback...', { tryPaths });

    let successResponse: any = null;
    let lastError: any = null;

    for (const apiUrl of tryPaths) {
      try {
        console.log('Trying OfficialWA path:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OFFICIALWA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        });

        const responseData = await response.json().catch(() => ({}));
        console.log('OfficialWA API response:', apiUrl, response.status, responseData);

        if (response.ok && !(typeof responseData?.error === 'string' && responseData.error.length)) {
          successResponse = responseData;
          break;
        }

        // Prepare next attempt if path invalid
        lastError = new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
        if (typeof responseData?.error === 'string' && responseData.error.toLowerCase().includes('invalid path')) {
          continue; // try next path
        } else {
          break; // other errors: don't spin across paths unnecessarily
        }
      } catch (e) {
        lastError = e;
      }
    }

    if (!successResponse) {
      throw lastError || new Error('OfficialWA API error: all paths failed');
    }

    // Update message status to sent
    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', messageRecord.id);

    if (updateError) {
      console.error('Error updating message status:', updateError);
    }

    console.log('WhatsApp message sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageRecord.id,
        apiResponse: successResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-whatsapp function:', error);

    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      if (messageId) {
        const { error: failUpdateError } = await supabase
          .from('whatsapp_messages')
          .update({
            status: 'failed',
            error_message: String(error?.message || error),
            failed_at: new Date().toISOString(),
          })
          .eq('id', messageId);
        if (failUpdateError) {
          console.error('Error updating failed message status:', failUpdateError);
        }
      }
    } catch (e) {
      console.error('Error while marking message as failed:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
