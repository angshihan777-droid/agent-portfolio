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

function pathToEnterScene(path: string): string {
  if (path === '/')                return 'enter-home'
  if (path.startsWith('/projects')) return 'enter-projects'
  if (path.startsWith('/tools'))    return 'enter-tools'
  if (path.startsWith('/about'))    return 'enter-about'
  if (path.startsWith('/admin'))    return 'enter-admin'
  return ''
}

function pathToIdleScene(path: string): string {
  if (path === '/')                return 'idle-home'
  if (path.startsWith('/projects')) return 'idle-projects'
  if (path.startsWith('/tools'))    return 'idle-tools'
  if (path.startsWith('/about'))    return 'idle-about'
  if (path.startsWith('/admin'))    return 'idle-admin'
  return 'idle'
}

interface Props {
  initialModel: Live2DModel
  initialSize:  number
}

export function Live2DWidget({ initialModel, initialSize }: Props) {
  // ── 使用 token 触发重新初始化，避免直接依赖 store 的双重初始化问题 ───────────
  //
  // 问题根源：store 默认值 live2dModel='blanc'，StoreHydrator 将其更新为 DB 值
  // 'golden'。若直接用 [live2dModel, live2dSize] 作为 effect deps，组件会以
  // 错误的默认值初始化一次，再以正确 DB 值初始化一次，造成双重初始化竞态。
  //
  // 解决方案：
  // - targetModel/targetSize 从 layout 服务端传入的 initialModel/initialSize 初始化
  // - 首次挂载后（mountedRef=true）才响应 store 变化
  // - 只有当 store 值真正与当前 target 不同时才递增 token，触发重建
  // - 这样 StoreHydrator 把 store 改成与 initialModel 相同的值时不会触发重建
  //
  const targetModel  = useRef<Live2DModel>(initialModel)
  const targetSize   = useRef<number>(initialSize)
  const mountedRef   = useRef(false)
  const [initToken, setInitToken] = useState(0)

  const live2dModel           = useAppStore((s) => s.live2dModel)
  const live2dSize            = useAppStore((s) => s.live2dSize)
  const live2dLine            = useAppStore((s) => s.live2dLine)
  const live2dTriggerScene    = useAppStore((s) => s.live2dTriggerScene)
  const setLive2dLine         = useAppStore((s) => s.setLive2dLine)
  const setLive2dTriggerScene = useAppStore((s) => s.setLive2dTriggerScene)

  // 监听 store 变化（管理员后台切换模型），跳过首次挂载时的 StoreHydrator 触发
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (live2dModel !== targetModel.current || live2dSize !== targetSize.current) {
      targetModel.current = live2dModel
      targetSize.current  = live2dSize
      setInitToken((n) => n + 1)
    }
  }, [live2dModel, live2dSize])

  const widgetRef          = useRef<{ destroy: () => Promise<void> } | null>(null)
  const widgetContainerRef = useRef<HTMLElement | null>(null)
  const observerRef        = useRef<MutationObserver | null>(null)
  const linesRef           = useRef<LinesByScene>({})
  const isShowingRef       = useRef(false)
  const liveLineRef        = useRef('')
  const pathnameRef        = useRef('/')
  const firstMountRef      = useRef(true)

  const pathname = usePathname()

  useEffect(() => { liveLineRef.current = live2dLine }, [live2dLine])

  // 拖拽位移同步到 l2d-widget 的原生 container div
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef    = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const didDragRef = useRef(false)

  useEffect(() => {
    if (widgetContainerRef.current) {
      widgetContainerRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    }
  }, [pos])

  // 台词
  useEffect(() => {
    fetch('/api/live2d/lines')
      .then((r) => r.json())
      .then((rows: Array<{ text: string; scene: string; weight: number }>) => {
        const grouped: LinesByScene = {}
        rows.forEach((row) => {
          if (!grouped[row.scene]) grouped[row.scene] = []
          const count = Math.max(1, Math.round(row.weight))
          for (let i = 0; i < count; i++) grouped[row.scene].push(row.text)
        })
        linesRef.current = grouped
      })
      .catch(() => {})
  }, [])

  const getLine = useCallback((scene: string): string => {
    const pool = linesRef.current[scene]
    if (pool?.length) return pool[Math.floor(Math.random() * pool.length)]
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

  useEffect(() => {
    pathnameRef.current = pathname
    if (firstMountRef.current) { firstMountRef.current = false; return }
    const scene = pathToEnterScene(pathname)
    if (scene) { const line = getLine(scene); if (line) showLine(line, 4000) }
  }, [pathname, getLine, showLine])

  useEffect(() => {
    if (!live2dTriggerScene) return
    setLive2dTriggerScene(null)
    if (liveLineRef.current) return
    const line = getLine(live2dTriggerScene)
    if (line) showLine(line, 2500)
  }, [live2dTriggerScene, getLine, showLine, setLive2dTriggerScene])

  const handleClick = useCallback(() => {
    if (didDragRef.current) return
    const line = getLine('click')
    if (line) showLine(line, 2500)
  }, [getLine, showLine])

  // ── Widget 核心初始化 ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    let idleTimer: ReturnType<typeof setInterval>
    let containerMutObs: MutationObserver | null = null
    let forceShowTimer: ReturnType<typeof setTimeout>

    const model = targetModel.current
    const size  = targetSize.current

    const removeTips = () => {
      document.querySelectorAll(
        '.l2dw-tips-float, .l2dw-tips-in, [class*="l2dw-tips"], [id*="l2dw-tips"]'
      ).forEach((el) => {
        if (!(el instanceof HTMLCanvasElement)) (el as HTMLElement).remove()
      })
    }

    async function init() {
      if (typeof window === 'undefined') return

      // Load IIFE bundle via <script src> so the Cubism 5/6 runtime injection
      // runs synchronously before module-level enum code references Live2DCubismCore.
      // import('l2d-widget') via Turbopack breaks because the inline script that sets
      // window.Live2DCubismCore executes asynchronously, causing "Live2DCubismCore is not defined".
      await new Promise<void>((resolve, reject) => {
        if ((window as any).__l2dScriptLoaded) { resolve(); return }
        const s = document.createElement('script')
        s.src = '/live2d/l2d-widget.min.js'
        s.onload  = () => { (window as any).__l2dScriptLoaded = true; resolve() }
        s.onerror = () => reject(new Error('Failed to load l2d-widget script'))
        document.head.appendChild(s)
      })
      if (cancelled) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createWidget: typeof import('l2d-widget').createWidget = (window as any).L2D_WIDGET?.createWidget
      if (!createWidget) throw new Error('L2D_WIDGET.createWidget not found on window')
      if (cancelled) return

      if (widgetRef.current) {
        widgetContainerRef.current = null
        containerMutObs?.disconnect()
        containerMutObs = null
        await widgetRef.current.destroy().catch(() => {})
        widgetRef.current = null
      }
      if (cancelled) return

      // MutationObserver 精确捕获本次 createWidget 创建的 container div
      containerMutObs = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.querySelector('canvas')) {
              widgetContainerRef.current = node
              ;(node.querySelector('canvas') as HTMLElement).style.pointerEvents = 'none'
              containerMutObs?.disconnect()
              containerMutObs = null

              // 保险：4 秒后若 container 仍不可见（opacity=0），强制显示
              // 防止 l2d-widget 的 loaded 事件因某种原因未触发
              forceShowTimer = setTimeout(() => {
                if (!cancelled && widgetContainerRef.current) {
                  const c = widgetContainerRef.current
                  if (c.style.opacity !== '1') {
                    console.warn('[Live2D] force-show triggered — "loaded" event may not have fired')
                    c.style.opacity = '1'
                    c.style.transition = 'none'
                  }
                }
              }, 4000)

              break
            }
          }
        }
      })
      containerMutObs.observe(document.body, { childList: true })

      widgetRef.current = createWidget({
        model: { path: MODEL_PATHS[model], tips: false },
        position: 'bottom-left',
        size,
        primaryColor: 'rgba(96,165,250,0.85)',
        // fade 模式：destroy() 走 setTimeout 而非 transitionend，避免挂死
        transitionType: 'fade',
        transitionDuration: 600,
      })

      if (!cancelled) {
        setTimeout(() => {
          if (!cancelled) showLine(getLine('enter-home') || '欢迎来到 Ashia 的展示站！', 4000)
        }, 1800)

        idleTimer = setInterval(() => {
          if (!cancelled && !isShowingRef.current) {
            const scene = pathToIdleScene(pathnameRef.current)
            const line  = getLine(scene) || getLine('idle')
            if (line) showLine(line, 4000)
          }
        }, 12000)

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
      clearTimeout(forceShowTimer)
      containerMutObs?.disconnect()
      containerMutObs = null
      observerRef.current?.disconnect()
      observerRef.current = null
      widgetContainerRef.current = null
      widgetRef.current?.destroy().catch(() => {})
      widgetRef.current = null
    }
  // initToken 变化时重建（来自管理员切换模型），否则只在首次挂载时运行
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initToken])

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
    setPos({
      x: Math.max(0, Math.min(window.innerWidth  - targetSize.current, dragRef.current.ox + dx)),
      y: Math.max(-(window.innerHeight - targetSize.current), Math.min(0, dragRef.current.oy + dy)),
    })
  }
  function onPointerUp() {
    dragRef.current = null
    setTimeout(() => { didDragRef.current = false }, 50)
  }

  const transform = `translate(${pos.x}px, ${pos.y}px)`
  const size = targetSize.current

  return (
    <>
      {/* 气泡 — z-index 在 l2d-widget(9999) 之上 */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{ width: size, height: size, transform, zIndex: 10000 }}
      >
        <SpeechBubble text={live2dLine} />
      </div>

      {/* 底部投影 */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{
          width: size, height: 28, transform, zIndex: 9998,
          background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,0,0,0.38) 0%, transparent 70%)',
        }}
      />

      {/* 拖拽遮罩 — 必须在 canvas(z:9999) 之上 */}
      <div
        className="fixed bottom-0 left-0 touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ width: size, height: size, transform, zIndex: 10001 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
      />
    </>
  )
}
