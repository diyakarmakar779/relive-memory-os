import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Memory } from "@/lib/types"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Fetch memories error:", error)
      return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 })
    }

    return NextResponse.json({ memories: data as Memory[] })
  } catch (error) {
    console.error("[v0] Memories GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const { data, error } = await supabase
      .from("memories")
      .insert({
        user_id: user.id,
        original_transcript: body.originalTranscript,
        story: body.story,
        emotion: body.emotion,
        title: body.title,
        original_audio_url: body.originalAudioUrl,
        narration_audio_url: body.narrationUrl,
        word_timestamps: body.wordTimestamps,
        ambient_sound: body.ambientSound || "none",
        duration_seconds: body.duration,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create memory error:", error)
      return NextResponse.json({ error: "Failed to create memory" }, { status: 500 })
    }

    return NextResponse.json({ memory: data as Memory })
  } catch (error) {
    console.error("[v0] Memories POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete memory error:", error)
      return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Memories DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
