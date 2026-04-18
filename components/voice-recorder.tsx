"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isProcessing?: boolean
}

export function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      setAudioLevel(average / 255)
    }
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio analyzer for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType 
        })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
      }
      
      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    } catch (error) {
      console.error("[v0] Microphone access error:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioLevel(0)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Recording visualization */}
      <div className="relative">
        {/* Outer pulsing ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-150",
            isRecording && "animate-pulse"
          )}
          style={{
            transform: `scale(${1 + audioLevel * 0.5})`,
            backgroundColor: isRecording ? `rgba(0, 0, 0, ${0.05 + audioLevel * 0.1})` : "transparent",
          }}
        />
        
        {/* Main button */}
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "relative z-10 w-24 h-24 rounded-full transition-all duration-200",
            isRecording && "bg-foreground hover:bg-foreground/90"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        {isProcessing ? (
          <p className="text-muted-foreground">Processing your memory...</p>
        ) : isRecording ? (
          <>
            <p className="text-2xl font-light tabular-nums tracking-tight">
              {formatDuration(duration)}
            </p>
            <p className="text-sm text-muted-foreground">Recording... tap to stop</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">Tap to record</p>
            <p className="text-sm text-muted-foreground">
              Share a moment, thought, or memory
            </p>
          </>
        )}
      </div>
    </div>
  )
}
