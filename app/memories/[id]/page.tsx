import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MemoryCard } from "@/components/memory-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { Memory } from "@/lib/types"
import { DeleteMemoryButton } from "./delete-button"

interface MemoryPageProps {
  params: Promise<{ id: string }>
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: memory, error } = await supabase
    .from("memories")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !memory) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/memories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        
        <DeleteMemoryButton memoryId={memory.id} />
      </div>

      <MemoryCard memory={memory as Memory} />

      {/* Original transcript */}
      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
          Original recording
        </h4>
        <p className="text-sm text-muted-foreground italic">
          &quot;{memory.original_transcript}&quot;
        </p>
      </div>
    </div>
  )
}
