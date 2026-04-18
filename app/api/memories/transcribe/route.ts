import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try getUser first (recommended), fall back to getSession if needed
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log("[v0] Transcribe auth - user:", user?.id, "error:", authError?.message)
    console.log("[v0] ELEVENLABS_API_KEY set:", !!process.env.ELEVENLABS_API_KEY)
    
    if (!user) {
      // Try session as fallback
      const { data: { session } } = await supabase.auth.getSession()
      console.log("[v0] Session fallback - session:", !!session)
      
      if (!session?.user) {
        return NextResponse.json({ 
          error: "Unauthorized", 
          details: authError?.message || "No session found" 
        }, { status: 401 })
      }
    }
    
    const userId = user?.id || (await supabase.auth.getSession()).data.session?.user?.id
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert File to Buffer for ElevenLabs API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create form data for ElevenLabs Scribe API
    const elevenLabsFormData = new FormData()
    elevenLabsFormData.append("file", new Blob([buffer], { type: audioFile.type }), "audio.webm")
    elevenLabsFormData.append("model_id", "scribe_v1")

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: elevenLabsFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ElevenLabs transcription error:", errorText)
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
    }

    const result = await response.json()
    
    // Upload original audio to Supabase Storage
    const fileName = `${userId}/${Date.now()}-original.webm`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, buffer, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload audio" }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("audio")
      .getPublicUrl(fileName)

    return NextResponse.json({
      transcript: result.text,
      originalAudioUrl: publicUrl,
    })
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
