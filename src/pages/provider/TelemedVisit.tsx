import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { generateJitsiLink } from '@/utils/videoCall';
import Spinner from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Clock, FileText } from 'lucide-react';
import { TranscriptCapture } from '@/components/appointments/TranscriptCapture';

export default function ProviderTelemedVisit() {
  const { appointmentId } = useParams();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (!appointmentId) return;

    (async () => {
      try {
        // Get appointment details with patient info
        const { data: appt } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:users!appointments_patient_id_fkey(
              id,
              full_name,
              email
            )
          `)
          .eq('id', appointmentId)
          .maybeSingle();

        if (!appt) {
          console.error('Appointment not found');
          setLoading(false);
          return;
        }

        setAppointment(appt);
        setPatient(appt.patient);

        // Use existing video URL or generate new one
        let videoUrl = appt.video_url;
        if (!videoUrl) {
          videoUrl = generateJitsiLink(appointmentId);
          await supabase
            .from('appointments')
            .update({ video_url: videoUrl })
            .eq('id', appointmentId);
        }

        // Update status to in_progress
        if (appt.status === 'pending') {
          await supabase
            .from('appointments')
            .update({ status: 'in_progress' })
            .eq('id', appointmentId);
        }

        // Create timeline event for video visit started (only if not already in progress)
        if (appt.status === 'pending') {
          await supabase.from('patient_timeline_events').insert({
            patient_id: appt.patient_id,
            type: 'visit',
            label: 'Video Visit Started',
            data: { appointment_id: appt.id }
          });
        }

        setUrl(videoUrl);
      } catch (error) {
        console.error('Error setting up video session:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  async function endAppointment() {
    if (!appointmentId || !appointment) return;
    
    try {
      await supabase
        .from('appointments')
        .update({ status: 'complete' })
        .eq('id', appointmentId);
      
      // Create timeline event for completed visit
      await supabase.from('patient_timeline_events').insert({
        patient_id: appointment.patient_id,
        type: 'visit',
        label: 'Video Visit Completed',
        data: { appointment_id: appointmentId }
      });
      
      // Navigate back to dashboard
      window.location.href = '/provider';
    } catch (error) {
      console.error('Error ending appointment:', error);
      alert('Failed to end appointment');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Setting up your video session...</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="text-red-600">Unable to start video session</p>
          <p className="text-sm text-gray-600 mt-2">Please check the appointment details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Telemedicine Visit</h1>
        <Button variant="outline" onClick={endAppointment}>
          End Appointment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Session */}
        <div className="lg:col-span-3">
          <iframe
            title="Telemedicine Session"
            src={url}
            className="w-full h-[80vh] rounded-xl border shadow-xl"
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
        
        {/* Patient Info Sidebar */}
        <div className="space-y-4">
          {/* Patient Details */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </h3>
              {patient && (
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {patient.full_name}</p>
                  <p><strong>Email:</strong> {patient.email}</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Appointment Details */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Appointment Details
              </h3>
              {appointment && (
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  <p><strong>Type:</strong> Telemedicine</p>
                  <p><strong>Reason:</strong> {appointment.reason}</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full">
                  View Patient History
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Add Visit Notes
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Prescribe Medication
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Transcript Capture */}
          {appointment && (
            <TranscriptCapture
              appointmentId={appointmentId!}
              patientId={appointment.patient_id}
              onSave={() => {
                // Optional: Refresh or update UI after save
                console.log('Transcript saved');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}