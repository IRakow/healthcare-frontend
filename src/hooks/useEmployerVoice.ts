import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { employerVoiceMap } from '@/utils/employerVoiceMap';

export function useEmployerVoice() {
  const [voiceId, setVoiceId] = useState<string>('voice_id_rachel');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerVoice() {
      try {
        const user = supabase.auth.user();
        
        // Get user's employer
        const { data: userData } = await supabase
          .from('users')
          .select('employer_id')
          .eq('id', user.id)
          .single();

        if (userData?.employer_id) {
          // Get employer's voice profile
          const { data: employer } = await supabase
            .from('employers')
            .select('voice_profile')
            .eq('id', userData.employer_id)
            .single();

          const voice = employer?.voice_profile || 'Rachel';
          const mappedVoiceId = employerVoiceMap[voice] || 'voice_id_rachel';
          setVoiceId(mappedVoiceId);
        }
      } catch (error) {
        console.error('Error loading employer voice:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployerVoice();
  }, []);

  return { voiceId, loading };
}