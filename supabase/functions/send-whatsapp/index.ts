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

  try {
    const { phoneNumber, messageType, registrationId, messageBody, templateName, variables } = await req.json();

    console.log('Sending WhatsApp message:', { phoneNumber, messageType, registrationId });

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

    console.log('Message record created:', messageRecord.id);

    // Prepare API request based on message type
    let apiUrl = 'https://crm.officialwa.com/api/v1/whatsapp/message/send';
    let apiPayload = {};

    if (messageType === 'hall_ticket' && messageBody) {
      // Send hall ticket template with document
      apiPayload = {
        to: formattedPhone,
        recipient_type: "individual",
        type: "template",
        template: {
          language: {
            policy: "deterministic",
            code: "en"
          },
          name: "hall_ticket_mega",
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "document",
                  document: {
                    link: messageBody // messageBody contains the hall ticket URL
                  }
                }
              ]
            }
          ]
        }
      };
    } else if (templateName) {
      // Send template message
      apiPayload = {
        instance_id: OFFICIALWA_INSTANCE_ID,
        phone: formattedPhone,
        template_name: templateName,
        variables: variables || [],
      };
    } else {
      // Send text message
      apiPayload = {
        instance_id: OFFICIALWA_INSTANCE_ID,
        phone: formattedPhone,
        message: messageBody,
      };
    }

    console.log('Sending to OfficialWA API:', apiUrl, apiPayload);

    // Send WhatsApp message via OfficialWA API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OFFICIALWA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const responseData = await response.json();
    console.log('OfficialWA API response:', responseData);

    if (!response.ok) {
      throw new Error(`OfficialWA API error: ${JSON.stringify(responseData)}`);
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
        apiResponse: responseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-whatsapp function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
