import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig } from '@/lib/db/config'

const DEFAULT_QUESTIONS = [
  'Ashia 是谁？',
  'Ashia 适合什么岗位？',
  'Ashia 做过哪些 Agent 项目？',
  'Ashia 的技术栈是什么？',
  '有哪些项目可以在线体验？',
  'Ashia 的简历在哪里？',
]

export async function GET() {
  const [agentName, questionsJson] = await Promise.all([
    getConfig('agentName'),
    getConfig('suggestedQuestions'),
  ])
  const suggestedQuestions = questionsJson
    ? (() => { try { return JSON.parse(questionsJson) } catch { return DEFAULT_QUESTIONS } })()
    : DEFAULT_QUESTIONS
  return NextResponse.json({ agentName: agentName ?? '塞塞', suggestedQuestions })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const updates: Promise<void>[] = []
  if (typeof body.agentName === 'string') {
    updates.push(setConfig('agentName', body.agentName))
  }
  if (Array.isArray(body.suggestedQuestions)) {
    updates.push(setConfig('suggestedQuestions', JSON.stringify(body.suggestedQuestions)))
  }
  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}
