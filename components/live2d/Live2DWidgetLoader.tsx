'use client'

import dynamic from 'next/dynamic'

const Live2DWidget = dynamic(
  () => import('./Live2DWidget').then((m) => m.Live2DWidget),
  { ssr: false }
)

export function Live2DWidgetLoader() {
  return <Live2DWidget />
}
