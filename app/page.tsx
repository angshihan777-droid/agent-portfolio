import { ChatWindow } from '@/components/chat/ChatWindow'
import { ContactSideBar } from '@/components/chat/ContactSideBar'
import { getAbout } from '@/lib/db/about'

export default async function HomePage() {
  const about = await getAbout()
  const contacts = about?.contact ?? []

  return (
    <main className="flex flex-1 flex-col min-h-0 p-4 pb-2">
      {/* relative 容器，让联系方式按钮可以 absolute 定位到右侧 */}
      <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full relative">
        <ChatWindow />

        {/* 联系方式 — 紧贴聊天框右侧，仅大屏显示 */}
        {contacts.length > 0 && (
          <div className="hidden lg:flex absolute top-0 left-full ml-3 flex-col gap-2">
            <ContactSideBar contacts={contacts} />
          </div>
        )}
      </div>
    </main>
  )
}
