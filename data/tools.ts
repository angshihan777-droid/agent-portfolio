export type ToolType = '网站' | 'GitHub' | '文件' | '视频' | '文档'
export type ToolCategory =
  | '全部'
  | 'Agent'
  | 'LLM'
  | 'RAG'
  | '开发工具'
  | '前端'
  | '后端'
  | '设计资源'
  | '学习资料'

export interface Tool {
  id: string
  name: string
  category: ToolCategory
  type: ToolType
  description: string
  url?: string
  fileUrl?: string
  tags: string[]
  isRecommended: boolean
}

export const tools: Tool[] = [
  {
    id: '1',
    name: 'LangChain',
    category: 'Agent',
    type: 'GitHub',
    description: '构建 LLM 应用的主流框架，提供链式调用、工具调用、RAG、记忆管理等核心能力。',
    url: 'https://github.com/langchain-ai/langchain',
    tags: ['LLM', 'Agent', 'RAG', 'Python'],
    isRecommended: true,
  },
  {
    id: '2',
    name: 'LangGraph',
    category: 'Agent',
    type: 'GitHub',
    description: '基于图结构的 Agent 工作流编排库，支持循环、条件分支和多 Agent 协作。',
    url: 'https://github.com/langchain-ai/langgraph',
    tags: ['Agent', 'WorkFlow', 'Python'],
    isRecommended: true,
  },
  {
    id: '3',
    name: 'DeepSeek',
    category: 'LLM',
    type: '网站',
    description: '高性能国产大模型，API 兼容 OpenAI 格式，价格低廉，适合高频调用场景。',
    url: 'https://platform.deepseek.com',
    tags: ['LLM', 'API', '国产'],
    isRecommended: true,
  },
  {
    id: '4',
    name: 'Chroma',
    category: 'RAG',
    type: 'GitHub',
    description: '开源向量数据库，易于本地部署，适合 RAG 原型开发和小规模生产环境。',
    url: 'https://github.com/chroma-core/chroma',
    tags: ['向量数据库', 'RAG', 'Python'],
    isRecommended: true,
  },
  {
    id: '5',
    name: 'Dify',
    category: 'Agent',
    type: '网站',
    description: '低代码 LLM 应用开发平台，支持工作流、RAG、Agent，可私有化部署。',
    url: 'https://dify.ai',
    tags: ['低代码', 'Agent', 'RAG', '可部署'],
    isRecommended: true,
  },
  {
    id: '6',
    name: 'shadcn/ui',
    category: '前端',
    type: '网站',
    description: '可复制的 React UI 组件库，基于 Radix UI + Tailwind CSS，不是 npm 包而是直接复制代码。',
    url: 'https://ui.shadcn.com',
    tags: ['React', 'UI', 'Tailwind'],
    isRecommended: true,
  },
  {
    id: '7',
    name: 'Cursor',
    category: '开发工具',
    type: '网站',
    description: 'AI 辅助编程 IDE，内置代码补全、Chat 和 Agent 模式，大幅提升开发效率。',
    url: 'https://cursor.sh',
    tags: ['IDE', 'AI辅助', '效率'],
    isRecommended: true,
  },
  {
    id: '8',
    name: 'FastAPI',
    category: '后端',
    type: '文档',
    description: '高性能 Python Web 框架，自动生成 OpenAPI 文档，非常适合 AI 服务的 API 层。',
    url: 'https://fastapi.tiangolo.com',
    tags: ['Python', 'API', '后端'],
    isRecommended: false,
  },
  {
    id: '9',
    name: 'pgvector',
    category: 'RAG',
    type: '文档',
    description: 'PostgreSQL 向量扩展，在现有 PG 数据库中直接支持向量相似度搜索，无需额外维护向量库。',
    url: 'https://github.com/pgvector/pgvector',
    tags: ['PostgreSQL', 'RAG', '向量搜索'],
    isRecommended: false,
  },
  {
    id: '10',
    name: 'Framer Motion',
    category: '前端',
    type: '文档',
    description: 'React 动效库，声明式 API，制作入场/退场动画、手势交互和布局动效。',
    url: 'https://www.framer.com/motion',
    tags: ['React', '动效', 'TypeScript'],
    isRecommended: false,
  },
  {
    id: '11',
    name: 'Prompt Engineering Guide',
    category: '学习资料',
    type: '文档',
    description: '全面的 Prompt 工程指南，覆盖基础技巧到高级 Chain-of-Thought、RAG 等实践。',
    url: 'https://www.promptingguide.ai/zh',
    tags: ['Prompt', '教程', 'LLM'],
    isRecommended: true,
  },
  {
    id: '12',
    name: 'Docker 快速入门',
    category: '开发工具',
    type: '文档',
    description: 'Docker 官方文档快速入门部分，从安装到编写 Dockerfile 和 Compose 文件。',
    url: 'https://docs.docker.com/get-started',
    tags: ['Docker', '部署', '运维'],
    isRecommended: false,
  },
]
