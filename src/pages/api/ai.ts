// This file has been replaced by the Supabase AI Voice function
// Use the following instead:
// 
// import { voiceAPI } from '@/services/voiceAPI';
// 
// // For streaming AI responses:
// await voiceAPI.streamAIResponse(query, (chunk) => {
//   // Handle each chunk
// });
// 
// // Or use directly:
// await fetch('https://dhycdcugbjchktvqlroz.functions.supabase.co/ai-voice', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ query })
// });

export default async function handler(req: any, res: any) {
  // Redirect to Supabase function
  return res.status(301).json({
    message: 'This endpoint has been moved to Supabase Functions',
    newEndpoint: 'https://dhycdcugbjchktvqlroz.functions.supabase.co/ai-voice'
  });
}