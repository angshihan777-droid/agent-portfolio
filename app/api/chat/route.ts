import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/agent/chat'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, history, currentPage } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    const result = await chat({ question: question.trim(), history, currentPage })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
