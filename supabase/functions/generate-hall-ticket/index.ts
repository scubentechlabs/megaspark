import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

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
      if (!dateStr) return 'TBA';
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-IN', options);
    };

    console.log('Creating PDF document...');

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Header
    page.drawText('P.P. SAVANI CFE', {
      x: 50,
      y: yPosition,
      size: 24,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });
    
    yPosition -= 30;
    page.drawText('MEGA SPARK EXAM 2025', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBold,
      color: rgb(0.2, 0.3, 0.5),
    });
    
    yPosition -= 25;
    page.drawText('Hall Ticket', {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Draw header line
    yPosition -= 15;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    // Registration Number Box
    yPosition -= 40;
    page.drawRectangle({
      x: 50,
      y: yPosition - 30,
      width: width - 100,
      height: 40,
      borderColor: rgb(0.26, 0.6, 0.88),
      borderWidth: 2,
      color: rgb(0.97, 0.98, 0.99),
    });
    
    page.drawText(`Registration Number: ${registration.registration_number || 'Pending'}`, {
      x: 60,
      y: yPosition - 15,
      size: 16,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    yPosition -= 60;

    // Student Information
    const drawInfoRow = (label: string, value: string, y: number) => {
      page.drawText(label + ':', {
        x: 50,
        y,
        size: 11,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      page.drawText(value, {
        x: 220,
        y,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Draw separator line
      page.drawLine({
        start: { x: 50, y: y - 5 },
        end: { x: width - 50, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    };

    drawInfoRow('Student Name', registration.student_name, yPosition);
    yPosition -= 25;
    
    drawInfoRow('Standard', registration.standard, yPosition);
    yPosition -= 25;
    
    drawInfoRow('Medium', registration.medium, yPosition);
    yPosition -= 25;
    
    drawInfoRow('School Name', registration.school_name || 'N/A', yPosition);
    yPosition -= 25;
    
    drawInfoRow('Exam Date', formatExamDate(registration.exam_date), yPosition);
    yPosition -= 25;
    
    drawInfoRow('Exam Center', 'PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150', yPosition);
    yPosition -= 25;
    
    if (registration.building_name) {
      drawInfoRow('Building', registration.building_name, yPosition);
      yPosition -= 25;
    }
    
    if (registration.floor) {
      drawInfoRow('Floor', registration.floor, yPosition);
      yPosition -= 25;
    }
    
    if (registration.room_no) {
      drawInfoRow('Room Number', registration.room_no, yPosition);
      yPosition -= 25;
    }
    
    drawInfoRow('Mobile Number', registration.mobile_number, yPosition);
    yPosition -= 40;

    // Important Instructions Box
    page.drawRectangle({
      x: 50,
      y: yPosition - 110,
      width: width - 100,
      height: 120,
      borderColor: rgb(0.96, 0.34, 0.40),
      borderWidth: 2,
      color: rgb(1, 0.96, 0.96),
    });

    page.drawText('Important Instructions:', {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0.77, 0.19, 0.19),
    });

    yPosition -= 20;
    const instructions = [
      '• Please bring this hall ticket on the day of examination',
      '• Arrive at the exam center 30 minutes before the exam time',
      '• Bring a valid ID proof along with this hall ticket',
      '• Mobile phones and electronic devices are not allowed',
      '• Follow all instructions given by the exam invigilators',
    ];

    instructions.forEach(instruction => {
      page.drawText(instruction, {
        x: 60,
        y: yPosition,
        size: 9,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 15;
    });

    // Footer
    yPosition = 80;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawText('Best wishes for your examination!', {
      x: (width - 200) / 2,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 15;
    page.drawText('For queries: +91 9104158001', {
      x: (width - 180) / 2,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    console.log('PDF created, uploading to storage...');

    // Upload PDF to Supabase Storage
    const fileName = `hall-ticket-${registration.registration_number || registrationId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hall-tickets')
      .upload(fileName, pdfBytes, {
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
