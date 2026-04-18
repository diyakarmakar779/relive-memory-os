"use client"

import { useState } from "react"
import { MemoryCard } from "./memory-card"
import { cn } from "@/lib/utils"
import type { Memory, Emotion } from "@/lib/types"

interface MemoryTimelineProps {
  memories: Memory[]
}

const EMOTION_COLORS: Record<Emotion, string> = {
  nostalgia: "bg-emotion-nostalgia",
  love: "bg-emotion-love",
  calm: "bg-emotion-calm",
  joy: "bg-emotion-joy",
  hope: "bg-emotion-hope",
  gratitude: "bg-emotion-gratitude",
  wonder: "bg-emotion-wonder",
  melancholy: "bg-emotion-melancholy",
}

export function MemoryTimeline({ memories }: MemoryTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Group memories by date
  const groupedMemories = memories.reduce((acc, memory) => {
    const date = new Date(memory.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)

  return (
    <div className="space-y-12">
      {Object.entries(groupedMemories).map(([date, dateMemories]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
          
          <div className="space-y-4">
            {dateMemories.map((memory) => (
              <div key={memory.id}>
                {expandedId === memory.id ? (
                  <div className="space-y-4">
                    <MemoryCard memory={memory} />
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Collapse
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedId(memory.id)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all">
                      {/* Emotion indicator */}
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full mt-1.5 shrink-0",
                          EMOTION_COLORS[memory.emotion]
                        )}
                      />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {memory.emotion}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.created_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h4 className="font-medium text-balance">{memory.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {memory.story}
                        </p>
                      </div>

                      {/* Duration */}
                      {memory.duration_seconds && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {Math.floor(memory.duration_seconds / 60)}:{(memory.duration_seconds % 60).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
