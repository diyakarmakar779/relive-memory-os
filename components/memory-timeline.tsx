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

  // 🧠 MONTHLY INSIGHTS
  const currentMonth = new Date().getMonth()

  const thisMonthMemories = memories.filter((m) => {
    const date = new Date(m.created_at)
    return date.getMonth() === currentMonth
  })

  const emotionCount: Record<string, number> = {}

  thisMonthMemories.forEach((m) => {
    const e = (m.emotion || "other").toLowerCase()
    emotionCount[e] = (emotionCount[e] || 0) + 1
  })

  const dominantEmotion =
    Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  // 📅 GROUP BY DATE
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

      {/* ✨ MONTHLY DASHBOARD */}
      <div className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur">
        <h2 className="text-lg font-medium mb-2">
          ✨ This Month
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          You captured {thisMonthMemories.length} moments
        </p>

        {/* Emotion buckets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(emotionCount).length === 0 && (
            <span className="text-xs text-muted-foreground">
              No data yet
            </span>
          )}

          {Object.entries(emotionCount).map(([emotion, count]) => (
            <span
              key={emotion}
              className="px-3 py-1 text-xs rounded-full bg-foreground/10 capitalize"
            >
              {emotion} • {count}
            </span>
          ))}
        </div>

        {/* Dominant emotion */}
        {dominantEmotion && (
          <p className="text-xs text-muted-foreground">
            Dominant feeling:{" "}
            <span className="text-foreground font-medium capitalize">
              {dominantEmotion}
            </span>
          </p>
        )}
      </div>

      {/* 🧠 TIMELINE */}
      {Object.entries(groupedMemories).map(([date, dateMemories]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {date}
          </h3>

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

                      {/* Emotion dot */}
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

                        <h4 className="font-medium text-balance">
                          {memory.title}
                        </h4>

                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {memory.story}
                        </p>
                      </div>

                      {/* Duration */}
                      {memory.duration_seconds && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {Math.floor(memory.duration_seconds / 60)}:
                          {(memory.duration_seconds % 60)
                            .toString()
                            .padStart(2, "0")}
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
