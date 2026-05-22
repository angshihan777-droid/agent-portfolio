export type ContactItem =
  | { type: 'link'; label: string; href: string; icon: string }
  | { type: 'copy'; label: string; value: string; icon: string }

export const about = {
  name: 'Ashia',
  nickname: 'Ashia',
  avatarUrl: '',
  jobDirection: ['AI Agent', 'Web 开发', '工具型产品'],
  summary:
    '专注 Agent 应用落地与 RAG 工程化，擅长将大模型能力与实际业务场景结合，构建可用、可维护的 AI 工具和工作流系统。熟悉前后端全栈开发，有从 0 到 1 交付产品的经验。',
  contact: [
    { type: 'link', label: 'GitHub', href: 'https://github.com/ashia', icon: 'github' },
    { type: 'link', label: 'Email', href: 'mailto:ashia@example.com', icon: 'email' },
    { type: 'copy', label: '微信', value: 'ashia-dev', icon: 'wechat' },
  ] as ContactItem[],
  resumeUrl: '/resume.pdf',

  techStack: [
    {
      category: 'Agent / LLM',
      items: ['LangChain', 'LangGraph', 'OpenAI API', 'DeepSeek', 'RAG', '工具调用', '工作流自动化'],
    },
    {
      category: '前端',
      items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Framer Motion'],
    },
    {
      category: '后端',
      items: ['Python', 'FastAPI', 'Node.js', 'REST API'],
    },
    {
      category: '数据库',
      items: ['PostgreSQL', 'SQLite', 'pgvector', 'Chroma', 'Redis'],
    },
    {
      category: '部署运维',
      items: ['Docker', 'Docker Compose', 'Nginx', 'Linux', 'GitHub Actions'],
    },
    {
      category: '工具和平台',
      items: ['Git', 'VS Code', 'Cursor', 'Notion', 'Figma'],
    },
  ],

  workExperience: [
    {
      company: '某 AI 创业公司',
      position: 'AI 应用工程师',
      period: '2024.06 — 至今',
      highlights: [
        '设计并实现企业知识库 RAG 系统，支持多格式文档解析和语义检索',
        '构建基于 LangGraph 的多步骤 Agent，实现自动化数据报告生成',
        '负责前端 Dashboard 开发，将 Agent 输出可视化展示给业务团队',
      ],
    },
    {
      company: '某互联网公司',
      position: '全栈开发工程师',
      period: '2022.07 — 2024.05',
      highlights: [
        '参与内容管理系统从零到一的开发，负责前端架构设计',
        '独立交付多个工具型小产品，涵盖数据抓取、自动化处理和可视化',
        '推动团队引入 TypeScript 和现代前端工程化实践',
      ],
    },
  ],

  education: [
    {
      school: '某高等院校',
      degree: '计算机科学与技术 本科',
      period: '2018 — 2022',
    },
  ],
}
