// File: src/hooks/useVoiceInput.ts

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY || '');

export function useVoiceInput() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const streamRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.end();
    };
  }, []);

  async function startRecording() {
    setTranscript('');
    setRecording(true);

    const dgStream = await deepgram.listen.live({ model: 'nova' });
    streamRef.current = dgStream;

    dgStream.on('transcriptReceived', (msg: any) => {
      const words = msg.channel?.alternatives?.[0]?.transcript;
      if (words) {
        setTranscript(words);
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!recording) return;
      const input = e.inputBuffer.getChannelData(0);
      const int16 = convertFloat32ToInt16(input);
      dgStream.send(int16);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  }

  function stopRecording() {
    setRecording(false);
    if (streamRef.current) streamRef.current.finish();
  }

  function resetTranscript() {
    setTranscript('');
  }

  return { recording, transcript, startRecording, stopRecording, resetTranscript };
}

function convertFloat32ToInt16(buffer: Float32Array) {
  const l = buffer.length;
  const buf = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    buf[i] = buffer[i] * 0x7fff;
  }
  return buf;
}