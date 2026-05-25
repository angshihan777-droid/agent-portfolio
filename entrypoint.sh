#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/app/data/dev.db}"

if [ ! -f "/app/data/dev.db" ]; then
  echo "首次启动，初始化数据库..."
  npx prisma db push
  echo "数据库初始化完成"
fi

echo "启动 Next.js..."
exec npm start
