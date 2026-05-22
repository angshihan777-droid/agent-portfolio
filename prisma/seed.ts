import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { projects } from '../data/projects'
import { tools } from '../data/tools'
import { about } from '../data/about'
import { live2dLines } from '../data/live2d-lines'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始导入种子数据...')

  // Projects
  const projectCount = await db.project.count()
  if (projectCount === 0) {
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      await db.project.create({
        data: {
          title: p.title,
          type: p.type,
          category: p.category,
          description: p.description,
          techStack: JSON.stringify(p.techStack),
          highlights: JSON.stringify(p.highlights),
          githubUrl: p.githubUrl ?? null,
          demoUrl: p.demoUrl ?? null,
          coverUrl: p.coverUrl ?? null,
          isFeatured: p.isFeatured,
          order: i,
        },
      })
    }
    console.log(`✅ 导入 ${projects.length} 个项目`)
  } else {
    console.log(`⏭️  项目已存在（${projectCount} 条），跳过`)
  }

  // Tools
  const toolCount = await db.tool.count()
  if (toolCount === 0) {
    for (let i = 0; i < tools.length; i++) {
      const t = tools[i]
      await db.tool.create({
        data: {
          name: t.name,
          category: t.category,
          type: t.type,
          description: t.description,
          url: t.url ?? null,
          fileUrl: t.fileUrl ?? null,
          tags: JSON.stringify(t.tags),
          isRecommended: t.isRecommended,
          order: i,
        },
      })
    }
    console.log(`✅ 导入 ${tools.length} 个工具`)
  } else {
    console.log(`⏭️  工具已存在（${toolCount} 条），跳过`)
  }

  // About
  const aboutRow = await db.about.findUnique({ where: { id: 'singleton' } })
  if (!aboutRow) {
    await db.about.create({ data: { id: 'singleton', data: JSON.stringify(about) } })
    console.log('✅ 导入个人信息')
  } else {
    console.log('⏭️  个人信息已存在，跳过')
  }

  // Live2D Lines
  const lineCount = await db.live2DLine.count()
  if (lineCount === 0) {
    for (const l of live2dLines) {
      await db.live2DLine.create({
        data: { text: l.text, scene: l.scene, weight: l.weight, enabled: l.enabled },
      })
    }
    console.log(`✅ 导入 ${live2dLines.length} 条 Live2D 台词`)
  } else {
    console.log(`⏭️  台词已存在（${lineCount} 条），跳过`)
  }

  // SiteConfig 默认值
  const wallpaper = await db.siteConfig.findUnique({ where: { key: 'wallpaper' } })
  if (!wallpaper) {
    await db.siteConfig.create({ data: { key: 'wallpaper', value: '/wallpaper/default.jpg' } })
  }
  const live2dModel = await db.siteConfig.findUnique({ where: { key: 'live2dModel' } })
  if (!live2dModel) {
    await db.siteConfig.create({ data: { key: 'live2dModel', value: 'blanc' } })
  }
  const live2dSize = await db.siteConfig.findUnique({ where: { key: 'live2dSize' } })
  if (!live2dSize) {
    await db.siteConfig.create({ data: { key: 'live2dSize', value: '220' } })
  }
  console.log('✅ SiteConfig 默认值已就绪')

  console.log('🎉 种子数据导入完成')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
