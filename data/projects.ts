export type ProjectType = '我的项目' | '收藏的项目'
export type ProjectCategory = '全部' | 'Agent' | 'Web' | '工具' | '学习'

export interface Project {
  id: string
  title: string
  slug: string
  type: ProjectType
  category: ProjectCategory
  description: string
  coverUrl?: string
  githubUrl?: string
  demoUrl?: string
  techStack: string[]
  highlights: string[]
  isFeatured: boolean
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'RAG 知识库问答系统',
    slug: 'rag-qa-system',
    type: '我的项目',
    category: 'Agent',
    description: '基于 LangChain + pgvector 构建的企业知识库问答系统，支持 PDF/Word/网页等多格式文档接入，提供精准的语义检索和引用溯源。',
    techStack: ['Python', 'LangChain', 'FastAPI', 'pgvector', 'Next.js', 'TypeScript'],
    highlights: [
      '混合检索策略（向量 + BM25），召回率提升 30%',
      '支持多租户隔离，一套系统服务多个业务线',
      '回答附带来源片段，可信度高',
    ],
    isFeatured: true,
    githubUrl: 'https://github.com/ashia/rag-qa-system',
  },
  {
    id: '2',
    title: 'Agent 工作流平台',
    slug: 'agent-workflow',
    type: '我的项目',
    category: 'Agent',
    description: '可视化 Agent 工作流编排工具，支持拖拽式节点连接，将复杂多步 Agent 任务构建为可复用的流程图。',
    techStack: ['LangGraph', 'React', 'TypeScript', 'FastAPI', 'Redis'],
    highlights: [
      '支持条件分支、循环、并行节点',
      '内置常用工具节点（搜索、代码执行、文件处理）',
      '流程可导出为 JSON，方便版本管理',
    ],
    isFeatured: true,
    githubUrl: 'https://github.com/ashia/agent-workflow',
  },
  {
    id: '3',
    title: '个人 Agent 展示站（本站）',
    slug: 'self-blog',
    type: '我的项目',
    category: 'Web',
    description: '你正在浏览的这个网站。基于 Next.js 构建，核心是一个可以回答关于我的 Agent，结合动漫壁纸和 Live2D 角色形成记忆点。',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'DeepSeek API', 'Live2D'],
    highlights: [
      'Agent 回答基于站内结构化数据，内容可控',
      '多厂商 LLM 抽象层，支持 DeepSeek / OpenAI 兼容接口',
      '玻璃拟态 UI + 动漫壁纸，有记忆点',
    ],
    isFeatured: true,
    githubUrl: 'https://github.com/ashia/self-blog',
  },
  {
    id: '4',
    title: '自动化数据报告生成器',
    slug: 'auto-report',
    type: '我的项目',
    category: '工具',
    description: '输入数据源（CSV/数据库），自动用大模型分析趋势并生成带图表的 Markdown/HTML 报告。',
    techStack: ['Python', 'OpenAI API', 'Pandas', 'Matplotlib', 'Jinja2'],
    highlights: [
      '支持自然语言描述分析目标',
      '自动选择合适的图表类型',
      '输出可直接嵌入 Notion 或内部文档',
    ],
    isFeatured: false,
    githubUrl: 'https://github.com/ashia/auto-report',
  },
  {
    id: '5',
    title: 'Dify 私有部署实践',
    slug: 'dify-self-hosted',
    type: '收藏的项目',
    category: 'Agent',
    description: '低代码 LLM 应用开发平台，支持工作流、RAG、Agent 模式，可一键私有化部署。',
    techStack: ['Docker', 'Python', 'PostgreSQL', 'Redis'],
    highlights: [
      '可视化构建 AI 应用，无需大量代码',
      '内置多种模型接入方式',
      '支持知识库管理和 API 发布',
    ],
    isFeatured: false,
    githubUrl: 'https://github.com/langgenius/dify',
    demoUrl: 'https://dify.ai',
  },
  {
    id: '6',
    title: 'LangGraph 多 Agent 协作示例',
    slug: 'langgraph-multi-agent',
    type: '收藏的项目',
    category: 'Agent',
    description: '演示如何用 LangGraph 构建多个 Agent 分工协作的系统，包括主控 Agent 和专项子 Agent。',
    techStack: ['Python', 'LangGraph', 'LangChain', 'OpenAI'],
    highlights: [
      '清晰的多 Agent 分工模式',
      '带状态机的工作流管理',
      '适合学习复杂 Agent 架构',
    ],
    isFeatured: false,
    githubUrl: 'https://github.com/langchain-ai/langgraph',
  },
]
