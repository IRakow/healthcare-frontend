import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface InvoiceGenerationResult {
  invoices: {
    created: number;
    skipped: number;
    errors: any[];
  };
  pdfs: {
    generated: number;
    failed: number;
    errors: any[];
  };
}

export default function MonthlyInvoiceGeneratorButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<InvoiceGenerationResult | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/generate-invoices-and-pdfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          month: new Date().toISOString().slice(0, 7) // Current month
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.results);
      
      // Show summary
      alert(`Invoice Generation Complete!\n\nInvoices Created: ${data.results.invoices.created}\nPDFs Generated: ${data.results.pdfs.generated}`);
      
    } catch (error) {
      console.error('Error generating invoices and PDFs:', error);
      alert('Failed to generate invoices and PDFs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="primary"
        className="w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Invoices & PDFs...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Run Monthly Invoice + PDF Generation
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Generation Results:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Invoices</p>
              <p>Created: {result.invoices.created}</p>
              <p>Skipped: {result.invoices.skipped}</p>
              {result.invoices.errors.length > 0 && (
                <p className="text-red-600">Errors: {result.invoices.errors.length}</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">PDFs</p>
              <p>Generated: {result.pdfs.generated}</p>
              <p>Failed: {result.pdfs.failed}</p>
              {result.pdfs.errors.length > 0 && (
                <p className="text-red-600">Errors: {result.pdfs.errors.length}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}