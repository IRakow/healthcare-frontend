// Map employer voice profiles to ElevenLabs voice IDs
export const employerVoiceMap: { [key: string]: string } = {
  'Rachel': 'voice_id_rachel',
  'Josh': 'voice_id_josh',
  'Emily': 'voice_id_emily',
  'Michael': 'voice_id_michael',
  'Sarah': 'voice_id_sarah',
  'David': 'voice_id_david',
  'Jessica': 'voice_id_jessica',
  'Matthew': 'voice_id_matthew',
  'Ashley': 'voice_id_ashley',
  'Christopher': 'voice_id_christopher'
};

// Example usage:
// const voice = currentEmployer?.voice_profile || 'Rachel';
// const voiceId = employerVoiceMap[voice];