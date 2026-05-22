# ✨ Personal Agent Portfolio

一个以 **AI Agent** 为核心的个人展示站，访客可以与你的专属 AI 秘书实时对话，了解你的项目、技能和经历。内置完整后台 CMS，所有内容一键可改，无需碰代码。

---
##截图展示
前端
<img width="2744" height="1356" alt="image" src="https://github.com/user-attachments/assets/0a630e75-3853-449e-b91c-4bddcfe156fc" />


后端
<img width="2771" height="1393" alt="image" src="https://github.com/user-attachments/assets/483e3b2c-0904-4deb-aa66-4d10271751ab" />


## 🌟 亮点功能

### 💬 专属 AI 秘书
- 基于大模型打造的专属 Agent，熟知你的项目、技术栈、工作经历和联系方式
- 知识库实时从数据库读取，后台改完立即生效
- 支持多轮对话、推荐问题引导，拒绝回答与主人无关的通用任务
- 可自定义 Agent 名称、推荐问题列表

### 🎨 动态玻璃拟态 UI
- 全站毛玻璃面板，透明度后台实时可调（壁纸遮罩 / 聊天窗口 / 卡片面板 / 顶部导航各自独立）
- 透明度趋近于零时自动关闭 `backdrop-blur`，让壁纸清晰可见
- 壁纸支持后台上传替换，即改即效

### 🐱 Live2D 角色
- 内置 Live2D 看板娘，常驻左下角
- 台词随场景切换（空闲、点击、各页面进入）
- 后台可管理全部台词、切换模型、调整大小
- 聊天时角色同步显示"思考中…"气泡

### 📊 访客统计
- 前台每次路由变化自动打点
- 后台仪表盘展示：24 小时 / 近 7 天 / 全部时间 折线图
- 服务端直连数据库渲染，无需第三方统计服务

### 🛠️ 完整后台 CMS
- 项目 / 工具 / 个人介绍 增删改查
- 壁纸上传、Live2D 配置、简历 PDF 上传
- LLM 多配置管理（可切换 DeepSeek / OpenAI 兼容接口，支持中转站）
- 欢迎弹窗内容可视化编辑
- 密码修改

---

## 🖥️ 页面结构

```
前台
├── /              首页 · AI 秘书聊天窗口
├── /projects      项目展示 · 分类卡片 + 详情弹层
├── /tools         工具收藏 · 搜索 + 分类
└── /about         个人简介 · 技术栈 / 经历 / 联系方式

后台 /admin（JWT 登录保护）
├── /admin               仪表盘 · PV 图表 + 内容统计
├── /admin/projects      项目 CRUD
├── /admin/tools         工具 CRUD
├── /admin/about         个人信息编辑
├── /admin/live2d        Live2D 台词管理
├── /admin/agent         Agent 名称 / 推荐问题 / LLM 配置
├── /admin/welcome       欢迎弹窗编辑
└── /admin/settings      壁纸 / 透明度 / Live2D / 密码 / 简历
```

---

