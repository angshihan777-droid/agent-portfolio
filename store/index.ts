import { create } from 'zustand'

export type Page = '/' | '/projects' | '/tools' | '/about'
export type Live2DModel = 'blanc' | 'fox' | 'golden'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AppStore {
  currentPage: Page
  setCurrentPage: (page: Page) => void

  chatHistory: Message[]
  addMessage: (msg: Message) => void
  updateMessage: (id: string, content: string) => void
  clearChat: () => void

  firstVisitDone: boolean
  setFirstVisitDone: () => void

  wallpaper: string
  setWallpaper: (url: string) => void

  live2dLine: string
  setLive2dLine: (line: string) => void

  // Live2D 配置（Phase 2 后台可写入）
  live2dModel: Live2DModel
  setLive2dModel: (model: Live2DModel) => void
  live2dSize: number
  setLive2dSize: (size: number) => void

  // 外部组件触发塞塞说话（页面卡片 hover 等）
  live2dTriggerScene: string | null
  setLive2dTriggerScene: (scene: string | null) => void

  // Agent 配置（从 DB 水合）
  agentName: string
  setAgentName: (name: string) => void
  suggestedQuestions: string[]
  setSuggestedQuestions: (qs: string[]) => void

  // 前台透明度（0-100，从 DB 水合）
  overlayOpacity: number   // 壁纸遮罩浓度，默认 30
  setOverlayOpacity: (v: number) => void
  chatOpacity: number      // 聊天窗口不透明度，默认 10
  setChatOpacity: (v: number) => void
  panelOpacity: number     // 卡片/面板背景不透明度，默认 10
  setPanelOpacity: (v: number) => void
  navOpacity: number       // 顶部导航栏不透明度，默认 45
  setNavOpacity: (v: number) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: '/',
  setCurrentPage: (page) => set({ currentPage: page }),

  chatHistory: [],
  addMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
  updateMessage: (id, content) =>
    set((s) => ({
      chatHistory: s.chatHistory.map((m) => (m.id === id ? { ...m, content } : m)),
    })),
  clearChat: () => set({ chatHistory: [] }),

  firstVisitDone: false,
  setFirstVisitDone: () => set({ firstVisitDone: true }),

  wallpaper: '/wallpaper/default.jpg',
  setWallpaper: (url) => set({ wallpaper: url }),

  live2dLine: '',
  setLive2dLine: (line) => set({ live2dLine: line }),

  live2dModel: 'blanc',
  setLive2dModel: (model) => set({ live2dModel: model }),
  live2dSize: 220,
  setLive2dSize: (size) => set({ live2dSize: size }),

  live2dTriggerScene: null,
  setLive2dTriggerScene: (scene) => set({ live2dTriggerScene: scene }),

  agentName: '塞塞',
  setAgentName: (name) => set({ agentName: name }),

  overlayOpacity: 30,
  setOverlayOpacity: (v) => set({ overlayOpacity: v }),
  chatOpacity: 10,
  setChatOpacity: (v) => set({ chatOpacity: v }),
  panelOpacity: 10,
  setPanelOpacity: (v) => set({ panelOpacity: v }),
  navOpacity: 45,
  setNavOpacity: (v) => set({ navOpacity: v }),

  suggestedQuestions: [
    'Ashia 是谁？',
    'Ashia 适合什么岗位？',
    'Ashia 做过哪些 Agent 项目？',
    'Ashia 的技术栈是什么？',
    '有哪些项目可以在线体验？',
    'Ashia 的简历在哪里？',
  ],
  setSuggestedQuestions: (qs) => set({ suggestedQuestions: qs }),
}))
