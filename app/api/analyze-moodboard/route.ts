import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, colors } = await req.json()

    // Use GPT-4o only for naming the first color and suggesting a style
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a brand design assistant. Given a color palette, return a JSON object with: mainColor (name and hex of the first color), style (suggested style, e.g. Minimal, Luxury, Playful, etc.). Do NOT generate or change the palette. Do NOT invent new colors.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Given this color palette: ${colors.join(', ')}\nReturn only a JSON object in this format:\n{\n  "mainColor": { "name": "...", "hex": "..." },\n  "style": "..."\n}`
          }
        ]
      }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 300
    })

    const raw = response.choices?.[0]?.message?.content || '{}'
    let clean = raw.trim()
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim()
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim()
    }
    const gptResult = JSON.parse(clean)
    // Always return the original palette as 'colors'
    return NextResponse.json({
      mainColor: gptResult.mainColor,
      style: gptResult.style,
      colors // always the extracted palette
    })
  } catch (err: any) {
    console.error('❌ Moodboard analysis failed:', err.message)
    return NextResponse.json({ error: 'Moodboard analysis error' }, { status: 500 })
  }
} 