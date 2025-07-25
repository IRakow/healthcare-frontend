import { useState } from 'react';
import { twilioService } from '@/services/twilioService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, MessageSquare, CheckCircle } from 'lucide-react';

interface NotificationSenderProps {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  employerId?: string;
}

export default function NotificationSender({
  patientId,
  patientName,
  patientPhone,
  employerId
}: NotificationSenderProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendAppointmentReminder() {
    if (!patientPhone) {
      alert('No phone number available for this patient');
      return;
    }

    setSending(true);
    try {
      // This will automatically use the employer's notification_sender_name
      await twilioService.sendSMS({
        to: patientPhone,
        message: `Hi ${patientName}, this is a reminder about your upcoming appointment tomorrow at 2:00 PM. Please arrive 15 minutes early.`,
        employerId,
        patientId
      });
      
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setSending(false);
    }
  }

  async function sendTestResults() {
    if (!patientPhone) {
      alert('No phone number available for this patient');
      return;
    }

    setSending(true);
    try {
      await twilioService.sendTestResultNotification(patientId, 'blood work');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Send Notifications
      </h3>
      
      <div className="space-y-2">
        <Button
          onClick={sendAppointmentReminder}
          disabled={sending || !patientPhone}
          className="w-full"
          variant="secondary"
        >
          {sending ? (
            'Sending...'
          ) : sent ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sent!
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Appointment Reminder
            </>
          )}
        </Button>

        <Button
          onClick={sendTestResults}
          disabled={sending || !patientPhone}
          className="w-full"
          variant="secondary"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Test Results Notification
        </Button>
      </div>

      {!patientPhone && (
        <p className="text-xs text-gray-500 mt-2">
          No phone number on file for this patient
        </p>
      )}
    </Card>
  );
}