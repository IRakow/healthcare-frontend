import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare,
  Users,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

export default function VideoRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { userId, role } = useUser();
  
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: string; time: string }>>([]);

  useEffect(() => {
    if (!roomId || !userId) return;

    const initializeCall = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (localRef.current) {
          localRef.current.srcObject = stream;
        }
        setLocalStream(stream);

        // Create peer connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        // Add local tracks
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteRef.current && event.streams[0]) {
            remoteRef.current.srcObject = event.streams[0];
            setIsConnected(true);
            setIsConnecting(false);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal({
              type: 'ice-candidate',
              from: userId,
              to: 'all',
              data: event.candidate
            });
          }
        };

        pcRef.current = pc;

        // Set up Supabase Realtime channel for signaling
        const channel = supabase.channel(`video-room:${roomId}`)
          .on('broadcast', { event: 'signal' }, ({ payload }) => {
            handleSignal(payload as SignalData);
          })
          .on('broadcast', { event: 'message' }, ({ payload }) => {
            setMessages(prev => [...prev, payload]);
          })
          .subscribe();

        // Announce presence
        await channel.send({
          type: 'broadcast',
          event: 'user-joined',
          payload: { userId, role }
        });

        // Create offer if initiator (e.g., provider)
        if (role === 'provider') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({
            type: 'offer',
            from: userId,
            to: 'all',
            data: offer
          });
        }

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Failed to initialize call:', error);
        setIsConnecting(false);
      }
    };

    initializeCall();

    return () => {
      pcRef.current?.close();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, userId, role]);

  const sendSignal = async (signal: SignalData) => {
    const channel = supabase.channel(`video-room:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'signal',
      payload: signal
    });
  };

  const handleSignal = async (signal: SignalData) => {
    if (!pcRef.current || signal.from === userId) return;

    try {
      switch (signal.type) {
        case 'offer':
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          sendSignal({
            type: 'answer',
            from: userId,
            to: signal.from,
            data: answer
          });
          break;

        case 'answer':
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.data));
          break;

        case 'ice-candidate':
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = async () => {
    pcRef.current?.close();
    localStream?.getTracks().forEach(track => track.stop());
    
    // Save call log
    await supabase.from('call_logs').insert({
      room_id: roomId,
      user_id: userId,
      duration: Date.now() - startTime,
      ended_at: new Date().toISOString()
    });

    navigate(role === 'provider' ? '/provider/dashboard' : '/patient/dashboard');
  };

  const [startTime] = useState(Date.now());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            Telehealth Visit - Room {roomId}
          </h1>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <span className="text-white">
              {isConnected ? '2 participants' : 'Waiting for participant...'}
            </span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Video */}
          <Card className="relative overflow-hidden bg-black">
            <video 
              ref={localRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <p className="text-sm text-white">You</p>
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </Card>

          {/* Remote Video */}
          <Card className="relative overflow-hidden bg-black">
            {isConnecting ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
                  <p className="text-white">Connecting...</p>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={remoteRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                  <p className="text-sm text-white">
                    {role === 'provider' ? 'Patient' : 'Provider'}
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleMute}
            className="rounded-full"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full"
            onClick={() => {/* Open chat */}}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}