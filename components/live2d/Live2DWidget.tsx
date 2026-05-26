'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAppStore, type Live2DModel } from '@/store'
import { getRandomLine as getStaticLine } from '@/data/live2d-lines'
import { SpeechBubble } from './SpeechBubble'

const MODEL_PATHS: Record<Live2DModel, string> = {
  blanc:  '/live2d/models/blanc/index.json',
  fox:    '/live2d/models/fox/model.json',
  golden: '/live2d/models/golden/model1.json',
}

type LinesByScene = Record<string, string[]>

/** 路径 → enter 场景 */
function pathToEnterScene(path: string): string {
  if (path === '/')               return 'enter-home'
  if (path.startsWith('/projects')) return 'enter-projects'
  if (path.startsWith('/tools'))    return 'enter-tools'
  if (path.startsWith('/about'))    return 'enter-about'
  if (path.startsWith('/admin'))    return 'enter-admin'
  return ''
}

/** 路径 → 页面专属 idle 场景（兜底 idle） */
function pathToIdleScene(path: string): string {
  if (path === '/')               return 'idle-home'
  if (path.startsWith('/projects')) return 'idle-projects'
  if (path.startsWith('/tools'))    return 'idle-tools'
  if (path.startsWith('/about'))    return 'idle-about'
  if (path.startsWith('/admin'))    return 'idle-admin'
  return 'idle'
}

interface Props {
  /** 从 layout 服务端读取的初始模型，避免 store 默认值(blanc)→DB值(golden) 造成双重初始化 */
  initialModel: Live2DModel
  initialSize: number
}

