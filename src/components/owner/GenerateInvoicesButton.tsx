import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentInvoiceMonth } from '@/types/invoice';

export default function GenerateInvoicesButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const currentMonth = getCurrentInvoiceMonth();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/generate-monthly-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ month: currentMonth })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate invoices: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Show success message
      alert(`Successfully generated ${data.results.processed} invoices for ${data.results.month}`);
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Failed to generate invoices. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleGenerateInvoices}
        disabled={isGenerating}
        variant="primary"
      >
        {isGenerating ? 'Generating...' : 'Generate Monthly Invoices'}
      </Button>
      
      {result && (
        <span className="text-sm text-gray-600">
          Generated: {result.results.processed}, Skipped: {result.results.skipped}
        </span>
      )}
    </div>
  );
}