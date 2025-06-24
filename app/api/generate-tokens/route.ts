// ✅ app/api/generate-tokens/route.ts (updated to use base64 image)
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const {
      brandName,
      purpose,
      values,
      niche,
      theme,
      warmth,
      brightness,
      typography,
      moodboardImageBase64
    } = await req.json()

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a brand design assistant. Generate a valid JSON design token set based on the brand input and moodboard image. Return only a JSON object in the following format.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please return only a JSON object in this format:

{
  "color": { "primary": "...", "background": "...", "text": "..." },
  "font": { "family": "...", "base": "...", "h1": "..." },
  "spacing": { "sm": "...", "md": "...", "lg": "..." },
  "radius": { "md": "..." },
  "illustrations": ["3D illustration prompt or URL 1", "3D illustration prompt or URL 2", "3D illustration prompt or URL 3"]
}

Do not include markdown or explanation.

Brand Name: ${brandName}
Purpose: ${purpose}
Values: ${values}
Niche: ${niche}
Theme: ${theme}
Warmth: ${warmth}
Brightness: ${brightness}
Typography: ${typography}`.trim()
          },
          moodboardImageBase64
            ? {
                type: 'image_url',
                image_url: {
                  url: moodboardImageBase64
                }
              }
            : undefined
        ].filter(Boolean) as OpenAI.ChatCompletionContentPart[]
      }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000
    })

    const raw = response.choices?.[0]?.message?.content || '{}'
    console.log('🧠 GPT-4 Output:', raw)

    let clean = raw.trim()
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim()
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim()
    }

    const tokens = JSON.parse(clean)
    return NextResponse.json({ tokens })
  } catch (err: any) {
    console.error('❌ GPT token generation failed:', err.message)
    return NextResponse.json({ error: 'Token generation error' }, { status: 500 })
  }
}