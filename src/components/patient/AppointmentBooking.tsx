import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Building2, AlertCircle } from 'lucide-react';
import { APPOINTMENT_TYPES, APPOINTMENT_TIMES, APPOINTMENT_REASONS } from '@/types/appointment';

interface AppointmentBookingProps {
  onSuccess?: () => void;
  providerId?: string;
}

export function AppointmentBooking({ onSuccess, providerId }: AppointmentBookingProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'telemed' | 'in-person'>('telemed');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const finalReason = reason === 'Other' ? customReason : reason;
      if (!finalReason) {
        setError('Please provide a reason for your appointment');
        setBooking(false);
        return;
      }

      // In a real app, you'd have a provider selection process
      // For now, using a default provider ID or the one passed as prop
      const appointmentProviderId = providerId || 'default-provider-id';

      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          provider_id: appointmentProviderId,
          date,
          time,
          type,
          reason: finalReason,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'appointment',
        label: `Booked ${type} appointment for ${date}`,
        data: {
          date,
          time,
          type,
          reason: finalReason
        }
      });

      // Reset form
      setDate('');
      setTime('');
      setType('telemed');
      setReason('');
      setCustomReason('');

      if (onSuccess) onSuccess();
      alert('Appointment booked successfully! You will receive a confirmation soon.');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Book New Appointment</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Appointment Type</label>
          <div className="grid grid-cols-2 gap-3">
            {APPOINTMENT_TYPES.map((apptType) => (
              <button
                key={apptType.value}
                type="button"
                onClick={() => setType(apptType.value)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  type === apptType.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {apptType.value === 'telemed' ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                  <span className="font-medium">{apptType.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            required
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Select Time
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full border rounded-md p-2"
          >
            <option value="">Choose a time</option>
            {APPOINTMENT_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-sm font-medium mb-2">Reason for Visit</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full border rounded-md p-2"
          >
            <option value="">Select a reason</option>
            {APPOINTMENT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Custom Reason (if "Other" is selected) */}
        {reason === 'Other' && (
          <div>
            <label className="block text-sm font-medium mb-2">Please specify</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              required
              className="w-full border rounded-md p-2"
              rows={2}
              placeholder="Describe your reason for visit..."
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={booking || !date || !time || !reason}
          className="w-full"
        >
          {booking ? 'Booking...' : 'Book Appointment'}
        </Button>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center">
          You will receive a confirmation email once your appointment is confirmed by the provider.
        </p>
      </form>
      </div>
    </Card>
  );
}