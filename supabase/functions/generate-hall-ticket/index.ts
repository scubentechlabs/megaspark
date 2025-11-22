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

    // Format time slot
    const formatTimeSlot = (slot: string | null) => {
      if (!slot) return 'TBA';
      if (slot.toLowerCase() === 'morning') return 'Morning Slot';
      if (slot.toLowerCase() === 'afternoon') return 'Afternoon Slot';
      return slot;
    };
    
    const getReportingTime = (slot: string | null) => {
      if (!slot) return 'TBA';
      if (slot.toLowerCase() === 'morning') return '8:00 AM';
      if (slot.toLowerCase() === 'afternoon') return '2:30 PM';
      return 'TBA';
    };

    console.log('Creating PDF document...');

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let yPosition = height - 40;

    // Header - Center aligned (optimized for single page)
    const headerText1 = 'P.P. SAVANI GROUP';
    const headerText2 = 'MEGA SPARK EXAM 2025';
    const headerText3 = 'EXAMINATION HALL TICKET';
    
    page.drawText(headerText1, {
      x: (width - helveticaBold.widthOfTextAtSize(headerText1, 20)) / 2,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });
    
    yPosition -= 24;
    page.drawText(headerText2, {
      x: (width - helveticaBold.widthOfTextAtSize(headerText2, 16)) / 2,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0.2, 0.3, 0.5),
    });
    
    yPosition -= 20;
    page.drawText(headerText3, {
      x: (width - helveticaBold.widthOfTextAtSize(headerText3, 12)) / 2,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Draw header line
    yPosition -= 12;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    // Registration Number Box (compact)
    yPosition -= 30;
    page.drawRectangle({
      x: 50,
      y: yPosition - 24,
      width: width - 100,
      height: 32,
      borderColor: rgb(0.26, 0.6, 0.88),
      borderWidth: 2,
      color: rgb(0.97, 0.98, 0.99),
    });
    
    page.drawText(`Registration Number: ${registration.registration_number || 'Pending'}`, {
      x: 60,
      y: yPosition - 12,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    yPosition -= 45;

    // Student Information (compact spacing)
    const drawInfoRow = (label: string, value: string, y: number) => {
      page.drawText(label + ':', {
        x: 50,
        y,
        size: 10,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      page.drawText(value, {
        x: 220,
        y,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Draw separator line
      page.drawLine({
        start: { x: 50, y: y - 4 },
        end: { x: width - 50, y: y - 4 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
    };

    drawInfoRow('Student Name', registration.student_name, yPosition);
    yPosition -= 20;
    
    drawInfoRow('Standard', registration.standard, yPosition);
    yPosition -= 20;
    
    const formatMedium = (medium: string | null): string => {
      if (!medium) return 'N/A';
      const mediumLower = medium.toLowerCase();
      if (mediumLower === 'gujarati') return 'Gujarati';
      if (mediumLower === 'english') return 'English Medium';
      return medium;
    };
    
    drawInfoRow('Medium', formatMedium(registration.medium), yPosition);
    yPosition -= 20;
    
    drawInfoRow('Time Slot', formatTimeSlot(registration.time_slot), yPosition);
    yPosition -= 20;
    
    // Format exam date
    const formatExamDate = (dateStr: string | null) => {
      if (!dateStr) return 'TBA';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    drawInfoRow('Exam Date', formatExamDate(registration.exam_date), yPosition);
    yPosition -= 20;
    
    const reportingDateTime = registration.exam_date 
      ? `${formatExamDate(registration.exam_date)} at ${getReportingTime(registration.time_slot)}`
      : getReportingTime(registration.time_slot);
    
    drawInfoRow('Reporting Date & Time', reportingDateTime, yPosition);
    yPosition -= 20;
    
    drawInfoRow('Exam Center', 'PP Savani Cfe, Abrama Rd, Mota Varachha, Surat, Gujarat 394150', yPosition);
    yPosition -= 20;
    
    drawInfoRow('Registration No', registration.registration_number || 'Pending', yPosition);
    yPosition -= 20;
    
    if (registration.building_name) {
      drawInfoRow('Building', registration.building_name, yPosition);
      yPosition -= 20;
    }
    
    if (registration.floor) {
      drawInfoRow('Floor', registration.floor, yPosition);
      yPosition -= 20;
    }
    
    if (registration.room_no) {
      drawInfoRow('Room Number', registration.room_no, yPosition);
      yPosition -= 20;
    }
    
    yPosition -= 10;

    // Exam Pattern Box (compact)
    page.drawRectangle({
      x: 50,
      y: yPosition - 55,
      width: width - 100,
      height: 60,
      borderColor: rgb(0.26, 0.6, 0.88),
      borderWidth: 2,
      color: rgb(0.97, 0.98, 0.99),
    });

    page.drawText('Exam Pattern:', {
      x: 60,
      y: yPosition - 16,
      size: 10,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    page.drawText('MCQ (Multiple Choice Questions)', {
      x: 160,
      y: yPosition - 16,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Subjects:', {
      x: 60,
      y: yPosition - 36,
      size: 10,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    page.drawText('Science, Maths, English', {
      x: 160,
      y: yPosition - 36,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 68;

    // Notes Section (compact)
    page.drawRectangle({
      x: 50,
      y: yPosition - 48,
      width: width - 100,
      height: 54,
      borderColor: rgb(0.96, 0.34, 0.40),
      borderWidth: 2,
      color: rgb(1, 0.96, 0.96),
    });

    page.drawText('Notes:', {
      x: 60,
      y: yPosition - 16,
      size: 10,
      font: helveticaBold,
      color: rgb(0.77, 0.19, 0.19),
    });

    page.drawText('• The reporting time for the exam will be 8:00 a.m.', {
      x: 60,
      y: yPosition - 32,
      size: 9,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText('• Every student must carry a printed copy of this hall ticket.', {
      x: 60,
      y: yPosition - 44,
      size: 9,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 65;

    // Fetch and embed poster image with safe scaling and fallbacks
    try {
      const tryDownload = async (path: string) => {
        const res = await supabase.storage.from('hall-tickets').download(path);
        return res.data || null;
      };

      let posterBlob = await tryDownload('poster.jpg');
      if (!posterBlob) {
        posterBlob = await tryDownload('hall-ticket-poster.jpg');
      }

      if (posterBlob) {
        const posterBytes = await posterBlob.arrayBuffer();
        const posterImage = await pdfDoc.embedJpg(posterBytes);

        // Fit within page margins (compact for single page)
        const maxWidth = width - 100;
        const maxHeight = 120; // Reduced from 180
        const scaleX = maxWidth / posterImage.width;
        const scaleY = maxHeight / posterImage.height;
        const scale = Math.min(scaleX, scaleY, 1);

        const drawWidth = posterImage.width * scale;
        const drawHeight = posterImage.height * scale;

        // Ensure there is room above the footer (minimum 70 for footer section)
        const minY = 75;
        const targetY = Math.max(minY, yPosition - drawHeight);

        page.drawImage(posterImage, {
          x: (width - drawWidth) / 2,
          y: targetY,
          width: drawWidth,
          height: drawHeight,
        });

        yPosition = targetY - 8;
        console.log('Poster embedded after Notes section:', { drawWidth, drawHeight, targetY });
      } else {
        console.log('Poster image not found in storage (poster.jpg or hall-ticket-poster.jpg)');
      }
    } catch (error) {
      console.log('Could not load poster image:', error);
    }

    // Footer (fixed at bottom)
    yPosition = 60;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1.5,
      color: rgb(0, 0, 0),
    });

    yPosition -= 16;
    const footerText1 = 'MEGA SPARK EXAM COMMITTEE';
    page.drawText(footerText1, {
      x: (width - helveticaBold.widthOfTextAtSize(footerText1, 10)) / 2,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 13;
    const footerText2 = 'Best Wishes for Your Examination!';
    page.drawText(footerText2, {
      x: (width - helveticaFont.widthOfTextAtSize(footerText2, 9)) / 2,
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