export function Live2DWidget({ initialModel, initialSize }: Props) {
  const widgetRef          = useRef<{ destroy: () => Promise<void> } | null>(null)
  /**
   * l2d-widget 自己创建的 container div（canvas 的父元素），用于同步拖拽 transform。
   * 通过 MutationObserver 精确捕获，不再用 querySelector（可能选中旧/错误元素）。
   */
  const widgetContainerRef = useRef<HTMLElement | null>(null)
  const observerRef        = useRef<MutationObserver | null>(null)
  const linesRef     = useRef<LinesByScene>({})
  /** 当前气泡是否正在展示（防止外部 trigger 覆盖聊天思考提示） */
  const isShowingRef  = useRef(false)
  /** 镜像 live2dLine，供 trigger effect 读取而不产生依赖循环 */
  const liveLineRef   = useRef('')
  /** 记录当前路径，供 idle 定时器用（不触发 widget 重新初始化） */
  const pathnameRef   = useRef('/')
  /** 首次挂载标志：跳过第一次路径 effect，欢迎台词由 init 处理 */
  const firstMountRef = useRef(true)

  const pathname = usePathname()

  const setLive2dLine         = useAppStore((s) => s.setLive2dLine)
  const live2dLine            = useAppStore((s) => s.live2dLine)
  const live2dModel           = useAppStore((s) => s.live2dModel)
  const live2dSize            = useAppStore((s) => s.live2dSize)
  const live2dTriggerScene    = useAppStore((s) => s.live2dTriggerScene)
  const setLive2dTriggerScene = useAppStore((s) => s.setLive2dTriggerScene)

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef    = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const didDragRef = useRef(false)

  // 同步 live2dLine 到 ref，供 trigger effect 安全读取
  useEffect(() => { liveLineRef.current = live2dLine }, [live2dLine])

  // 拖拽位移同步到 l2d-widget 的原生 container div
  useEffect(() => {
    if (widgetContainerRef.current) {
      widgetContainerRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    }
  }, [pos])

  // ── 首次挂载：从 DB 拉取台词 ────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/live2d/lines')
      .then(r => r.json())
      .then((rows: Array<{ text: string; scene: string; weight: number }>) => {
        const grouped: LinesByScene = {}
        rows.forEach(row => {
          if (!grouped[row.scene]) grouped[row.scene] = []
          const count = Math.max(1, Math.round(row.weight))
          for (let i = 0; i < count; i++) grouped[row.scene].push(row.text)
        })
        linesRef.current = grouped
      })
      .catch(() => {})
  }, [])

  // ── 取台词（DB 优先，fallback 静态文件）──────────────────────────────────────
  const getLine = useCallback((scene: string): string => {
    const pool = linesRef.current[scene]
    if (pool && pool.length > 0) return pool[Math.floor(Math.random() * pool.length)]
    return getStaticLine(scene as Parameters<typeof getStaticLine>[0]) ?? ''
  }, [])

  const showLine = useCallback((text: string, duration = 3500) => {
    if (!text) return
    isShowingRef.current = true
    setLive2dLine(text)
    setTimeout(() => {
      setLive2dLine('')
      isShowingRef.current = false
    }, duration)
  }, [setLive2dLine])

  // ── 路径变化：更新 ref + 显示 enter 台词 ────────────────────────────────────
  useEffect(() => {
    pathnameRef.current = pathname

    if (firstMountRef.current) {
      firstMountRef.current = false
      return // 首次挂载跳过，欢迎台词由 init 延迟处理
    }

    const scene = pathToEnterScene(pathname)
    if (scene) {
      const line = getLine(scene)
      if (line) showLine(line, 4000)
    }
  }, [pathname, getLine, showLine])

  // ── 响应外部 triggerScene（卡片 hover 等），不打断已展示内容 ─────────────────
  useEffect(() => {
    if (!live2dTriggerScene) return
    setLive2dTriggerScene(null)
    // 正在展示其他内容（如聊天思考提示）时不打断
    if (liveLineRef.current) return
    const line = getLine(live2dTriggerScene)
    if (line) showLine(line, 2500)
  }, [live2dTriggerScene, getLine, showLine, setLive2dTriggerScene])

  const handleClick = useCallback(() => {
    if (didDragRef.current) return
    const line = getLine('click')
    if (line) showLine(line, 2500)
  }, [getLine, showLine])

  // ── Widget 初始化（模型/大小变化时重新执行）────────────────────────────────
  //
  // 重要设计决策：
  // 1. 使用 initialModel/initialSize（来自 layout 服务端）作为首次渲染的模型，
  //    避免 store 默认值(blanc)→DB值(golden) 造成双重初始化竞态。
  //    store 值变化（如管理员在后台切换模型）仍会触发重新初始化。
  // 2. 用 MutationObserver 捕获 createWidget 创建的 container，
  //    防止 querySelector 选中其他 canvas 或旧 widget 的残留 canvas。
  // 3. 使用 transitionType: 'fade'，destroy() 内部走 setTimeout(1500ms)
  //    而非等待 transitionend，避免在首次 slide-in 前就 destroy 时永久挂死。
  //
  // l2d-widget DOM 结构：
  //   body > div.container(position:fixed;z-index:9999) > canvas
  //   body > div.menu（单独挂载）
  // destroy() 会调用 body.removeChild(container)，canvas 随之移除。
  const effectModel = live2dModel !== initialModel ? live2dModel : initialModel
  const effectSize  = live2dSize  !== initialSize  ? live2dSize  : initialSize

  useEffect(() => {
    let cancelled = false
    let idleTimer: ReturnType<typeof setInterval>
    let containerMutObs: MutationObserver | null = null

    const removeTips = () => {
      document.querySelectorAll(
        '.l2dw-tips-float, .l2dw-tips-in, [class*="l2dw-tips"], [id*="l2dw-tips"]'
      ).forEach(el => {
        if (!(el instanceof HTMLCanvasElement)) (el as HTMLElement).remove()
      })
    }

    async function init() {
      if (typeof window === 'undefined') return
      const { createWidget } = await import('l2d-widget')
      if (cancelled) return

      // 销毁旧 widget（使用 fade 模式时 destroy() 走 setTimeout，不会挂死）
      if (widgetRef.current) {
        widgetContainerRef.current = null
        containerMutObs?.disconnect()
        containerMutObs = null
        await widgetRef.current.destroy().catch(() => {})
        widgetRef.current = null
      }
      if (cancelled) return

      // 在 createWidget 之前设置 MutationObserver，精确捕获本次创建的 container
      containerMutObs = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              const canvas = node.querySelector('canvas')
              if (canvas) {
                widgetContainerRef.current = node
                // 禁用 canvas 的指针事件，由我们的透明遮罩层接管
                ;(canvas as HTMLElement).style.pointerEvents = 'none'
                containerMutObs?.disconnect()
                containerMutObs = null
                break
              }
            }
          }
        }
      })
      containerMutObs.observe(document.body, { childList: true })

      widgetRef.current = createWidget({
        // tips: false → 彻底禁用内置气泡，由 SpeechBubble 统一管理
        model: { path: MODEL_PATHS[effectModel], tips: false },
        position: 'bottom-left',
        size: effectSize,
        primaryColor: 'rgba(96,165,250,0.85)',
        // fade 模式：destroy() 走 setTimeout(transitionDuration) 而非 transitionend
        // 避免在模型未加载时 destroy() 因 transform 无变化而永远等待 transitionend
        transitionType: 'fade',
        transitionDuration: 600,
      })

      if (!cancelled) {
        // 欢迎台词
        setTimeout(() => {
          if (!cancelled) showLine(getLine('enter-home') || '欢迎来到 Ashia 的展示站！', 4000)
        }, 1600)

        // 页面感知的 idle 台词定时器
        idleTimer = setInterval(() => {
          if (!cancelled && !isShowingRef.current) {
            const scene = pathToIdleScene(pathnameRef.current)
            const line  = getLine(scene) || getLine('idle')
            if (line) showLine(line, 4000)
          }
        }, 12000)

        // 启动 tips 清除 observer
        observerRef.current?.disconnect()
        observerRef.current = new MutationObserver(removeTips)
        observerRef.current.observe(document.body, { childList: true })
      }
    }

    setPos({ x: 0, y: 0 })
    init().catch(console.error)

    return () => {
      cancelled = true
      clearInterval(idleTimer)
      containerMutObs?.disconnect()
      containerMutObs = null
      observerRef.current?.disconnect()
      observerRef.current = null
      widgetContainerRef.current = null
      widgetRef.current?.destroy().catch(() => {})
      widgetRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectModel, effectSize])

  // ── 拖拽 ─────────────────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    didDragRef.current = false
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.sx
    const dy = e.clientY - dragRef.current.sy
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDragRef.current = true
    if (!didDragRef.current) return
    const rawX = dragRef.current.ox + dx
    const rawY = dragRef.current.oy + dy
    setPos({
      x: Math.max(0, Math.min(window.innerWidth  - effectSize, rawX)),
      y: Math.max(-(window.innerHeight - effectSize), Math.min(0, rawY)),
    })
  }

  function onPointerUp() {
    dragRef.current = null
    setTimeout(() => { didDragRef.current = false }, 50)
  }

  const transform = `translate(${pos.x}px, ${pos.y}px)`

  return (
    <>
      {/* 气泡容器 — 跟随拖拽 transform，z-index 在 l2d-widget(9999) 之上 */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{ width: effectSize, height: effectSize, transform, zIndex: 10000 }}
      >
        <SpeechBubble text={live2dLine} />
      </div>

      {/* 底部柔和投影 */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{
          width: effectSize, height: 28, transform, zIndex: 9998,
          background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,0,0,0.38) 0%, transparent 70%)',
        }}
      />

      {/* 拖拽 + 点击透明层 — 必须在 l2d-widget canvas(9999) 之上才能拦截事件 */}
      <div
        className="fixed bottom-0 left-0 touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ width: effectSize, height: effectSize, transform, zIndex: 10001 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
      />
    </>
  )
}
