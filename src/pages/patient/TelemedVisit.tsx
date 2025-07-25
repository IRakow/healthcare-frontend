import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { generateJitsiLink } from '@/utils/videoCall';
import { Spinner } from '@/components/ui/spinner';
import { TranscriptionControls } from '@/components/TranscriptionControls';
import { CompleteVisitButton } from '@/components/CompleteVisitButton';
import { useRole } from '@/hooks/useRole';

export default function TelemedVisit() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!appointmentId) return;

    (async () => {
      try {
        // Get appointment details
        const { data: appt } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .maybeSingle();

        if (!appt) {
          console.error('Appointment not found');
          setLoading(false);
          return;
        }

        setAppointment(appt);

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

        // Create timeline event for video visit started
        await supabase.from('patient_timeline_events').insert({
          patient_id: appt.patient_id,
          type: 'visit',
          label: 'Video Visit Started',
          data: { appointment_id: appt.id }
        });

        setUrl(videoUrl);
      } catch (error) {
        console.error('Error setting up video session:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

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
          <p className="text-sm text-gray-600 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Telemedicine Visit</h1>
        {appointment && (
          <div className="text-sm text-gray-600">
            <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
            <p>Time: {appointment.time}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <iframe
            title="Telemedicine Session"
            src={url}
            className="w-full h-[80vh] rounded-xl border shadow-xl"
            allow="camera; microphone; fullscreen; display-capture"
          />
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tips for your video visit:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Ensure your camera and microphone are enabled</li>
              <li>Find a quiet, well-lit location</li>
              <li>Have your medications and any relevant documents ready</li>
              <li>Your provider will join the session at the scheduled time</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-4">
          {appointmentId && <TranscriptionControls appointmentId={appointmentId} />}
          
          {role === 'provider' && appointment?.status === 'in_progress' && (
            <CompleteVisitButton 
              appointmentId={appointmentId!}
              onComplete={() => {
                navigate('/provider/dashboard');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}