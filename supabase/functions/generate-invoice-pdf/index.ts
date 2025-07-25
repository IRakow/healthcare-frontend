import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'https://cdn.skypack.dev/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);

    const { employerId, month } = await req.json();

    // Fetch employer and invoice data
    const { data: employer, error: employerError } = await client
      .from('employers')
      .select('*')
      .eq('id', employerId)
      .single();

    if (employerError) throw employerError;

    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('*')
      .eq('employer_id', employerId)
      .eq('month', month)
      .single();

    if (invoiceError) throw invoiceError;

    // Fetch members count for the invoice
    const { count: memberCount } = await client
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId)
      .eq('active', true);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Load fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Parse color (default to blue if not set)
    const primaryColor = employer.primary_color || '#3b82f6';
    const r = parseInt(primaryColor.slice(1, 3), 16) / 255;
    const g = parseInt(primaryColor.slice(3, 5), 16) / 255;
    const b = parseInt(primaryColor.slice(5, 7), 16) / 255;

    // Add logo if available
    let headerY = height - 50;
    if (employer.logo_url) {
      try {
        // Fetch logo image
        const logoResponse = await fetch(employer.logo_url);
        const logoBytes = await logoResponse.arrayBuffer();
        const logoImage = await pdfDoc.embedPng(new Uint8Array(logoBytes));
        
        // Draw logo (40x10 size)
        const logoDims = logoImage.scale(0.1); // Scale down as needed
        page.drawImage(logoImage, {
          x: 50,
          y: height - 60,
          width: 80,
          height: 20,
        });
        headerY = height - 90; // Adjust header position below logo
      } catch (error) {
        console.error('Error adding logo:', error);
      }
    }

    // Header with custom invoice header
    const headerText = employer.invoice_header || 'INVOICE';
    page.drawText(headerText, {
      x: 50,
      y: headerY,
      size: 24,
      font: helveticaBold,
      color: rgb(r, g, b),
    });

    // Company info
    page.drawText(employer.name, {
      x: 50,
      y: headerY - 40,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    if (employer.custom_invoice_note) {
      page.drawText(employer.custom_invoice_note, {
        x: 50,
        y: height - 110,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Invoice details
    const formatMonth = (monthStr: string) => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    page.drawText(`Invoice Date: ${formatMonth(month)}`, {
      x: 50,
      y: height - 150,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Invoice ID: ${invoice.id.slice(0, 8)}`, {
      x: 50,
      y: height - 170,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Status: ${invoice.status}`, {
      x: 50,
      y: height - 190,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });

    // Line items
    let yPosition = height - 250;
    
    page.drawText('Description', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText('Amount', {
      x: 450,
      y: yPosition,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yPosition -= 30;

    // Add line items based on billing plan
    if (employer.billing_plan === 'per_member' && employer.monthly_fee_per_member) {
      page.drawText(`Active Members (${memberCount || 0} × $${employer.monthly_fee_per_member})`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

      page.drawText(`$${invoice.total_amount.toLocaleString()}`, {
        x: 450,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    } else if (employer.billing_plan === 'flat_rate') {
      page.drawText('Monthly Service Fee', {
        x: 50,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

      page.drawText(`$${invoice.total_amount.toLocaleString()}`, {
        x: 450,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }

    // Total
    yPosition -= 40;
    page.drawLine({
      start: { x: 400, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: rgb(0, 0, 0),
    });

    yPosition -= 25;
    page.drawText('Total:', {
      x: 380,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    page.drawText(`$${invoice.total_amount.toLocaleString()}`, {
      x: 450,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(r, g, b),
    });

    // Footer with custom invoice footer
    const footerText = employer.invoice_footer || 'Thank you for your business!';
    const footerLines = footerText.split('\n');
    let footerY = 100;
    
    footerLines.forEach((line: string) => {
      page.drawText(line, {
        x: 50,
        y: footerY,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      footerY -= 15;
    });

    if (employer.subdomain && footerY > 50) {
      page.drawText(`${employer.subdomain}.insperityhealth.com`, {
        x: 50,
        y: footerY - 10,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Upload to Supabase Storage
    const fileName = `${employer.id}/${month}.pdf`;
    const { error: uploadError } = await client.storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrl } = client.storage
      .from('invoices')
      .getPublicUrl(fileName);

    // Update invoice with PDF URL
    const { error: updateError } = await client
      .from('invoices')
      .update({ pdf_url: publicUrl.publicUrl })
      .eq('id', invoice.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        pdf_url: publicUrl.publicUrl,
        invoice_id: invoice.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});