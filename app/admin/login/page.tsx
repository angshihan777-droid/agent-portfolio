'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      // 使用硬跳转而非 router.push：
      // router.push 触发 RSC 加载（仪表盘数据查询可能需要数秒），
      // 期间 setLoading(false) 已执行，页面看起来没反应，用户误以为未登录。
      // window.location.href 触发完整页面加载，浏览器自带进度条，用户体验明确。
      window.location.href = '/admin'
      return // 不再 setLoading(false)，保持 loading 状态直到页面卸载
    } else {
      setError('密码错误')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">后台登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="管理员密码"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            required
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
