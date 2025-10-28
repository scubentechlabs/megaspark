import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();
    console.log('Generating hall ticket for registration:', registrationId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch registration details
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      throw new Error('Registration not found');
    }

    // Format exam date
    const formatExamDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-IN', options);
    };

    // Generate HTML for hall ticket
    const hallTicketHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      background: white;
      padding: 20px;
    }
    .hall-ticket {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #1a365d;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header h2 {
      color: #2d3748;
      font-size: 20px;
      margin-bottom: 5px;
    }
    .content {
      padding: 20px 0;
    }
    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-label {
      font-weight: bold;
      width: 250px;
      color: #2d3748;
    }
    .info-value {
      flex: 1;
      color: #000;
    }
    .registration-number {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #1a365d;
      padding: 20px;
      background: #f7fafc;
      border: 2px dashed #4299e1;
      margin: 20px 0;
    }
    .instructions {
      margin-top: 30px;
      padding: 15px;
      background: #fff5f5;
      border-left: 4px solid #f56565;
    }
    .instructions h3 {
      color: #c53030;
      margin-bottom: 10px;
    }
    .instructions ul {
      margin-left: 20px;
    }
    .instructions li {
      margin: 5px 0;
      color: #2d3748;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 15px;
      border-top: 2px solid #000;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="hall-ticket">
    <div class="header">
      <h1>P.P. SAVANI CFE</h1>
      <h2>MEGA SPARK EXAM 2025</h2>
      <p style="margin-top: 10px; color: #4a5568;">Hall Ticket</p>
    </div>

    <div class="registration-number">
      Registration Number: ${registration.registration_number || 'Pending'}
    </div>

    <div class="content">
      <div class="info-row">
        <div class="info-label">Student Name:</div>
        <div class="info-value">${registration.student_name}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Date of Birth:</div>
        <div class="info-value">${formatExamDate(registration.date_of_birth)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Gender:</div>
        <div class="info-value">${registration.gender || 'N/A'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Standard:</div>
        <div class="info-value">${registration.standard}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Medium:</div>
        <div class="info-value">${registration.medium}</div>
      </div>
      <div class="info-row">
        <div class="info-label">School Name:</div>
        <div class="info-value">${registration.school_name || 'N/A'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Exam Date:</div>
        <div class="info-value">${formatExamDate(registration.exam_date)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Exam Center:</div>
        <div class="info-value">${registration.exam_center}</div>
      </div>
      ${registration.building_name ? `
      <div class="info-row">
        <div class="info-label">Building:</div>
        <div class="info-value">${registration.building_name}</div>
      </div>
      ` : ''}
      ${registration.floor ? `
      <div class="info-row">
        <div class="info-label">Floor:</div>
        <div class="info-value">${registration.floor}</div>
      </div>
      ` : ''}
      ${registration.room_no ? `
      <div class="info-row">
        <div class="info-label">Room Number:</div>
        <div class="info-value">${registration.room_no}</div>
      </div>
      ` : ''}
      <div class="info-row">
        <div class="info-label">Mobile Number:</div>
        <div class="info-value">${registration.mobile_number}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Email:</div>
        <div class="info-value">${registration.email || 'N/A'}</div>
      </div>
    </div>

    <div class="instructions">
      <h3>Important Instructions:</h3>
      <ul>
        <li>Please bring this hall ticket on the day of examination</li>
        <li>Arrive at the exam center 30 minutes before the exam time</li>
        <li>Bring a valid ID proof along with this hall ticket</li>
        <li>Mobile phones and electronic devices are not allowed in the exam hall</li>
        <li>Follow all instructions given by the exam invigilators</li>
      </ul>
    </div>

    <div class="footer">
      <p>Best wishes for your examination!</p>
      <p style="margin-top: 5px;">For queries: +91 9104158001</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log('Converting HTML to PDF using API...');

    // Use HTML2PDF API service
    const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: hallTicketHTML,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      }),
    });

    if (!pdfResponse.ok) {
      throw new Error(`PDF generation failed: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF generated, uploading to storage...');

    // Upload PDF to Supabase Storage
    const fileName = `hall-ticket-${registration.registration_number || registrationId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hall-tickets')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('hall-tickets')
      .getPublicUrl(fileName);

    console.log('PDF uploaded, URL:', publicUrl);

    // Update registration with hall ticket URL
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ hall_ticket_url: publicUrl })
      .eq('id', registrationId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Send WhatsApp message with hall ticket
    console.log('Sending WhatsApp message...');
    const whatsappPhone = registration.whatsapp_number || registration.mobile_number;
    
    const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        phoneNumber: whatsappPhone,
        messageType: 'hall_ticket',
        registrationId: registrationId,
        messageBody: publicUrl,
      },
    });

    if (whatsappError) {
      console.error('WhatsApp error:', whatsappError);
      // Don't throw - hall ticket was generated successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        hallTicketUrl: publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating hall ticket:', error);
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
