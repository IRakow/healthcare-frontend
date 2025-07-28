import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Sparkles,
  Monitor,
  MonitorOff,
  Users,
  Clock,
  Wifi,
  WifiOff,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  MessageSquare,
  Brain,
  Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface TelemedSession {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  provider_id: string;
  room_id: string;
  status: 'waiting' | 'active' | 'ended';
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  clinical_notes?: string;
  ai_summary?: string;
  recording_enabled?: boolean;
}

interface ProviderCameraPanelProps {
  sessionId?: string;
  appointmentId?: string;
}

export const ProviderCameraPanel: React.FC<ProviderCameraPanelProps> = ({ 
  sessionId, 
  appointmentId 
}) => {
  const { userId, name } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const [session, setSession] = useState<TelemedSession | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // AI Notepad States
  const [notes, setNotes] = useState('');
  const [aiSummary, setAISummary] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [noteTemplates] = useState([
    { label: 'HPI', text: 'History of Present Illness:\n' },
    { label: 'ROS', text: 'Review of Systems:\n' },
    { label: 'PE', text: 'Physical Examination:\n' },
    { label: 'MDM', text: 'Medical Decision Making:\n' }
  ]);

  useEffect(() => {
    if (sessionId || appointmentId) {
      initializeSession();
    } else {
      // Standalone mode - just initialize media
      initializeMedia();
      setLoading(false);
    }
    return () => {
      cleanupSession();
    };
  }, [sessionId, appointmentId]);

  useEffect(() => {
    // Update session duration every second
    const interval = setInterval(() => {
      if (session?.start_time && session.status === 'active') {
        const start = new Date(session.start_time);
        const now = new Date();
        setSessionDuration(Math.floor((now.getTime() - start.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    // Auto-save notes every 30 seconds
    const saveInterval = setInterval(() => {
      if (notes && session && notes !== session.clinical_notes) {
        autoSaveNotes();
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [notes, session]);

  const initializeSession = async () => {
    setLoading(true);
    try {
      let sessionData: TelemedSession;

      if (sessionId) {
        // Load existing session
        const { data, error } = await supabase
          .from('telemed_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        // Load patient info separately
        const { data: patient } = await supabase
          .from('patients')
          .select('id, user_id')
          .eq('id', data.patient_id)
          .single();

        // Get patient profile for name
        const { data: profile } = await supabase
          .from('patient_profiles')
          .select('user_id')
          .eq('user_id', patient?.user_id || '')
          .single();

        // Query users table directly
        const { data: userData } = await supabase
          .from('auth.users')
          .select('email, raw_user_meta_data')
          .eq('id', patient?.user_id || '')
          .single();
        
        sessionData = {
          ...data,
          patient_name: userData?.raw_user_meta_data?.full_name || 'Unknown Patient'
        };

        // Load existing notes
        if (data.clinical_notes) setNotes(data.clinical_notes);
        if (data.ai_summary) setAISummary(data.ai_summary);
      } else if (appointmentId) {
        // Create new session for appointment
        const { data: appointment, error: aptError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();

        if (aptError) throw aptError;

        // Load patient info separately
        const { data: patient } = await supabase
          .from('patients')
          .select('id, user_id')
          .eq('id', appointment.patient_id)
          .single();

        // Query users table directly
        const { data: userData } = await supabase
          .from('auth.users')
          .select('email, raw_user_meta_data')
          .eq('id', patient?.user_id || '')
          .single();

        const roomId = `room-${appointmentId}-${Date.now()}`;
        
        const { data: newSession, error: sessionError } = await supabase
          .from('telemed_sessions')
          .insert({
            appointment_id: appointmentId,
            patient_id: appointment.patient_id,
            provider_id: userId,
            room_id: roomId,
            status: 'waiting'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        sessionData = {
          ...newSession,
          patient_name: userData?.raw_user_meta_data?.full_name || 'Unknown Patient'
        };

        // Update appointment status
        await supabase
          .from('appointments')
          .update({ status: 'in-progress' })
          .eq('id', appointmentId);

        // Load patient context for AI
        await loadPatientContext(appointment.patient_id);
      } else {
        throw new Error('No session or appointment ID provided');
      }

      setSession(sessionData);
      await initializeMedia();
      await setupWebRTC(sessionData.room_id);
      
      // Subscribe to session updates
      subscribeToSessionUpdates(sessionData.id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      alert('Failed to start video session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientContext = async (patientId: string) => {
    try {
      // Load patient profile, recent vitals, medications for AI context
      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', patientId)
        .single();

      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true);

      const { data: vitals } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1);

      // Add context to notes
      const context = `Patient Context:
- Chronic Conditions: ${profile?.chronic_conditions?.join(', ') || 'None'}
- Active Medications: ${medications?.map(m => m.name).join(', ') || 'None'}
- Latest Vitals: BP ${vitals?.[0]?.blood_pressure_systolic}/${vitals?.[0]?.blood_pressure_diastolic}, HR ${vitals?.[0]?.heart_rate}
---\n\n`;

      setNotes(context);
    } catch (error) {
      console.error('Failed to load patient context:', error);
    }
  };

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const setupWebRTC = async (roomId: string) => {
    try {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      if (stream) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            setConnectionStatus('connected');
            updateSessionStatus('active');
            break;
          case 'disconnected':
          case 'failed':
            setConnectionStatus('disconnected');
            break;
          case 'connecting':
            setConnectionStatus('connecting');
            break;
        }
      };

      // Set up signaling via Supabase Realtime
      const channel = supabase.channel(roomId);
      
      channel
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (payload.senderId !== userId) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            channel.send({
              type: 'broadcast',
              event: 'answer',
              payload: { answer, senderId: userId }
            });
          }
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (payload.senderId !== userId) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          if (payload.senderId !== userId && payload.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            channel.send({
              type: 'broadcast',
              event: 'offer',
              payload: { offer, senderId: userId }
            });
          }
        });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate, senderId: userId }
          });
        }
      };
    } catch (error) {
      console.error('Failed to setup WebRTC:', error);
    }
  };

  const subscribeToSessionUpdates = (sessionId: string) => {
    const channel = supabase
      .channel(`telemed-session:${sessionId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'telemed_sessions',
          filter: `id=eq.${sessionId}`
        }, 
        (payload) => {
          setSession(prev => ({ ...prev!, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const updateSessionStatus = async (status: TelemedSession['status']) => {
    if (!session) return;

    try {
      const updates: any = { status };
      
      if (status === 'active' && !session.start_time) {
        updates.start_time = new Date().toISOString();
      } else if (status === 'ended') {
        updates.end_time = new Date().toISOString();
        if (session.start_time) {
          const duration = Math.floor(
            (new Date().getTime() - new Date(session.start_time).getTime()) / 1000
          );
          updates.duration_seconds = duration;
        }
      }

      await supabase
        .from('telemed_sessions')
        .update(updates)
        .eq('id', session.id);
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  };

  const toggleMic = () => {
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(!micEnabled);
  };

  const toggleCam = () => {
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = !camEnabled;
    });
    setCamEnabled(!camEnabled);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setScreenSharing(true);
      } catch (error) {
        console.error('Failed to share screen:', error);
      }
    } else {
      const videoTrack = stream?.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }

      setScreenSharing(false);
    }
  };

  const autoSaveNotes = async () => {
    if (!session) return;

    setAutoSaving(true);
    try {
      await supabase
        .from('telemed_sessions')
        .update({
          clinical_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to auto-save notes:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const generateAI = async () => {
    setGeneratingAI(true);
    try {
      const prompt = `You're a clinical documentation assistant. Given the following notes from a provider, generate a structured SOAP note.

Format:
S: Subjective - Patient's complaints in their own words
O: Objective - Clinical observations, vitals, exam findings
A: Assessment - Your clinical impression
P: Plan - What happens next (labs, meds, referrals, follow-up)

Provider Notes:
"""
${notes}
"""

Generate:`;

      const { data, error } = await supabase.functions.invoke('generate-soap-summary', {
        body: { 
          prompt,
          notes,
          patientId: session?.patient_id,
          sessionId: session?.id
        }
      });

      if (error) throw error;

      const summary = data.summary || 'No summary returned.';
      setAISummary(summary);

      // Save AI summary if we have a session
      if (session) {
        await supabase
          .from('telemed_sessions')
          .update({
            ai_summary: summary,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        // Also log to chart using the new endpoint
        await supabase.functions.invoke('chart-log', {
          body: {
            type: 'soap_summary',
            content: summary,
            timestamp: new Date().toISOString(),
            patientId: session.patient_id,
            appointmentId: session.appointment_id
          }
        });
      }
    } catch (error) {
      console.error('AI summary error:', error);
      setAISummary('Error generating SOAP note. Please try again.');
    }
    setGeneratingAI(false);
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setNotes(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const insertTemplate = (template: string) => {
    setNotes(prev => prev + '\n\n' + template);
  };

  const copyRoomLink = () => {
    if (session) {
      const link = `${window.location.origin}/patient/video/${session.room_id}`;
      navigator.clipboard.writeText(link);
      alert('Room link copied to clipboard!');
    }
  };

  const endSession = async () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    
    if (session) {
      updateSessionStatus('ended');
      
      // Save final notes
      if (notes) {
        await supabase
          .from('telemed_sessions')
          .update({
            clinical_notes: notes,
            ai_summary: aiSummary
          })
          .eq('id', session.id);

        // Log final notes to chart if we have a summary
        if (aiSummary) {
          await supabase.functions.invoke('chart-log', {
            body: {
              type: 'soap_summary',
              content: aiSummary,
              timestamp: new Date().toISOString(),
              patientId: session.patient_id,
              appointmentId: session.appointment_id
            }
          });
        }
      }

      // Add to timeline
      await supabase.from('patient_timeline').insert({
        patient_id: session.patient_id,
        type: 'telehealth',
        title: 'Telehealth Visit Completed',
        content: `Video consultation with Dr. ${name} - Duration: ${formatDuration(sessionDuration)}`,
        timestamp: new Date().toISOString(),
        importance: 'medium'
      });

      // Redirect to SOAP note creation
      if (session.appointment_id && aiSummary) {
        window.location.href = `/provider/soap/new?appointmentId=${session.appointment_id}&prefill=true`;
      }
    } else {
      alert('Telemedicine session ended.');
    }

    cleanupSession();
  };

  const cleanupSession = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStream(null);
    setRemoteStream(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="ml-3 text-muted-foreground">Initializing video session...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 xl:grid-cols-2 gap-6"
    >
      {/* Video Panel */}
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" /> Provider Camera Panel
          </h3>
          {session && (
            <div className="flex items-center gap-2">
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                {connectionStatus === 'connected' ? (
                  <><Wifi className="w-3 h-3 mr-1" /> Connected</>
                ) : (
                  <><WifiOff className="w-3 h-3 mr-1" /> Connecting...</>
                )}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(sessionDuration)}
              </Badge>
            </div>
          )}
        </div>

        {/* Patient Info */}
        {session && (
          <Card className="p-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Patient: {session.patient_name}</p>
              <Button size="sm" variant="ghost" onClick={copyRoomLink}>
                <Copy className="w-3 h-3 mr-1" />
                Copy Link
              </Button>
            </div>
          </Card>
        )}

        {/* Video Display */}
        {session ? (
          <div className="relative">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-xl border shadow bg-gray-100 aspect-video object-cover"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Waiting for patient...</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 right-2 w-32">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full rounded-lg border-2 border-white shadow"
              />
            </div>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full rounded-xl border shadow aspect-video object-cover"
          />
        )}

        {/* Controls */}
        <div className="flex gap-3 justify-center pt-2">
          <Button 
            onClick={toggleMic} 
            variant={micEnabled ? "outline" : "destructive"} 
            size="icon"
          >
            {micEnabled ? <Mic className="text-green-600" /> : <MicOff className="text-red-500" />}
          </Button>
          <Button 
            onClick={toggleCam} 
            variant={camEnabled ? "outline" : "destructive"} 
            size="icon"
          >
            {camEnabled ? <Video className="text-green-600" /> : <VideoOff className="text-red-500" />}
          </Button>
          {session && (
            <>
              <Button 
                onClick={toggleScreenShare} 
                variant={screenSharing ? "default" : "outline"} 
                size="icon"
              >
                {screenSharing ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
              </Button>
              <Button 
                onClick={() => window.location.href = `/provider/messages?patientId=${session?.patient_id}`} 
                variant="outline" 
                size="icon"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button 
            onClick={endSession} 
            variant="destructive" 
            size="icon"
          >
            <PhoneOff className="text-white" />
          </Button>
        </div>
      </div>

      {/* AI Clinical Notepad */}
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> AI Clinical Notepad
          </h3>
          {session && (
            <div className="flex items-center gap-2">
              {autoSaving && (
                <Badge variant="outline" className="text-xs">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
              {lastSaved && !autoSaving && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            >
              <Mic className="w-4 h-4 mr-1" />
              {isRecording ? 'Stop' : 'Dictate'}
            </Button>
            {noteTemplates.map((template) => (
              <Button
                key={template.label}
                variant="outline"
                size="sm"
                onClick={() => insertTemplate(template.text)}
              >
                {template.label}
              </Button>
            ))}
            {session && (
              <Button
                variant="outline"
                size="sm"
                onClick={autoSaveNotes}
                disabled={autoSaving}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
          </div>

          <Textarea
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            rows={10}
            className="w-full text-sm resize-none"
            placeholder="Type clinical notes here..."
          />

          <Button 
            onClick={generateAI} 
            disabled={generatingAI || !notes.trim()} 
            className="w-full"
          >
            {generatingAI ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating summary...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate SOAP Summary
              </>
            )}
          </Button>

          {/* AI Summary */}
          <AnimatePresence>
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    AI-Generated SOAP Note
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(aiSummary)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-4 border rounded-xl shadow">
                  {aiSummary}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  AI-generated summary. Review and edit before finalizing.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};