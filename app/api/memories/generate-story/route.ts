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
          content: `You are a poetic storyteller who transforms spoken thoughts into emotionally rich, cinematic micro-stories. 

Your task:
1. Take the user's raw voice transcript
2. Rewrite it as a short, evocative story (2-4 sentences max)
3. Preserve the core meaning but add sensory details and emotional depth
4. Write in first person, present tense for immediacy
5. Detect the dominant emotion from this list: ${EMOTIONS.join(", ")}
6. Generate a short, evocative title (3-5 words)

Respond ONLY in this exact JSON format:
{
  "story": "Your rewritten story here",
  "emotion": "detected_emotion",
  "title": "Short Evocative Title"
}

Example input: "I was walking in the park today and saw my old friend from college. We hadn't seen each other in years."

Example output:
{
  "story": "I am walking through the park when time folds in on itself. There he is—the same crooked smile, the same way he tilts his head when he laughs. Ten years dissolve like morning fog, and for a moment, we are young again.",
  "emotion": "nostalgia",
  "title": "When Time Folded"
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
