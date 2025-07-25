export interface MeditationLog {
  id: string;
  user_id: string;
  type: MeditationType;
  duration_minutes: number;
  started_at: string;
  completed_at?: string;
}

export type MeditationType = 'calm' | 'sleep' | 'focus' | 'anxiety' | 'breathing' | 'body-scan' | 'loving-kindness';

export interface MeditationSession {
  type: MeditationType;
  title: string;
  description: string;
  duration: number; // in minutes
  icon: string;
  color: string;
  audioUrl?: string;
}

export const MEDITATION_TYPES: Record<MeditationType, MeditationSession> = {
  calm: {
    type: 'calm',
    title: 'Calm & Relaxation',
    description: 'Find peace and tranquility',
    duration: 10,
    icon: '🧘',
    color: 'bg-blue-500',
  },
  sleep: {
    type: 'sleep',
    title: 'Sleep Meditation',
    description: 'Drift into restful sleep',
    duration: 15,
    icon: '😴',
    color: 'bg-indigo-500',
  },
  focus: {
    type: 'focus',
    title: 'Focus & Clarity',
    description: 'Enhance concentration',
    duration: 10,
    icon: '🎯',
    color: 'bg-purple-500',
  },
  anxiety: {
    type: 'anxiety',
    title: 'Anxiety Relief',
    description: 'Calm your anxious thoughts',
    duration: 12,
    icon: '💚',
    color: 'bg-green-500',
  },
  breathing: {
    type: 'breathing',
    title: 'Breathing Exercise',
    description: 'Deep breathing techniques',
    duration: 5,
    icon: '🌬️',
    color: 'bg-cyan-500',
  },
  'body-scan': {
    type: 'body-scan',
    title: 'Body Scan',
    description: 'Progressive relaxation',
    duration: 20,
    icon: '🌟',
    color: 'bg-yellow-500',
  },
  'loving-kindness': {
    type: 'loving-kindness',
    title: 'Loving Kindness',
    description: 'Cultivate compassion',
    duration: 15,
    icon: '❤️',
    color: 'bg-pink-500',
  },
};