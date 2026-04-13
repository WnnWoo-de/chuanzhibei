# AI 垃圾分类功能快速启动指南

## 已完成的工作

根据 README_AI.md 文档，AI 垃圾分类功能已成功集成到项目中！

## 项目结构

```
chuanzhibei/
├── grennn_web/                          # 前端项目
└── grennn_backend/                     # 后端项目
    ├── ai_service/
    │   └── main.py                   # [新增] FastAPI AI 服务
    ├── controllers/wasteController.js       # [更新] 垃圾分类控制器
    ├── routes/waste.js                # [更新] 垃圾分类路由
    └── package.json                  # [更新] 启动脚本配置
```

## 启动步骤

### 1. 安装 Python 依赖

在 `grennn_backend/ai_service` 目录下安装 Python 依赖：

```bash
cd grennn_backend/ai_service
pip install fastapi uvicorn python-multipart openai
```

### 2. 一键启动所有服务（推荐）

在 `grennn_backend` 目录下运行：

```bash
cd grennn_backend
npm run dev:all
```

这会同时启动：
- Node.js 后端服务（端口 3000）
- Vue 前端（通常是端口 5173）
- Python AI 服务（端口 8000）

### 3. 分别启动（如果需要单独调试）

**启动 Python AI 服务：
```bash
cd grennn_backend/ai_service
python main.py
```

**启动后端服务：
```bash
cd grennn_backend
npm run dev
```

**启动前端服务：
```bash
cd grennn_web
npm run dev
```

## API 说明

- 前端访问：http://localhost:5173
- 后端 API：http://localhost:3000
- AI 服务：http://localhost:8000

## 功能说明

- 上传图片后，会调用硅基流动的 Qwen2-VL-72B-Instruct 视觉模型进行识别
- 识别结果会保存到数据库
- 支持四种分类：可回收物、有害垃圾、厨余垃圾、其他垃圾
