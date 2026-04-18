export type Emotion = 
  | 'nostalgia' 
  | 'love' 
  | 'calm' 
  | 'joy' 
  | 'hope' 
  | 'gratitude' 
  | 'wonder' 
  | 'melancholy';

export type AmbientSound = 
  | 'none' 
  | 'rain' 
  | 'cafe' 
  | 'night' 
  | 'ocean' 
  | 'fireplace';

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface Memory {
  id: string;
  user_id: string;
  original_transcript: string;
  story: string;
  emotion: Emotion;
  original_audio_url: string | null;
  narration_audio_url: string | null;
  word_timestamps: WordTimestamp[] | null;
  ambient_sound: AmbientSound | null;
  title: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMemoryInput {
  original_transcript: string;
  story: string;
  emotion: Emotion;
  original_audio_url?: string;
  narration_audio_url?: string;
  word_timestamps?: WordTimestamp[];
  ambient_sound?: AmbientSound;
  title?: string;
  duration_seconds?: number;
}

// Emotion configuration with colors and descriptions
export const EMOTION_CONFIG: Record<Emotion, { 
  label: string; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  nostalgia: { 
    label: 'Nostalgia', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50',
    description: 'A bittersweet longing for the past'
  },
  love: { 
    label: 'Love', 
    color: 'text-rose-600', 
    bgColor: 'bg-rose-50',
    description: 'Deep affection and connection'
  },
  calm: { 
    label: 'Calm', 
    color: 'text-sky-600', 
    bgColor: 'bg-sky-50',
    description: 'Peaceful serenity and tranquility'
  },
  joy: { 
    label: 'Joy', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    description: 'Pure happiness and delight'
  },
  hope: { 
    label: 'Hope', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    description: 'Optimism for what lies ahead'
  },
  gratitude: { 
    label: 'Gratitude', 
    color: 'text-violet-600', 
    bgColor: 'bg-violet-50',
    description: 'Thankfulness and appreciation'
  },
  wonder: { 
    label: 'Wonder', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50',
    description: 'Awe and amazement at life'
  },
  melancholy: { 
    label: 'Melancholy', 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-100',
    description: 'A gentle, thoughtful sadness'
  },
};

export const AMBIENT_SOUNDS: Record<AmbientSound, { label: string; icon: string }> = {
  none: { label: 'None', icon: '🔇' },
  rain: { label: 'Rain', icon: '🌧️' },
  cafe: { label: 'Café', icon: '☕' },
  night: { label: 'Night', icon: '🌙' },
  ocean: { label: 'Ocean', icon: '🌊' },
  fireplace: { label: 'Fireplace', icon: '🔥' },
};
