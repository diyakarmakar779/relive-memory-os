"use client"

import { useState, useMemo } from "react"
import { MemoryCard } from "./memory-card"
import { cn } from "@/lib/utils"
import type { Memory, Emotion } from "@/lib/types"

interface EmotionMapProps {
  memories: Memory[]
}

const EMOTIONS: { 
  id: Emotion
  label: string
  color: string
  bgColor: string
  description: string
}[] = [
  { id: "joy", label: "Joy", color: "text-emotion-joy", bgColor: "bg-emotion-joy", description: "Moments of happiness" },
  { id: "love", label: "Love", color: "text-emotion-love", bgColor: "bg-emotion-love", description: "Deep connections" },
  { id: "nostalgia", label: "Nostalgia", color: "text-emotion-nostalgia", bgColor: "bg-emotion-nostalgia", description: "Bittersweet memories" },
  { id: "calm", label: "Calm", color: "text-emotion-calm", bgColor: "bg-emotion-calm", description: "Peaceful moments" },
  { id: "hope", label: "Hope", color: "text-emotion-hope", bgColor: "bg-emotion-hope", description: "Looking forward" },
  { id: "gratitude", label: "Gratitude", color: "text-emotion-gratitude", bgColor: "bg-emotion-gratitude", description: "Thankful feelings" },
  { id: "wonder", label: "Wonder", color: "text-emotion-wonder", bgColor: "bg-emotion-wonder", description: "Awe and discovery" },
  { id: "melancholy", label: "Melancholy", color: "text-emotion-melancholy", bgColor: "bg-emotion-melancholy", description: "Reflective sadness" },
]

export function EmotionMap({ memories }: EmotionMapProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null)

  // Group memories by emotion
  const memoriesByEmotion = useMemo(() => {
    return memories.reduce((acc, memory) => {
      if (!acc[memory.emotion]) acc[memory.emotion] = []
      acc[memory.emotion].push(memory)
      return acc
    }, {} as Record<Emotion, Memory[]>)
  }, [memories])

  // Get emotions that have memories
  const activeEmotions = EMOTIONS.filter(e => memoriesByEmotion[e.id]?.length > 0)

  // Get memories for selected emotion or all
  const displayedMemories = selectedEmotion 
    ? memoriesByEmotion[selectedEmotion] || []
    : memories

  return (
    <div className="space-y-8">
      {/* Emotion Clusters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeEmotions.map((emotion) => {
          const count = memoriesByEmotion[emotion.id]?.length || 0
          const isSelected = selectedEmotion === emotion.id
          
          return (
            <button
              key={emotion.id}
              onClick={() => setSelectedEmotion(isSelected ? null : emotion.id)}
              className={cn(
                "group relative p-4 rounded-2xl border transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected 
                  ? "border-foreground/20 bg-card shadow-lg" 
                  : "border-border bg-card/50 hover:border-foreground/10"
              )}
            >
              {/* Emotion color accent */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-10 transition-opacity",
                  emotion.bgColor,
                  isSelected ? "opacity-20" : "group-hover:opacity-15"
                )} 
              />
              
              <div className="relative space-y-2">
                {/* Emotion indicator dots */}
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", emotion.bgColor)} />
                  <span className="text-sm font-medium">{emotion.label}</span>
                </div>
                
                {/* Count and description */}
                <div className="space-y-0.5">
                  <p className="text-2xl font-semibold tabular-nums">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {count === 1 ? "memory" : "memories"}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className={cn("w-2 h-2 rounded-full", emotion.bgColor)} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty emotions hint */}
      {activeEmotions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Your emotion map will appear here as you create memories.</p>
        </div>
      )}

      {/* Selected emotion header */}
      {selectedEmotion && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              EMOTIONS.find(e => e.id === selectedEmotion)?.bgColor
            )} />
            <h2 className="text-lg font-medium capitalize">{selectedEmotion}</h2>
            <span className="text-sm text-muted-foreground">
              {displayedMemories.length} {displayedMemories.length === 1 ? "memory" : "memories"}
            </span>
          </div>
          <button
            onClick={() => setSelectedEmotion(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Show all
          </button>
        </div>
      )}

      {/* Memory Cards */}
      {displayedMemories.length > 0 && (
        <div className="space-y-4">
          {displayedMemories.map((memory) => (
            <div key={memory.id}>
              {expandedMemoryId === memory.id ? (
                <div className="space-y-4">
                  <MemoryCard memory={memory} />
                  <button
                    onClick={() => setExpandedMemoryId(null)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Collapse
                  </button>
                </div>
              ) : (
                <MemoryPreview 
                  memory={memory} 
                  onExpand={() => setExpandedMemoryId(memory.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MemoryPreview({ 
  memory, 
  onExpand 
}: { 
  memory: Memory
  onExpand: () => void 
}) {
  const emotion = EMOTIONS.find(e => e.id === memory.emotion)
  
  return (
    <button
      onClick={onExpand}
      className="w-full text-left group"
    >
      <div className={cn(
        "relative p-5 rounded-xl border border-border bg-card",
        "hover:border-foreground/20 transition-all duration-200",
        "overflow-hidden"
      )}>
        {/* Subtle emotion gradient accent */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 opacity-60",
            emotion?.bgColor
          )} 
        />
        
        <div className="flex items-start gap-4">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", emotion?.bgColor)} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {memory.emotion}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(memory.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            
            <h3 className="font-medium text-balance leading-snug">
              {memory.title || "Untitled Memory"}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {memory.story}
            </p>
          </div>

          {/* Play indicator */}
          <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
            <svg 
              className="w-4 h-4 text-muted-foreground ml-0.5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}
