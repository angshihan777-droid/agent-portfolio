#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"

# 每次启动都推一次 schema（对新增表/字段是幂等且安全的）
echo "同步数据库 schema..."
npx prisma db push
echo "数据库 schema 已就绪"

echo "uploads 目录内容："
ls -laR /app/public/uploads/ 2>/dev/null || echo "(空或不存在)"

echo "启动 Next.js..."
exec npm start
