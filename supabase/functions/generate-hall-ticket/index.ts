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
    let yPosition = height - 30;

    // Header - P.P. SAVANI GROUP
    page.drawText('P.P. SAVANI GROUP', {
      x: (width - 140) / 2,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 25;
    // MEGA SPARK EXAM 2025 - Blue
    page.drawText('MEGA SPARK EXAM 2025', {
      x: (width - 280) / 2,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: rgb(0.2, 0.4, 0.9),
    });
    
    yPosition -= 20;
    page.drawText('EXAMINATION HALL TICKET', {
      x: (width - 180) / 2,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    // Student Information Table
    const drawTableRow = (label: string, value: string, y: number, isHeader: boolean = false) => {
      // Left column (label)
      page.drawRectangle({
        x: 50,
        y: y - 15,
        width: 180,
        height: 20,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: isHeader ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
      });
      
      page.drawText(label, {
        x: 55,
        y: y - 10,
        size: 9,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      // Right column (value)
      page.drawRectangle({
        x: 230,
        y: y - 15,
        width: 315,
        height: 20,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(1, 1, 1),
      });
      
      page.drawText(value, {
        x: 235,
        y: y - 10,
        size: 9,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    };

    drawTableRow('Student Name :', registration.student_name, yPosition);
    yPosition -= 20;
    
    drawTableRow('Seat No :', registration.registration_number || 'Pending', yPosition);
    yPosition -= 20;
    
    drawTableRow('Std :', registration.standard, yPosition);
    yPosition -= 20;
    
    drawTableRow('Medium :', registration.medium, yPosition);
    yPosition -= 20;
    
    drawTableRow('Exam Date :', formatExamDate(registration.exam_date), yPosition);
    yPosition -= 20;
    
    // Exam Pattern with subjects
    const examPattern = registration.exam_pattern || 'MCQ (Multiple Choice Questions)';
    const subjects = registration.standard === '8th' 
      ? 'Science (ગણિત), Maths (વિજ્ઞાન), English (અંગ્રેજી)'
      : 'Science, Maths, English';
    
    page.drawRectangle({
      x: 50,
      y: yPosition - 15,
      width: 180,
      height: 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Exam Pattern :', {
      x: 55,
      y: yPosition - 10,
      size: 9,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawRectangle({
      x: 230,
      y: yPosition - 15,
      width: 315,
      height: 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    
    page.drawText(examPattern, {
      x: 235,
      y: yPosition - 10,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Subjects / ધોરણ:', {
      x: 235,
      y: yPosition - 25,
      size: 8,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(subjects, {
      x: 235,
      y: yPosition - 38,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 50;

    // Exam Centre Section
    page.drawText('Exam Centre', {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
    const examCenterDetails = `P P Savani Chaitanya Vidya Sankul
Opposite Abhrama Road, Abrama, Kamrej,
Surat-394150 (Gujarat) India`;
    
    const centerLines = examCenterDetails.split('\n');
    centerLines.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 9,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 12;
    });

    yPosition -= 10;

    // Notes Section in Gujarati
    page.drawText('નોંધ (Notes):', {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 15;
    page.drawText('1. પરીક્ષાના દિવસે આ હોલ ટિકિટ અને ફોટો આઈ.ડી લાવવી ફરજીયાત છે.', {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 12;
    page.drawText('2. વધુ વિગતોના માટે સંપર્ક કરો: +91 9104158001 તથા વ્હોટ્સએપ.', {
      x: 50,
      y: yPosition,
      size: 8,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 180;

    // Footer
    page.drawText('MEGA SPARK EXAM COMMITTEE', {
      x: (width - 180) / 2,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
    page.drawText('Best Wishes for Your Examination / તમારી પરીક્ષા માટે શુભેચ્છાઓ', {
      x: (width - 360) / 2,
      y: yPosition,
      size: 9,
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
