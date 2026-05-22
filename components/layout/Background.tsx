'use client'

import { useAppStore } from '@/store'

export function Background() {
  const wallpaper = useAppStore((s) => s.wallpaper)
  const overlayOpacity = useAppStore((s) => s.overlayOpacity)

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      {/* 半透明遮罩，浓度由后台控制 */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />
    </div>
  )
}
