import { supabase } from '@/lib/supabaseClient';

interface AILogData {
  action: string;
  model?: string;
  voice_used?: string;
  input?: string;
  output?: string;
  success?: boolean;
  metadata?: any;
}

export const aiLoggingService = {
  // Log a general AI interaction
  async logInteraction(data: AILogData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('ai_logs').insert({
        user_id: user.id,
        role: userData?.role || 'patient',
        model: data.model,
        voice_used: data.voice_used,
        action: data.action,
        input: data.input,
        output: data.output,
        success: data.success !== false
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
      return null;
    }
  },

  // Log a query to an AI model
  async logQuery(model: string, query: string, response: string, voice?: string) {
    return this.logInteraction({
      action: 'AI Query',
      model,
      voice_used: voice,
      input: query,
      output: response
    });
  },

  // Log voice transcription
  async logVoiceTranscription(transcript: string, duration: number, model: string = 'Deepgram') {
    return this.logInteraction({
      action: 'Voice Transcription',
      model,
      input: `Audio (${duration}s)`,
      output: transcript
    });
  },

  // Log symptom checking
  async logSymptomCheck(symptoms: string, analysis: string, model: string = 'Gemini') {
    return this.logInteraction({
      action: 'Symptom Analysis',
      model,
      input: symptoms,
      output: analysis
    });
  },

  // Log SOAP note generation
  async logSOAPGeneration(transcript: string, soapNote: string, model: string = 'Gemini') {
    return this.logInteraction({
      action: 'Generate SOAP Note',
      model,
      input: transcript,
      output: soapNote
    });
  },

  // Log meditation generation
  async logMeditationGeneration(topic: string, voice: string, model: string, script: string) {
    return this.logInteraction({
      action: 'Generate Meditation',
      model,
      voice_used: voice,
      input: topic,
      output: script
    });
  },

  // Log lab result analysis
  async logLabAnalysis(labData: string, analysis: string, model: string = 'Gemini') {
    return this.logInteraction({
      action: 'Analyze Lab Results',
      model,
      input: labData,
      output: analysis
    });
  },

  // Log risk detection
  async logRiskDetection(patientData: string, risks: string, model: string = 'Gemini') {
    return this.logInteraction({
      action: 'Risk Detection',
      model,
      input: patientData,
      output: risks
    });
  }
};