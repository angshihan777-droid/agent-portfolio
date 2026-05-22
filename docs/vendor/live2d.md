# Live2D 接入说明

## 来源

- 参考仓库：[hacxy/l2d-widget](https://github.com/hacxy/l2d-widget)
- 使用方式：通过 npm 安装 `l2d-widget` 包（`v0.0.2`），不复制仓库代码

## 保留内容

- `npm install l2d-widget` 作为运行时依赖
- 使用 CDN 托管的模型：`https://model.hacxy.cn/cat-black/model.json`
- React 封装组件：`components/live2d/Live2DWidget.tsx`
- 气泡组件：`components/live2d/SpeechBubble.tsx`
- 台词配置：`data/live2d-lines.ts`

## 删减内容

- 未复制仓库中的示例站点、文档、测试目录
- 未复制重复的 `.git`、`package.json`、构建配置
- 未下载本地模型文件（使用 CDN 加载）

## 模型替换

如需替换为自己的模型，修改 `components/live2d/Live2DWidget.tsx` 中的 `MODEL_URL`，
将 `.model.json` 或 `.model3.json` 文件放到 `public/live2d/` 目录，
并将 URL 改为 `/live2d/your-model/model.json`。
