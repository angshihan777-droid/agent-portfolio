'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store'
import type { Live2DModel } from '@/store'

interface StoreHydratorProps {
  wallpaper: string
  live2dModel: Live2DModel
  live2dSize: number
  agentName: string
  suggestedQuestions: string[]
  overlayOpacity: number
  chatOpacity: number
  panelOpacity: number
  navOpacity: number
}

export function StoreHydrator({
  wallpaper, live2dModel, live2dSize,
  agentName, suggestedQuestions,
  overlayOpacity, chatOpacity, panelOpacity, navOpacity,
}: StoreHydratorProps) {
  const setWallpaper = useAppStore((s) => s.setWallpaper)
  const setLive2dModel = useAppStore((s) => s.setLive2dModel)
  const setLive2dSize = useAppStore((s) => s.setLive2dSize)
  const setAgentName = useAppStore((s) => s.setAgentName)
  const setSuggestedQuestions = useAppStore((s) => s.setSuggestedQuestions)
  const setOverlayOpacity = useAppStore((s) => s.setOverlayOpacity)
  const setChatOpacity = useAppStore((s) => s.setChatOpacity)
  const setPanelOpacity = useAppStore((s) => s.setPanelOpacity)
  const setNavOpacity = useAppStore((s) => s.setNavOpacity)

  // 首次挂载：从 Server props 注入所有配置
  useEffect(() => {
    setWallpaper(wallpaper)
    setLive2dModel(live2dModel)
    setLive2dSize(live2dSize)
    setAgentName(agentName)
    setSuggestedQuestions(suggestedQuestions)
    setOverlayOpacity(overlayOpacity)
    setChatOpacity(chatOpacity)
    setPanelOpacity(panelOpacity)
    setNavOpacity(navOpacity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 客户端保底：直接 fetch DB 最新配置（绕过 layout 缓存）
  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.overlayOpacity === 'number') setOverlayOpacity(data.overlayOpacity)
        if (typeof data.chatOpacity === 'number')    setChatOpacity(data.chatOpacity)
        if (typeof data.panelOpacity === 'number')   setPanelOpacity(data.panelOpacity)
        if (typeof data.navOpacity === 'number')     setNavOpacity(data.navOpacity)
        if (typeof data.agentName === 'string')      setAgentName(data.agentName)
        if (typeof data.wallpaper === 'string' && data.wallpaper) setWallpaper(data.wallpaper)
      })
      .catch(() => { /* 静默失败，使用 Server props 作为 fallback */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
