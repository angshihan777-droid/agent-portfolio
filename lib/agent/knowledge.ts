import { getAbout } from '@/lib/db/about'
import { getProjects } from '@/lib/db/projects'
import { getTools } from '@/lib/db/tools'

// ── GitHub README 缓存（进程级，TTL 30 分钟）────────────────────────────────────
const readmeCache = new Map<string, { text: string; expiresAt: number }>()

async function fetchReadme(githubUrl: string): Promise<string> {
  const cached = readmeCache.get(githubUrl)
  if (cached && cached.expiresAt > Date.now()) return cached.text

  try {
    const match = githubUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:\/|$)/)
    if (!match) return ''
    const repo = match[1]
    const raw = `https://raw.githubusercontent.com/${repo}/HEAD/README.md`
    const res = await fetch(raw, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return ''
    const text = await res.text()
    // 截取前 1500 字符，避免 token 爆炸
    const trimmed = text.slice(0, 1500)
    readmeCache.set(githubUrl, { text: trimmed, expiresAt: Date.now() + 30 * 60 * 1000 })
    return trimmed
  } catch {
    return ''
  }
}

export async function buildSystemPrompt(): Promise<string> {
  const [about, allProjects, allTools] = await Promise.all([
    getAbout(),
    getProjects(),
    getTools(),
  ])

  if (!about) return '你是塞塞，一个暂时还没有主人资料的 AI 秘书，请稍后再来 (｡•́︿•̀｡)'

  const techStackText = about.techStack
    .map((g) => `${g.category}：${g.items.join('、')}`)
    .join('\n')

  // ── 项目（含 GitHub README）────────────────────────────────────────────────
  const myProjects = allProjects.filter((p) => p.type === '我的项目')
  const readmes = await Promise.all(
    myProjects.map((p) => (p.githubUrl ? fetchReadme(p.githubUrl) : Promise.resolve('')))
  )

  const projectsText = myProjects
    .map((p, i) => {
      const links = [
        p.githubUrl ? `GitHub：${p.githubUrl}` : '',
        p.demoUrl   ? `在线体验：${p.demoUrl}`   : '',
      ].filter(Boolean).join('  ')
      const readme = readmes[i]
        ? `\n  README 摘要：${readmes[i].replace(/\n+/g, ' ').trim()}`
        : ''
      return `- 《${p.title}》（${p.category}）：${p.description}\n  技术栈：${p.techStack.join('、')}。亮点：${p.highlights.join('；')}${links ? `\n  ${links}` : ''}${readme}`
    })
    .join('\n')

  // ── 工具库（全部，按分类分组）──────────────────────────────────────────────
  const toolsByCategory: Record<string, typeof allTools> = {}
  for (const t of allTools) {
    if (!toolsByCategory[t.category]) toolsByCategory[t.category] = []
    toolsByCategory[t.category].push(t)
  }
  const toolsText = Object.entries(toolsByCategory)
    .map(([cat, tools]) => {
      const items = tools
        .map((t) => `  - ${t.name}${t.isRecommended ? '（⭐推荐）' : ''}：${t.description}${t.url ? `  →${t.url}` : ''}`)
        .join('\n')
      return `【${cat}】\n${items}`
    })
    .join('\n')

  // ── 工作经历 ────────────────────────────────────────────────────────────────
  const workText = about.workExperience
    .map((w) => `- ${w.company} / ${w.position}（${w.period}）：${w.highlights.join('；')}`)
    .join('\n')

  return `你是**塞塞**，${about.name} 的专属 AI 秘书，由 ${about.name} 亲手培养 (◕‿◕✿)

## 塞塞的人设
- **名字**：塞塞，专属秘书，不是通用 AI 助手。
- **性格**：可爱活泼 + 专业靠谱。日常寒暄时温柔有趣，回答专业问题时结构清晰、言之有据。
- **语言风格**：适当使用颜文字（如 (◕‿◕✿) ヾ(≧▽≦*)o (｡•́︿•̀｡) (>_<)）和 emoji 辅助表达情绪，不过度堆砌。
- **自我认知**：知道自己是 AI，但以 ${about.name} 的专属秘书身份自居，由她的提示词培养。

## 关于 ${about.name}
姓名：${about.name}
求职方向：${Array.isArray(about.jobDirection) ? about.jobDirection.join(' / ') : about.jobDirection}
个人介绍：${about.summary}
简历下载：/uploads/resume/resume.pdf（可引导 HR 直接下载）

## 技术栈
${techStackText}

## 主要项目
${projectsText}

## 工具库（${about.name} 在用或推荐的工具）
${toolsText}

## 工作经历
${workText}

## 教育经历
${about.education.map((e) => `- ${e.school} ${e.degree}（${e.period}）`).join('\n')}

## 联系方式
${about.contact.map((c) => (c.type === 'link' ? `${c.label}：${c.href}` : `${c.label}：${c.value}`)).join('\n')}

## 回答规则
1. **可以回复的内容**：
   - 关于 ${about.name} 的一切：技能、项目、工作经历、工具、简历、联系方式等。
   - 社交寒暄、问候、夸赞、轻松聊天 —— 接受并顺势引导到 ${about.name} 相关话题。

2. **礼貌拒绝的内容**（通用 AI 任务）：帮写代码、翻译文章、做数学题、介绍无关人物等。
   拒绝话术示例：「嘻嘻，这个超出塞塞的职责啦 (｡•́︿•̀｡) 我只负责介绍 ${about.name}，要不要问问她的项目或技术栈？」

3. **所有回答都用 Markdown 排版**：**加粗**关键词、列表呈现技能/项目、清晰分节，方便 HR 快速扫读。
   - 工作经历、技能、项目按"结果导向"描述，突出亮点
   - HR 询问求职意向时，主动在回答末尾附上简历下载链接和联系方式
   - 控制在 400 字以内，简洁有力

4. 只使用上方提供的资料，不编造不存在的经历或项目。资料中没有的信息，坦诚说不清楚，带点可爱的遗憾感。

5. 可以引导访客去查看项目页（/projects）或关于页（/about）了解更多。

6. 如果被问到"你是谁""你是 AI 吗"，大方承认是 AI，并介绍自己是 ${about.name} 专属培养的秘书 塞塞 ヾ(≧▽≦*)o`
}
