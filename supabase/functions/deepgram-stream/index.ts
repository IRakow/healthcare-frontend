import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const deepgramKey = Deno.env.get('BDInsperityHealthDeepGram')!;

serve(async (req) => {
  const { method } = req;
  
  if (method === 'POST') {
    // Handle audio transcription
    const contentType = req.headers.get('content-type') || 'audio/wav';
    const audioBuffer = await req.arrayBuffer();

    // Deepgram options
    const options = {
      model: 'nova-2',
      language: 'en-US',
      punctuate: true,
      profanity_filter: false,
      redact: false,
      diarize: false,
      smart_format: true,
      utterances: true,
      numerals: true,
    };

    const queryString = new URLSearchParams(options as any).toString();
    
    const res = await fetch(`https://api.deepgram.com/v1/listen?${queryString}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${deepgramKey}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
    });

    const json = await res.json();
    return new Response(JSON.stringify(json), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (method === 'GET') {
    // WebSocket upgrade for real-time transcription
    const upgrade = req.headers.get('upgrade') || '';
    
    if (upgrade.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Connect to Deepgram WebSocket
    const deepgramWs = new WebSocket(
      `wss://api.deepgram.com/v1/listen?` +
      `encoding=linear16&sample_rate=16000&language=en-US&model=nova-2&` +
      `punctuate=true&smart_format=true&interim_results=true`,
      {
        headers: {
          Authorization: `Token ${deepgramKey}`,
        },
      }
    );

    // Relay messages between client and Deepgram
    deepgramWs.onopen = () => {
      console.log('Connected to Deepgram');
    };

    deepgramWs.onmessage = (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    deepgramWs.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error);
      socket.close(1011, 'Deepgram connection error');
    };

    deepgramWs.onclose = () => {
      socket.close(1000, 'Deepgram connection closed');
    };

    socket.onmessage = (event) => {
      if (deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(event.data);
      }
    };

    socket.onclose = () => {
      deepgramWs.close();
    };

    return response;
  }

  return new Response('Method not allowed', { status: 405 });
});