## 🧰 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | [Next.js 16](https://nextjs.org/) (App Router · Turbopack) |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS 4 + shadcn/ui |
| **动效** | [Framer Motion](https://www.framer.com/motion/) |
| **状态管理** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **数据库** | SQLite via [Prisma](https://www.prisma.io/) + `@prisma/adapter-libsql` |
| **AI 接口** | OpenAI SDK（兼容 DeepSeek / OpenAI / 任意中转站） |
| **认证** | [jose](https://github.com/panva/jose) JWT · httpOnly Cookie |
| **Live2D** | [l2d-widget](https://github.com/hacxy/l2d-widget) |
| **图表** | [Recharts](https://recharts.org/) |
| **Markdown** | react-markdown |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 然后编辑 .env.local，填入你的密码和 API Key
```

> **后台登录地址**：`/admin/login`  
> **初始密码**：`admin123`（内置于代码，首次登录后请立即在 **设置 → 修改密码** 更改）

### 3. 初始化数据库

```bash
# 生成 Prisma Client 并同步 schema 到 SQLite
npx prisma db push

# （可选）写入示例数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看前台，[http://localhost:3000/admin](http://localhost:3000/admin) 进入后台。

---

## 🐳 生产部署（Docker）

### 前提
- VPS 已安装 Docker 和 Docker Compose
- 已将代码推送到 GitHub 并在服务器上克隆

### 一、首次部署

```bash
# 1. 克隆代码
git clone https://github.com/yourname/self-blog.git
cd self-blog

# 2. 创建 .env.local（填写你的密码和 API Key）
cp .env.example .env.local   # 或手动新建
nano .env.local

# 3. 构建镜像并启动（首次启动会自动初始化数据库）
docker compose up -d --build
```

访问 `http://your-server-ip:3000` 即可看到网站，`/admin/login` 进后台。

> **初始密码**：`admin123`（内置于代码，登录后请立即在 **设置 → 修改密码** 更改）

### 二、更新代码

```bash
# 拉取最新代码，重新构建并重启
git pull && docker compose up -d --build
```

> 仅在后台改内容（文案/图片/配置）时，不需要重新构建，数据直接存入 SQLite 卷。

### 三、常用维护命令

```bash
# 查看运行日志
docker compose logs -f

# 进入容器调试
docker compose exec app sh

# 停止服务
docker compose down

# 手动写入示例数据（可选，仅首次）
docker compose exec app npm run db:seed
```

### 四、反向代理 + HTTPS（推荐）

使用 Nginx 或 Caddy 将 `3000` 端口代理到域名并自动签 SSL：

```nginx
# Nginx 示例
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Caddy 示例（自动 HTTPS，最简单）
# /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy localhost:3000
}
```

### 五、数据备份

SQLite 数据库和上传文件存储在 Docker 命名卷中，备份只需：

```bash
# 备份数据库
docker run --rm -v self-blog_db_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz -C /data .

# 备份上传文件
docker run --rm -v self-blog_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 📁 目录结构

```
self-blog/
├── app/                    Next.js App Router 页面
│   ├── (前台页面)
│   ├── admin/              后台 CMS 页面
│   └── api/                API 路由
├── components/             React 组件
│   ├── chat/               聊天相关
│   ├── layout/             布局（TopNav、GlassPanel、Background…）
│   ├── live2d/             Live2D 角色 + 气泡
│   ├── projects/ tools/    内容卡片
│   └── modals/             弹窗
├── lib/
│   ├── agent/              AI 秘书逻辑（知识库构建 + LLM 调用）
│   └── db/                 Prisma 数据库操作
├── store/                  Zustand 全局状态
├── prisma/
│   ├── schema.prisma       数据模型
│   └── seed.ts             示例数据脚本
├── public/
│   ├── live2d/             Live2D 模型文件
│   ├── wallpaper/          内置壁纸
│   └── uploads/            用户上传文件（运行时生成，Docker 卷挂载）
├── Dockerfile              多阶段构建镜像
├── docker-compose.yml      容器编排（卷挂载 / 端口 / 环境变量）
├── entrypoint.sh           容器启动脚本（首次自动初始化数据库）
├── .env.example            环境变量模板
└── .dockerignore           Docker 构建排除规则
```

---

## ⚙️ 个性化配置

所有内容均可在后台修改，无需改代码：

| 配置项 | 后台路径 |
|--------|---------|
| Agent 名称 & 推荐问题 | `/admin/agent` |
| LLM 模型 & API Key | `/admin/agent` → 大模型配置 |
| 个人资料 | `/admin/about` |
| 项目 / 工具 | `/admin/projects` · `/admin/tools` |
| 壁纸 & 透明度 | `/admin/settings` |
| Live2D 台词 & 模型 | `/admin/live2d` · `/admin/settings` |
| 欢迎弹窗 | `/admin/welcome` |

---

## 📄 License

MIT
