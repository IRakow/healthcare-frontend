import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { invoicePdfService } from '@/services/invoicePdfService';
import { Toast } from '@/components/ui/Toast';

interface GenerateInvoicePdfButtonProps {
  employerId: string;
  month: string;
  onSuccess?: (pdfUrl: string) => void;
  className?: string;
}

export default function GenerateInvoicePdfButton({
  employerId,
  month,
  onSuccess,
  className = ''
}: GenerateInvoicePdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [show, setShow] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    
    try {
      const pdfUrl = await invoicePdfService.generateInvoicePdf(employerId, month);
      
      if (onSuccess) {
        onSuccess(pdfUrl);
      } else {
        // Open PDF in new tab
        window.open(pdfUrl, '_blank');
      }
      
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleGeneratePdf}
        disabled={isGenerating}
        variant="secondary"
        className={className}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generate PDF
          </>
        )}
      </Button>
      {show && <Toast message="PDF successfully generated!" />}
    </>
  );
}