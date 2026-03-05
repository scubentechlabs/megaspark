import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const META_WHATSAPP_ACCESS_TOKEN = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN')?.trim();
const META_WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')?.trim();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let messageId: string | null = null;
  try {
    const { phoneNumber, messageType, registrationId, messageBody, templateName, variables, registrationNumber: passedRegNumber } = await req.json();
    console.log('Sending WhatsApp message:', { phoneNumber, messageType, registrationId });
    // messageId declared above for catch scope

    if (!META_WHATSAPP_ACCESS_TOKEN || !META_WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('Meta WhatsApp API credentials not configured');
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

    // Try direct Meta Graph API first, fallback to OfficialWA
    const directMetaUrl = `https://graph.facebook.com/v19.0/${META_WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const officialWaUrl = `https://crm.officialwa.com/api/meta/v19.0/${META_WHATSAPP_PHONE_NUMBER_ID}/messages`;

    let apiPayload: any;

    if (messageType === 'registration_confirmation' || templateName === 'megamsg_1') {
      // Send registration confirmation with megamsg_1 template using OfficialWA format
      apiPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: {
            policy: "deterministic",
            code: "en"
          },
          name: "megamsg_1",
          components: []
        }
      };
    } else if (messageType === 'hall_ticket' && messageBody) {
      // Get registration number - use passed value or fetch from DB
      let registrationNumber = passedRegNumber || 'Hall-Ticket';
      if (!passedRegNumber && registrationId) {
        const { data: regData } = await supabase
          .from('registrations')
          .select('registration_number')
          .eq('id', registrationId)
          .single();
        
        if (regData?.registration_number) {
          registrationNumber = regData.registration_number;
        }
      }
      
      // Send hall ticket template with document using OfficialWA format
      apiPayload = {
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: {
            policy: "deterministic",
            code: "en"
          },
          name: "mega_hallticket",
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "document",
                  document: {
                    link: messageBody
                  }
                }
              ]
            }
          ]
        }
      };
    } else if (templateName) {
      // Send template message using OfficialWA format
      apiPayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: {
            policy: "deterministic",
            code: "en"
          },
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

    console.log('Sending WhatsApp message, trying direct Meta API first...');
    console.log('Payload:', JSON.stringify(apiPayload));

    let successResponse: any = null;
    let lastError: any = null;

    // Try direct Meta Graph API first
    for (const apiUrl of [directMetaUrl, officialWaUrl]) {
      try {
        console.log('Trying API:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${META_WHATSAPP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(apiPayload),
        });

        const responseData = await response.json().catch(() => ({}));
        console.log('API response:', response.status, JSON.stringify(responseData));

        if (response.ok && responseData?.messages?.[0]?.id) {
          // Direct Meta API returns { messages: [{ id: "wamid.xxx" }] }
          successResponse = responseData;
          console.log('Message sent successfully via:', apiUrl);
          break;
        } else if (response.ok) {
          // OfficialWA returns { message: { queue_id, message_status } }
          successResponse = responseData;
          console.log('Message queued via:', apiUrl);
          break;
        } else {
          lastError = new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
          console.log('Failed with', apiUrl, '- trying next...');
        }
      } catch (e) {
        lastError = e;
        console.log('Error with', apiUrl, ':', e.message, '- trying next...');
      }
    }

    if (!successResponse) {
      throw lastError || new Error('WhatsApp API error: all endpoints failed');
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
