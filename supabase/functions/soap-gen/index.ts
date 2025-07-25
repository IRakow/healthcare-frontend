import { serve } from 'https://deno.land/std/http/server.ts';

const geminiKey = Deno.env.get('PurityHealthGemini')!;

serve(async (req) => {
  const { transcript } = await req.json();

  const prompt = `
Given this transcript or summary of a medical encounter, generate a clinical SOAP note.

Use this structure:
S: [Subjective]
O: [Objective]
A: [Assessment]
P: [Plan]

Do NOT include empathy or hedging. Be medically appropriate, structured, and direct.

Transcript:
"${transcript}"
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  const json = await res.json();
  const note = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return new Response(JSON.stringify({ soap_note: note }));
});