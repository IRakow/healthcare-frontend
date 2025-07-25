import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { invoiceEmailService } from '@/services/invoiceEmailService';

interface SendInvoiceEmailButtonProps {
  employerId: string;
  month: string;
  employerName?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function SendInvoiceEmailButton({
  employerId,
  month,
  employerName,
  onSuccess,
  className = ''
}: SendInvoiceEmailButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    
    try {
      const result = await invoiceEmailService.sendInvoiceEmail(employerId, month);
      alert(`Invoice email sent successfully to ${employerName || result.employer}!`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      alert('Failed to send invoice email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={handleSendEmail}
      disabled={isSending}
      variant="secondary"
      className={className}
    >
      {isSending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </>
      )}
    </Button>
  );
}