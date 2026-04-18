import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { WordTimestamp } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { story, emotion } = await request.json()
    
    if (!story) {
      return NextResponse.json({ error: "No story provided" }, { status: 400 })
    }

    // Select voice based on emotion for variety
    const voiceMap: Record<string, string> = {
      nostalgia: "pFZP5JQG7iQjIQuC4Bku", // Lily
      love: "jsCqWAovK2LkecY7zXl4", // Freya
      calm: "onwK4e9ZLuTAKqWW03F9", // Daniel
      joy: "XB0fDUnXU5powFXDhCwa", // Charlotte
      hope: "pFZP5JQG7iQjIQuC4Bku", // Lily
      gratitude: "onwK4e9ZLuTAKqWW03F9", // Daniel
      wonder: "jsCqWAovK2LkecY7zXl4", // Freya
      melancholy: "onwK4e9ZLuTAKqWW03F9", // Daniel
    }

    const voiceId = voiceMap[emotion] || "onwK4e9ZLuTAKqWW03F9"

    // Generate narration with timestamps using ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: story,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ElevenLabs narration error:", errorText)
      return NextResponse.json({ error: "Narration generation failed" }, { status: 500 })
    }

    const result = await response.json()
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(result.audio_base64, "base64")
    
    // Upload narration to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-narration.mp3`
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload narration" }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("audio")
      .getPublicUrl(fileName)

    // Process word timestamps from ElevenLabs response
    const wordTimestamps: WordTimestamp[] = []
    let charIndex = 0
    
    if (result.alignment) {
      const { characters, character_start_times_seconds, character_end_times_seconds } = result.alignment
      
      // Group characters into words
      let currentWord = ""
      let wordStart = 0
      
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i]
        
        if (char === " " || i === characters.length - 1) {
          if (i === characters.length - 1 && char !== " ") {
            currentWord += char
          }
          
          if (currentWord.trim()) {
            wordTimestamps.push({
              word: currentWord.trim(),
              start: wordStart,
              end: character_end_times_seconds[i - 1] || character_end_times_seconds[i],
            })
          }
          
          currentWord = ""
          wordStart = character_start_times_seconds[i + 1] || 0
        } else {
          if (currentWord === "") {
            wordStart = character_start_times_seconds[i]
          }
          currentWord += char
        }
      }
    }

    // Calculate duration
    const duration = wordTimestamps.length > 0 
      ? Math.ceil(wordTimestamps[wordTimestamps.length - 1].end)
      : 0

    return NextResponse.json({
      narrationUrl: publicUrl,
      wordTimestamps,
      duration,
    })
  } catch (error) {
    console.error("[v0] Narration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
