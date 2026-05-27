'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import type { Live2DModel } from '@/store'

const inputCls = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500'

export function SettingsClient({
  wallpaper: initWallpaper,
  live2dModel: initModel,
  live2dSize: initSize,
  initOverlayOpacity,
  initChatOpacity,
  initPanelOpacity,
  initNavOpacity,
}: {
  wallpaper: string
  live2dModel: Live2DModel
  live2dSize: number
  initOverlayOpacity: number
  initChatOpacity: number
  initPanelOpacity: number
  initNavOpacity: number
}) {
  const [wallpaper, setWallpaper] = useState(initWallpaper)
  const setStoreWallpaper = useAppStore((s) => s.setWallpaper)
  const [model, setModel] = useState<Live2DModel>(initModel)
  const [size, setSize] = useState(initSize)
  const [uploading, setUploading] = useState(false)
  const [live2dSaved, setLive2dSaved] = useState(false)

  const DEFAULTS = { overlay: 30, chat: 10, panel: 10, nav: 45 }
  const [overlayOpacity, setOverlayOpacity] = useState<number>(initOverlayOpacity ?? DEFAULTS.overlay)
  const [chatOpacity, setChatOpacity] = useState<number>(initChatOpacity ?? DEFAULTS.chat)
  const [panelOpacity, setPanelOpacity] = useState<number>(initPanelOpacity ?? DEFAULTS.panel)
  const [navOpacity, setNavOpacity] = useState<number>(initNavOpacity ?? DEFAULTS.nav)
  const [appearanceSaved, setAppearanceSaved] = useState(false)
  const [appearanceSaving, setAppearanceSaving] = useState(false)

  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwdLoading, setPwdLoading] = useState(false)

  const [uploadError, setUploadError] = useState('')

  async function uploadWallpaper(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'wallpaper')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? `上传失败（HTTP ${res.status}）`)
        return
      }
      setWallpaper(data.url)        // 更新本地预览
      setStoreWallpaper(data.url)   // 同步到全局 Zustand store → Background 立即生效
    } catch (err) {
      setUploadError(String(err))
    } finally {
      setUploading(false)
    }
  }

  async function uploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    form.append('type', 'resume')
    await fetch('/api/admin/upload', { method: 'POST', body: form })
    alert('简历上传成功')
  }

  async function changePassword() {
    setPwdLoading(true)
    setPwdMsg(null)
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
    })
    const data = await res.json()
    if (res.ok) {
      setPwdMsg({ ok: true, text: '密码修改成功' })
      setOldPwd('')
      setNewPwd('')
    } else {
      setPwdMsg({ ok: false, text: data.error ?? '修改失败' })
    }
    setPwdLoading(false)
  }

  async function saveAppearance(
    ov = overlayOpacity,
    ch = chatOpacity,
    pn = panelOpacity,
    nv = navOpacity,
  ) {
    setAppearanceSaving(true)
    await fetch('/api/admin/appearance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overlayOpacity: ov, chatOpacity: ch, panelOpacity: pn, navOpacity: nv }),
    })
    setAppearanceSaving(false)
    setAppearanceSaved(true)
    setTimeout(() => setAppearanceSaved(false), 2000)
  }

  async function resetToDefaults() {
    setOverlayOpacity(DEFAULTS.overlay)
    setChatOpacity(DEFAULTS.chat)
    setPanelOpacity(DEFAULTS.panel)
    setNavOpacity(DEFAULTS.nav)
    await saveAppearance(DEFAULTS.overlay, DEFAULTS.chat, DEFAULTS.panel, DEFAULTS.nav)
  }

  async function saveLive2D() {
    await fetch('/api/admin/live2d/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, size }),
    })
    setLive2dSaved(true)
    setTimeout(() => setLive2dSaved(false), 2000)
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800">站点设置</h1>

      {/* 壁纸 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-medium text-gray-800">背景壁纸</h2>
        <p className="text-xs text-gray-500">当前：<code>{wallpaper}</code></p>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 transition-colors">
            {uploading ? '上传中...' : '选择图片上传'}
          </span>
          <input type="file" accept="image/*" onChange={uploadWallpaper} className="hidden" />
        </label>
        {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
        {wallpaper && (
          <div>
            <p className="text-xs text-gray-400 mb-1.5">预览（壁纸效果在<a href="/" target="_blank" className="text-blue-500 underline">前台页面</a>展示）</p>
            <img
              src={wallpaper}
              alt="壁纸预览"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
      </section>

      {/* 前台透明度 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium text-gray-800">前台透明度</h2>
            <p className="text-xs text-gray-400 mt-0.5">控制前台各元素的透明/不透明程度</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={resetToDefaults}
              disabled={appearanceSaving}
              className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title={`恢复默认值：遮罩 ${DEFAULTS.overlay}% · 聊天 ${DEFAULTS.chat}% · 面板 ${DEFAULTS.panel}% · 导航 ${DEFAULTS.nav}%`}
            >
              恢复默认
            </button>
            <button
              onClick={() => saveAppearance()}
              disabled={appearanceSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {appearanceSaved ? '已保存 ✓' : appearanceSaving ? '保存中…' : '保存'}
            </button>
          </div>
        </div>

        {/* 壁纸遮罩浓度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">壁纸遮罩浓度</label>
            <div className="flex items-center gap-2">
              {overlayOpacity !== DEFAULTS.overlay && (
                <span className="text-xs text-gray-300">默认 {DEFAULTS.overlay}%</span>
              )}
              <span className="text-sm font-mono text-gray-600 w-10 text-right">{overlayOpacity}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">壁纸上的黑色覆盖层，越高壁纸越暗、文字越清晰</p>
          <input
            type="range" min={0} max={80} step={1}
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-300">
            <span>透明</span><span>较暗</span><span>全黑</span>
          </div>
        </div>

        {/* 聊天窗口不透明度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">聊天窗口不透明度</label>
            <div className="flex items-center gap-2">
              {chatOpacity !== DEFAULTS.chat && (
                <span className="text-xs text-gray-300">默认 {DEFAULTS.chat}%</span>
              )}
              <span className="text-sm font-mono text-gray-600 w-10 text-right">{chatOpacity}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">首页聊天窗口的背景白色浓度，与其他面板独立控制</p>
          <input
            type="range" min={0} max={50} step={1}
            value={chatOpacity}
            onChange={(e) => setChatOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-300">
            <span>全透明</span><span>磨砂感</span><span>较不透明</span>
          </div>
        </div>

        {/* 面板不透明度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">玻璃面板不透明度</label>
            <div className="flex items-center gap-2">
              {panelOpacity !== DEFAULTS.panel && (
                <span className="text-xs text-gray-300">默认 {DEFAULTS.panel}%</span>
              )}
              <span className="text-sm font-mono text-gray-600 w-10 text-right">{panelOpacity}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">项目卡片、工具卡片等面板的背景白色浓度，越高面板越不透明</p>
          <input
            type="range" min={0} max={50} step={1}
            value={panelOpacity}
            onChange={(e) => setPanelOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-300">
            <span>全透明</span><span>磨砂感</span><span>较不透明</span>
          </div>
        </div>

        {/* 导航栏不透明度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">顶部导航栏不透明度</label>
            <div className="flex items-center gap-2">
              {navOpacity !== DEFAULTS.nav && (
                <span className="text-xs text-gray-300">默认 {DEFAULTS.nav}%</span>
              )}
              <span className="text-sm font-mono text-gray-600 w-10 text-right">{navOpacity}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">顶部导航栏背景黑色浓度，越低导航越通透</p>
          <input
            type="range" min={0} max={80} step={1}
            value={navOpacity}
            onChange={(e) => setNavOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-300">
            <span>全透明</span><span>半透明</span><span>较深</span>
          </div>
        </div>
      </section>

      {/* Live2D */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-800">Live2D 配置</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">模型</label>
            <select value={model} onChange={(e) => setModel(e.target.value as Live2DModel)} className={inputCls}>
              <option value="blanc">blanc（超次元·白）</option>
              <option value="fox">fox（狐耳少女）</option>
              <option value="golden">golden（少女前线）</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">大小（px）</label>
            <input type="number" value={size} min={120} max={320} onChange={(e) => setSize(Number(e.target.value))} className={`${inputCls} w-24`} />
          </div>
        </div>
        <button onClick={saveLive2D} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {live2dSaved ? '已保存 ✓' : '保存'}
        </button>
      </section>

      {/* 修改密码 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-800">修改密码</h2>
        <div className="flex flex-col gap-3 max-w-xs">
          <input type="password" placeholder="旧密码" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} className={inputCls} />
          <input type="password" placeholder="新密码（至少 6 位）" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={changePassword} disabled={pwdLoading || !oldPwd || !newPwd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {pwdLoading ? '保存中...' : '确认修改'}
          </button>
          {pwdMsg && <span className={`text-sm ${pwdMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{pwdMsg.text}</span>}
        </div>
      </section>

      {/* 简历 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-medium text-gray-800">简历 PDF</h2>
        <p className="text-xs text-gray-500">上传后覆盖 /uploads/resume/resume.pdf</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 transition-colors">选择 PDF 上传</span>
          <input type="file" accept=".pdf" onChange={uploadResume} className="hidden" />
        </label>
      </section>
    </div>
  )
}
