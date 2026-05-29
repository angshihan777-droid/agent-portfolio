import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 大数字 */}
        <div className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500 select-none">
          404
        </div>

        {/* 文字 */}
        <div className="space-y-2">
          <p className="text-white text-xl font-semibold">哎呀，迷路了 (｡•́︿•̀｡)</p>
          <p className="text-white/50 text-sm leading-relaxed">
            这个页面不存在，或者已经被塞塞悄悄藏起来了～
          </p>
        </div>

        {/* 返回按钮 */}
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            回到首页
          </Link>
          <Link
            href="/projects"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm transition-colors border border-white/10"
          >
            看看项目
          </Link>
        </div>
      </div>
    </div>
  )
}
