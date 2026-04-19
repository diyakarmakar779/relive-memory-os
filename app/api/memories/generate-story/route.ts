import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import type { Emotion } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EMOTIONS: Emotion[] = ["nostalgia", "love", "calm", "joy", "hope", "gratitude", "wonder", "melancholy"]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transcript } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
  role: "system",
  content: `You are a memory companion, not a storyteller.

Your task:
1. Take the user's raw voice transcript
2. Clean it slightly for clarity (fix grammar, remove filler words like "um", "uh")
3. DO NOT rewrite or dramatize — preserve the original wording and intent
4. Keep it natural, simple, and real (like how someone would journal)
5. Do NOT add new details, metaphors, or cinematic elements
6. Detect the dominant emotion from this list: ${EMOTIONS.join(", ")}
7. Generate a short, simple title (3-5 words max)

Tone:
- Honest
- Personal
- Minimal
- Raw but readable

Respond ONLY in this exact JSON format:
{
  "story": "Cleaned but original memory",
  "emotion": "detected_emotion",
  "title": "Short Simple Title"
}

Example input:
"I was walking in the park today and like I saw my old friend and it felt really nice we hadn't met in years"

Example output:
{
  "story": "I was walking in the park today and saw my old friend. We hadn’t met in years, and it felt really nice.",
  "emotion": "nostalgia",
  "title": "Meeting After Years"
}`
},
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    const result = JSON.parse(content)
    
    // Validate emotion
    if (!EMOTIONS.includes(result.emotion)) {
      result.emotion = "calm" // Default fallback
    }

    return NextResponse.json({
      story: result.story,
      emotion: result.emotion,
      title: result.title,
    })
  } catch (error) {
    console.error("[v0] Story generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
