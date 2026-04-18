"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ProcessingSteps, type ProcessingStep } from "@/components/processing-steps"
import { AmbientSelector } from "@/components/ambient-selector"
import { MemoryCard } from "@/components/memory-card"
import { Button } from "@/components/ui/button"
import type { Memory, AmbientSound } from "@/lib/types"

export default function NewMemoryPage() {
  const router = useRouter()
  const [step, setStep] = useState<"record" | "processing" | "preview">("record")
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("transcribing")
  const [ambientSound, setAmbientSound] = useState<AmbientSound>("none")
  const [createdMemory, setCreatedMemory] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processRecording = useCallback(async (audioBlob: Blob) => {
    setStep("processing")
    setError(null)

    try {
      // Step 1: Transcribe
      setProcessingStep("transcribing")
      const transcribeFormData = new FormData()
      transcribeFormData.append("audio", audioBlob)
      
      const transcribeRes = await fetch("/api/memories/transcribe", {
        method: "POST",
        body: transcribeFormData,
      })
      
      if (!transcribeRes.ok) {
        throw new Error("Failed to transcribe audio")
      }
      
      const { transcript, originalAudioUrl } = await transcribeRes.json()

      // Step 2: Generate story
      setProcessingStep("generating-story")
      const storyRes = await fetch("/api/memories/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })
      
      if (!storyRes.ok) {
        throw new Error("Failed to generate story")
      }
      
      const { story, emotion, title } = await storyRes.json()

      // Step 3: Generate narration
      setProcessingStep("generating-narration")
      const narrationRes = await fetch("/api/memories/generate-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, emotion }),
      })
      
      if (!narrationRes.ok) {
        throw new Error("Failed to generate narration")
      }
      
      const { narrationUrl, wordTimestamps, duration } = await narrationRes.json()

      // Step 4: Save memory
      setProcessingStep("saving")
      const saveRes = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalTranscript: transcript,
          story,
          emotion,
          title,
          originalAudioUrl,
          narrationUrl,
          wordTimestamps,
          ambientSound,
          duration,
        }),
      })
      
      if (!saveRes.ok) {
        throw new Error("Failed to save memory")
      }
      
      const { memory } = await saveRes.json()
      
      setProcessingStep("complete")
      setCreatedMemory(memory)
      setStep("preview")
      
    } catch (err) {
      console.error("[v0] Processing error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
      setStep("record")
    }
  }, [ambientSound])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {step === "record" && (
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">New Memory</h1>
            <p className="text-muted-foreground">
              Record a moment, thought, or experience
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <VoiceRecorder onRecordingComplete={processRecording} />

          <AmbientSelector value={ambientSound} onChange={setAmbientSound} />
        </div>
      )}

      {step === "processing" && (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Creating your memory</h1>
            <p className="text-muted-foreground">
              Transforming your voice into a cinematic experience
            </p>
          </div>

          <ProcessingSteps currentStep={processingStep} />
        </div>
      )}

      {step === "preview" && createdMemory && (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Memory created</h1>
            <p className="text-muted-foreground">
              Your moment has been transformed
            </p>
          </div>

          <MemoryCard memory={createdMemory} autoPlay />

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => {
              setStep("record")
              setCreatedMemory(null)
              setAmbientSound("none")
            }}>
              Create another
            </Button>
            <Button onClick={() => router.push("/memories")}>
              View all memories
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
