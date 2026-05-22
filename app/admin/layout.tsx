import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

const navItems = [
  { href: '/admin', label: '仪表盘' },
  { href: '/admin/agent', label: 'Agent 管理' },
  { href: '/admin/projects', label: '项目管理' },
  { href: '/admin/tools', label: '工具管理' },
  { href: '/admin/about', label: '个人信息' },
  { href: '/admin/live2d', label: 'Live2D 台词' },
  { href: '/admin/welcome', label: '欢迎弹窗' },
  { href: '/admin/settings', label: '站点设置' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧导航 */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Ashia Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
