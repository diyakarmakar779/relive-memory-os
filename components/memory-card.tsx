"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { Memory, WordTimestamp, AmbientSound } from "@/lib/types"

interface MemoryCardProps {
  memory: Memory
  autoPlay?: boolean
}

const EMOTION_STYLES: Record<string, { bg: string; text: string; accent: string }> = {
  nostalgia: { bg: "bg-emotion-nostalgia/10", text: "text-emotion-nostalgia", accent: "bg-emotion-nostalgia" },
  love: { bg: "bg-emotion-love/10", text: "text-emotion-love", accent: "bg-emotion-love" },
  calm: { bg: "bg-emotion-calm/10", text: "text-emotion-calm", accent: "bg-emotion-calm" },
  joy: { bg: "bg-emotion-joy/10", text: "text-emotion-joy", accent: "bg-emotion-joy" },
  hope: { bg: "bg-emotion-hope/10", text: "text-emotion-hope", accent: "bg-emotion-hope" },
  gratitude: { bg: "bg-emotion-gratitude/10", text: "text-emotion-gratitude", accent: "bg-emotion-gratitude" },
  wonder: { bg: "bg-emotion-wonder/10", text: "text-emotion-wonder", accent: "bg-emotion-wonder" },
  melancholy: { bg: "bg-emotion-melancholy/10", text: "text-emotion-melancholy", accent: "bg-emotion-melancholy" },
}

const AMBIENT_SOUNDS: Record<AmbientSound, string | null> = {
  none: null,
  rain: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112181f.mp3",
  cafe: "https://cdn.pixabay.com/audio/2022/10/30/audio_a573372848.mp3",
  night: "https://cdn.pixabay.com/audio/2022/08/02/audio_54ca0ffa52.mp3",
  ocean: "https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3",
  fireplace: "https://cdn.pixabay.com/audio/2021/08/08/audio_dc39bde808.mp3",
}

export function MemoryCard({ memory, autoPlay = false }: MemoryCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(memory.duration_seconds || 0)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [isMuted, setIsMuted] = useState(false)
  const [ambientVolume, setAmbientVolume] = useState(0.3)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const emotionStyle = EMOTION_STYLES[memory.emotion] || EMOTION_STYLES.calm
  const wordTimestamps = (memory.word_timestamps || []) as WordTimestamp[]

  const updatePlaybackState = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)

      // Find current word based on timestamp
      const wordIndex = wordTimestamps.findIndex(
        (w, i) => time >= w.start && (i === wordTimestamps.length - 1 || time < wordTimestamps[i + 1].start)
      )
      setCurrentWordIndex(wordIndex)

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(updatePlaybackState)
      }
    }
  }, [wordTimestamps, isPlaying])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      ambientRef.current?.pause()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    } else {
      audioRef.current.play()
      if (ambientRef.current && memory.ambient_sound !== "none") {
        ambientRef.current.play()
      }
      animationRef.current = requestAnimationFrame(updatePlaybackState)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    if (ambientRef.current) {
      ambientRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = ambientVolume
    }
  }, [ambientVolume])

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play()
      if (ambientRef.current && memory.ambient_sound !== "none") {
        ambientRef.current.play()
      }
      setIsPlaying(true)
      animationRef.current = requestAnimationFrame(updatePlaybackState)
    }
  }, [autoPlay, memory.ambient_sound, updatePlaybackState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("rounded-2xl p-6 transition-all", emotionStyle.bg)}>
      {/* Hidden audio elements */}
      <audio
        ref={audioRef}
        src={memory.narration_audio_url || ""}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentWordIndex(-1)
          ambientRef.current?.pause()
        }}
      />
      {memory.ambient_sound !== "none" && AMBIENT_SOUNDS[memory.ambient_sound] && (
        <audio
          ref={ambientRef}
          src={AMBIENT_SOUNDS[memory.ambient_sound]!}
          loop
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className={cn("text-xs font-medium uppercase tracking-wider", emotionStyle.text)}>
            {memory.emotion}
          </span>
          <h3 className="text-xl font-semibold mt-1 text-balance">
            {memory.title}
          </h3>
        </div>
        <time className="text-xs text-muted-foreground">
          {new Date(memory.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Story with word highlighting */}
      <div className="mb-8">
        <p className="text-lg leading-relaxed font-light">
          {wordTimestamps.length > 0 ? (
            wordTimestamps.map((word, index) => (
              <span
                key={index}
                className={cn(
                  "transition-all duration-150",
                  index === currentWordIndex && "font-medium",
                  index < currentWordIndex && "opacity-60",
                  index > currentWordIndex && "opacity-40"
                )}
              >
                {word.word}{" "}
              </span>
            ))
          ) : (
            <span>{memory.story}</span>
          )}
        </p>
      </div>

      {/* Playback controls */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums w-10">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className={cn("rounded-full w-14 h-14", emotionStyle.accent, "text-white hover:opacity-90")}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>

          {memory.ambient_sound !== "none" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">
                {memory.ambient_sound}
              </span>
              <Slider
                value={[ambientVolume]}
                max={1}
                step={0.1}
                onValueChange={(v) => setAmbientVolume(v[0])}
                className="w-16"
              />
            </div>
          )}

          {memory.ambient_sound === "none" && <div className="w-20" />}
        </div>
      </div>
    </div>
  )
}
