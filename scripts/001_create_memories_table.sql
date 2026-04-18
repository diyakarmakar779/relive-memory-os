-- Create memories table for ReLive
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Original content
  original_transcript TEXT NOT NULL,
  
  -- AI-generated content
  story TEXT NOT NULL,
  emotion TEXT NOT NULL CHECK (emotion IN ('nostalgia', 'love', 'calm', 'joy', 'hope', 'gratitude', 'wonder', 'melancholy')),
  
  -- Audio URLs (stored in Supabase Storage)
  original_audio_url TEXT,
  narration_audio_url TEXT,
  
  -- Word timestamps for synchronized highlighting (JSON array)
  word_timestamps JSONB,
  
  -- Ambient sound preference
  ambient_sound TEXT CHECK (ambient_sound IN ('none', 'rain', 'cafe', 'night', 'ocean', 'fireplace')),
  
  -- Metadata
  title TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own memories
CREATE POLICY "memories_select_own" ON public.memories 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "memories_insert_own" ON public.memories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "memories_update_own" ON public.memories 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "memories_delete_own" ON public.memories 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON public.memories(created_at DESC);
CREATE INDEX IF NOT EXISTS memories_emotion_idx ON public.memories(emotion);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories-audio', 'memories-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio files
CREATE POLICY "memories_audio_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories-audio');

CREATE POLICY "memories_audio_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "memories_audio_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
