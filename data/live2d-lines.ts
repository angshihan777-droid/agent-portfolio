export type TriggerScene =
  | 'idle'
  | 'idle-home'
  | 'idle-projects'
  | 'idle-tools'
  | 'idle-about'
  | 'idle-admin'
  | 'click'
  | 'enter-home'
  | 'enter-projects'
  | 'enter-tools'
  | 'enter-about'
  | 'enter-admin'
  | 'long-stay'
  | 'hover-project'
  | 'hover-tool'

export interface Live2DLine {
  text: string
  scene: TriggerScene
  weight: number
  enabled: boolean
}

export const live2dLines: Live2DLine[] = [
  // ── idle 通用（各页兜底）──────────────────────────────────────────────────
  { text: 'Ashia 最近在研究 Agent 工具调用哦 ✨', scene: 'idle', weight: 1, enabled: true },
  { text: '找 Agent 方向的人才，可以考虑 Ashia (◕‿◕✿)', scene: 'idle', weight: 1, enabled: true },

  // ── idle-home ─────────────────────────────────────────────────────────────
  { text: '有什么想了解的，直接问右边的 Agent 吧 ✨', scene: 'idle-home', weight: 1, enabled: true },
  { text: '如果你是 HR，Agent 可以帮你快速了解 Ashia (◕‿◕✿)', scene: 'idle-home', weight: 1, enabled: true },
  { text: '点推荐问题或者直接输入，塞塞帮你转达 ヾ(≧▽≦*)o', scene: 'idle-home', weight: 1, enabled: true },

  // ── idle-projects ─────────────────────────────────────────────────────────
  { text: '要不要仔细看看 Ashia 的项目 ✨', scene: 'idle-projects', weight: 1, enabled: true },
  { text: 'Agent 相关的项目是塞塞最喜欢介绍的 (◕‿◕✿)', scene: 'idle-projects', weight: 1, enabled: true },
  { text: '点击卡片可以看更多项目详情哦！', scene: 'idle-projects', weight: 1, enabled: true },
  { text: 'Ashia 的项目都有 GitHub 链接，欢迎 star ⭐', scene: 'idle-projects', weight: 0.8, enabled: true },

  // ── idle-tools ────────────────────────────────────────────────────────────
  { text: '这里藏着 Ashia 收藏的好用工具 ✨', scene: 'idle-tools', weight: 1, enabled: true },
  { text: '工具页有不少宝贝，慢慢逛逛 (◕‿◕✿)', scene: 'idle-tools', weight: 1, enabled: true },
  { text: 'Cursor + DeepSeek 是 Ashia 最爱的组合！', scene: 'idle-tools', weight: 1, enabled: true },

  // ── idle-about ────────────────────────────────────────────────────────────
  { text: '简历就在这里，可以下载带走哦 ✨', scene: 'idle-about', weight: 1, enabled: true },
  { text: 'Ashia 期待和你合作 ヾ(≧▽≦*)o', scene: 'idle-about', weight: 1, enabled: true },
  { text: '联系方式在右侧，点击可以直接复制 (◕‿◕✿)', scene: 'idle-about', weight: 1, enabled: true },

  // ── click — 害羞颜文字 ────────────────────────────────────────────────────
  { text: '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄', scene: 'click', weight: 1, enabled: true },
  { text: '(///ω///)', scene: 'click', weight: 1, enabled: true },
  { text: '(。ŏ_ŏ) 突然被戳到了…', scene: 'click', weight: 1, enabled: true },
  { text: '(*≧ω≦) 呜…', scene: 'click', weight: 1, enabled: true },
  { text: '(⁄ ⁄>⁄ω⁄<⁄ ⁄)', scene: 'click', weight: 1, enabled: true },

  // ── enter 页面进入 ────────────────────────────────────────────────────────
  { text: '欢迎来到 Ashia 的展示站！(◕‿◕✿)', scene: 'enter-home', weight: 1, enabled: true },
  { text: '有什么想了解的，直接问 Agent 吧！', scene: 'enter-home', weight: 1, enabled: true },

  { text: '这里展示了 Ashia 做过的项目 ✨', scene: 'enter-projects', weight: 1, enabled: true },
  { text: 'RAG 知识库系统是最近的重点项目哦！', scene: 'enter-projects', weight: 1, enabled: true },

  { text: '这里收藏了一些好用的工具和资源 (◕‿◕✿)', scene: 'enter-tools', weight: 1, enabled: true },
  { text: 'Cursor + DeepSeek 是 Ashia 最喜欢的组合！', scene: 'enter-tools', weight: 1, enabled: true },

  { text: '简历都在这里，可以下载带走哦 ✨', scene: 'enter-about', weight: 1, enabled: true },
  { text: 'Ashia 期待和你合作～', scene: 'enter-about', weight: 1, enabled: true },

  // ── hover-project — 鼠标悬停项目卡片 ─────────────────────────────────────
  { text: '要去看看这个项目吗 ✨', scene: 'hover-project', weight: 1, enabled: true },
  { text: '这个项目超有意思的！点开看看？(◕‿◕✿)', scene: 'hover-project', weight: 1, enabled: true },
  { text: '塞塞给你推荐这个 ヾ(≧▽≦*)o', scene: 'hover-project', weight: 1, enabled: true },
  { text: 'Ashia 在这个项目里下了不少功夫哦 ✨', scene: 'hover-project', weight: 0.8, enabled: true },

  // ── hover-tool — 鼠标悬停工具卡片 ───────────────────────────────────────
  { text: '这个工具 Ashia 在用哦 ✨', scene: 'hover-tool', weight: 1, enabled: true },
  { text: '好工具，点开看看 (◕‿◕✿)', scene: 'hover-tool', weight: 1, enabled: true },
  { text: '塞塞也很推荐这个工具！ヾ(≧▽≦*)o', scene: 'hover-tool', weight: 0.8, enabled: true },

  // ── idle-admin ────────────────────────────────────────────────────────────
  { text: '后台在认真维护中，辛苦啦 ✨', scene: 'idle-admin', weight: 1, enabled: true },
  { text: '更新完记得去前台看看效果 (◕‿◕✿)', scene: 'idle-admin', weight: 1, enabled: true },
  { text: '塞塞在旁边陪着你 ヾ(≧▽≦*)o', scene: 'idle-admin', weight: 1, enabled: true },

  // ── enter-admin ───────────────────────────────────────────────────────────
  { text: '欢迎回来！后台有什么需要处理的吗 ✨', scene: 'enter-admin', weight: 1, enabled: true },
  { text: '主人回来啦 ヾ(≧▽≦*)o 来维护网站了？', scene: 'enter-admin', weight: 1, enabled: true },

  // ── long-stay ─────────────────────────────────────────────────────────────
  { text: '还在看呢？有问题直接问 Agent 吧 (◕‿◕✿)', scene: 'long-stay', weight: 1, enabled: true },
]

export function getLinesByScene(scene: TriggerScene): Live2DLine[] {
  return live2dLines.filter((l) => l.enabled && l.scene === scene)
}

export function getRandomLine(scene: TriggerScene): string {
  const lines = getLinesByScene(scene)
  if (!lines.length) return ''
  const total = lines.reduce((sum, l) => sum + l.weight, 0)
  let rand = Math.random() * total
  for (const l of lines) {
    rand -= l.weight
    if (rand <= 0) return l.text
  }
  return lines[lines.length - 1].text
}
