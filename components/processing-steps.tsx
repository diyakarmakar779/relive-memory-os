"use client"

import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProcessingStep = 
  | "transcribing"
  | "generating-story"
  | "generating-narration"
  | "saving"
  | "complete"

interface ProcessingStepsProps {
  currentStep: ProcessingStep
}

const STEPS = [
  { id: "transcribing", label: "Transcribing your voice" },
  { id: "generating-story", label: "Crafting your story" },
  { id: "generating-narration", label: "Creating narration" },
  { id: "saving", label: "Saving memory" },
]

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)
  const isComplete = currentStep === "complete"

  return (
    <div className="space-y-4 py-8">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep
        const isDone = isComplete || index < currentIndex

        return (
          <div key={step.id} className="flex items-center gap-4">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isDone && "bg-foreground text-background",
                isActive && "bg-muted border-2 border-foreground",
                !isDone && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? (
                <Check className="w-4 h-4" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                isDone && "text-foreground",
                isActive && "text-foreground font-medium",
                !isDone && !isActive && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
