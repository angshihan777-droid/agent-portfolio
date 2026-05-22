import { getAllConfigs } from '@/lib/db/config'
import { getLive2DConfig } from '@/lib/db/live2d'
import { SettingsClient } from './SettingsClient'

export default async function AdminSettingsPage() {
  const [configs, live2d] = await Promise.all([getAllConfigs(), getLive2DConfig()])

  return (
    <SettingsClient
      wallpaper={configs.wallpaper ?? '/wallpaper/default.jpg'}
      live2dModel={live2d.model}
      live2dSize={live2d.size}
      initOverlayOpacity={configs.overlayOpacity !== undefined ? Number(configs.overlayOpacity) : 30}
      initChatOpacity={configs.chatOpacity     !== undefined ? Number(configs.chatOpacity)    : 10}
      initPanelOpacity={configs.panelOpacity   !== undefined ? Number(configs.panelOpacity)   : 10}
      initNavOpacity={configs.navOpacity      !== undefined ? Number(configs.navOpacity)      : 45}
    />
  )
}
