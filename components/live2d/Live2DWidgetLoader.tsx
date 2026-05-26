'use client'

import dynamic from 'next/dynamic'
import type { Live2DModel } from '@/store'

interface Props {
  initialModel: Live2DModel
  initialSize: number
}

const Live2DWidget = dynamic(
  () => import('./Live2DWidget').then((m) => m.Live2DWidget),
  { ssr: false }
)

export function Live2DWidgetLoader({ initialModel, initialSize }: Props) {
  return <Live2DWidget initialModel={initialModel} initialSize={initialSize} />
}
