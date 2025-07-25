import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, Upload } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { MeditationType } from '@/types/meditation';

interface MeditationAudioPlayerProps {
  type: MeditationType;
  onSessionComplete?: (audioUrl?: string) => void;
}

export function MeditationAudioPlayer({ type, onSessionComplete }: MeditationAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadAudioForType();
  }, [type]);

  async function loadAudioForType() {
    try {
      // Check for pre-defined audio for this meditation type
      const { data } = await supabase
        .from('meditation_audio')
        .select('audio_url')
        .eq('type', type)
        .single();

      if (data?.audio_url) {
        // Get public URL from storage
        const { data: { publicUrl } } = supabase.storage
          .from('meditation-audio')
          .getPublicUrl(data.audio_url);
        
        setAudioUrl(publicUrl);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAudio(file: File) {
    setUploading(true);
    
    try {
      const fileName = `${type}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('meditation-audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('meditation-audio')
        .getPublicUrl(fileName);

      setAudioUrl(publicUrl);

      // Save to meditation_audio table
      await supabase.from('meditation_audio').insert({
        type,
        name: file.name,
        audio_url: fileName,
        description: `User uploaded ${type} meditation`
      });

      alert('Audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio');
    } finally {
      setUploading(false);
    }
  }

  function togglePlayPause() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleAudioEnd() {
    setIsPlaying(false);
    if (onSessionComplete) {
      onSessionComplete(audioUrl || undefined);
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="p-6 flex justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Meditation Audio
        </h3>

        {audioUrl ? (
          <>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnd}
              className="hidden"
            />
            
            <div className="flex items-center justify-center">
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="rounded-full h-16 w-16"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              {isPlaying ? 'Playing meditation audio...' : 'Click to start audio'}
            </p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">No audio available for {type} meditation</p>
            
            <div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAudio(file);
                }}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload">
                <Button
                  asChild
                  variant="outline"
                  disabled={uploading}
                >
                  <span>
                    {uploading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Audio
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}