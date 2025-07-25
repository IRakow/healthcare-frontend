import { supabase } from '@/lib/supabase';

export const patientTimelineService = {
  async addEvent(patientId: string, type: string, label: string, data: any) {
    const { data: event, error } = await supabase
      .from('patient_timeline_events')
      .insert({
        patient_id: patientId,
        type,
        label,
        data,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding timeline event:', error);
      throw error;
    }

    return event;
  },

  async addAIEvent(patientId: string, input: string, output: string, model: string = 'AI Assistant') {
    return this.addEvent(patientId, 'ai', model, { input, output });
  },

  async addVitalsEvent(patientId: string, vitals: Record<string, any>) {
    return this.addEvent(patientId, 'vitals', 'Vitals Check', vitals);
  },

  async addLabEvent(patientId: string, labName: string, results: Array<{ name: string; value: string; unit: string }>) {
    return this.addEvent(patientId, 'lab', labName, { results });
  },

  async addVisitEvent(patientId: string, visitType: string, note: string) {
    return this.addEvent(patientId, 'visit', visitType, { note });
  },

  async addUploadEvent(patientId: string, fileName: string, url: string) {
    return this.addEvent(patientId, 'upload', fileName, { url });
  },
};

// Example usage:
// await patientTimelineService.addAIEvent(currentUserId, 'What is anemia?', 'Anemia is a condition where...', 'Gemini Summary');