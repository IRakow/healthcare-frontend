import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const form = await req.formData();
    const file = form.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    const arrayBuffer = await file.arrayBuffer();
    const path = `uploads/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from('files').upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage.from('files').getPublicUrl(path);
    
    return new Response(JSON.stringify({ url: publicUrl.publicUrl }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});