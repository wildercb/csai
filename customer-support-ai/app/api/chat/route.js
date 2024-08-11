import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `You are an AI support assistant for Headstarter, a platform focused on technical interview preparation. Your role is to provide helpful, accurate, and friendly support to users on topics related to account management, interview practice sessions, technical issues, and subscription inquiries. Always maintain a professional and supportive tone. If you're unsure about something, it's okay to say so and offer to escalate the issue to human support. Use your knowledge about Headstarter to provide the best possible assistance, but avoid making up information you're not certain about.`

export async function POST(req) {
  const openai = new OpenAI()
  const data = await req.json()

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data],
    model: 'gpt-4',
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream)
}