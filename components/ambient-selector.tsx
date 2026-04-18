"use client"

import { cn } from "@/lib/utils"
import type { AmbientSound } from "@/lib/types"

interface AmbientSelectorProps {
  value: AmbientSound
  onChange: (value: AmbientSound) => void
}

const AMBIENT_OPTIONS: { value: AmbientSound; label: string; icon: string }[] = [
  { value: "none", label: "None", icon: "○" },
  { value: "rain", label: "Rain", icon: "☔" },
  { value: "cafe", label: "Cafe", icon: "☕" },
  { value: "night", label: "Night", icon: "🌙" },
  { value: "ocean", label: "Ocean", icon: "🌊" },
  { value: "fireplace", label: "Fire", icon: "🔥" },
]

export function AmbientSelector({ value, onChange }: AmbientSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Add ambient sound</label>
      <div className="flex flex-wrap gap-2">
        {AMBIENT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
              "border border-border hover:border-foreground/30",
              value === option.value && "bg-foreground text-background border-foreground"
            )}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
