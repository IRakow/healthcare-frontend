// This would typically be handled by a backend server or edge function
// For client-side, we'll create a utility that redirects to the edge function

export function getInvoicePdfUrl(invoiceId: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Construct the edge function URL with invoice ID as a parameter
  return `${supabaseUrl}/functions/v1/invoice-pdf/${invoiceId}?apikey=${anonKey}`;
}