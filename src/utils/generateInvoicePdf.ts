import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';

interface InvoiceData {
  id: string;
  employer_id: string;
  month: string;
  total_amount: number;
  patient_count: number;
  appointment_charges: any[];
  created_at: string;
  status: string;
}

export async function generateInvoicePdf(invoice: InvoiceData) {
  // Fetch employer branding
  const { data: employer } = await supabase
    .from('employers')
    .select('*')
    .eq('id', invoice.employer_id)
    .single();

  const doc = new jsPDF();
  
  // Apply branding colors
  const primaryColor = employer?.primary_color || '#3B82F6';
  const [r, g, b] = hexToRgb(primaryColor);
  
  // Add logo if available
  let yOffset = 20;
  if (employer?.logo_url) {
    try {
      // Add logo (40x10 size at top left)
      doc.addImage(employer.logo_url, 'PNG', 10, 10, 40, 10);
      yOffset = 30; // Adjust text position below logo
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Header with branding
  doc.setFontSize(16);
  doc.setTextColor(r, g, b);
  doc.text(employer?.invoice_header || 'Insperity Health Invoice', 10, yOffset);
  
  // Reset to black for invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  // Invoice info
  doc.text(`Invoice #: ${invoice.id.slice(0, 8)}`, 10, yOffset + 15);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 10, yOffset + 22);
  doc.text(`Month: ${formatMonth(invoice.month)}`, 10, yOffset + 29);
  
  // Company info
  doc.setFontSize(14);
  doc.text(employer?.name || 'Unknown Company', 120, yOffset + 15);
  doc.setFontSize(10);
  doc.text(employer?.tagline || '', 120, yOffset + 22);
  
  // Draw separator line with brand color
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(10, yOffset + 35, 200, yOffset + 35);
  
  // Invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  let yPos = yOffset + 50;
  
  doc.text('Service Details:', 10, yPos);
  yPos += 10;
  
  // Summary
  doc.setFontSize(10);
  doc.text(`Total Patients: ${invoice.patient_count}`, 20, yPos);
  yPos += 7;
  doc.text(`Total Appointments: ${invoice.appointment_charges?.length || 0}`, 20, yPos);
  yPos += 15;
  
  // Charges table header
  doc.setFillColor(r, g, b);
  doc.setTextColor(255, 255, 255);
  doc.rect(10, yPos, 190, 8, 'F');
  doc.text('Patient Name', 15, yPos + 6);
  doc.text('Service', 80, yPos + 6);
  doc.text('Date', 130, yPos + 6);
  doc.text('Amount', 170, yPos + 6);
  yPos += 12;
  
  // Charges rows
  doc.setTextColor(0, 0, 0);
  let subtotal = 0;
  
  if (invoice.appointment_charges && invoice.appointment_charges.length > 0) {
    invoice.appointment_charges.forEach((charge: any, index: number) => {
      if (yPos > 250) {
        // Add new page if needed
        doc.addPage();
        yPos = 20;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, yPos - 4, 190, 7, 'F');
      }
      
      doc.text(charge.patient_name || 'Unknown', 15, yPos);
      doc.text(charge.service_type || 'Consultation', 80, yPos);
      doc.text(new Date(charge.date).toLocaleDateString(), 130, yPos);
      doc.text(`$${charge.amount.toFixed(2)}`, 170, yPos);
      
      subtotal += charge.amount;
      yPos += 8;
    });
  }
  
  // Total section
  yPos += 10;
  doc.setDrawColor(r, g, b);
  doc.line(130, yPos, 200, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Total:', 130, yPos);
  doc.text(`$${invoice.total_amount.toFixed(2)}`, 170, yPos);
  
  // Footer
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  
  const footerText = employer?.invoice_footer || 
    'Thank you for choosing Insperity Health. For questions, contact billing@insperityhealth.com';
  
  // Word wrap footer text
  const footerLines = doc.splitTextToSize(footerText, 180);
  footerLines.forEach((line: string, index: number) => {
    doc.text(line, 10, 270 + (index * 5));
  });
  
  // Save the PDF
  doc.save(`invoice-${employer?.name || 'company'}-${invoice.month}.pdf`);
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [59, 130, 246]; // Default blue if parsing fails
}

// Helper function to format month
function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
}