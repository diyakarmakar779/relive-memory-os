import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MemoryTimeline } from "@/components/memory-timeline"
import type { Memory } from "@/lib/types"

export default async function MemoriesPage() {
  const supabase = await createClient()
  
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching memories:", error)
  }

  const memoryList = (memories || []) as Memory[]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {memoryList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">No memories yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Start by recording your first memory. Speak about a moment, thought, or experience.
          </p>
          <Button asChild size="lg">
            <Link href="/memories/new">Create your first memory</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Your Memories</h1>
            <span className="text-sm text-muted-foreground">
              {memoryList.length} {memoryList.length === 1 ? "memory" : "memories"}
            </span>
          </div>
          
          <MemoryTimeline memories={memoryList} />
        </div>
      )}
    </div>
  )
}
