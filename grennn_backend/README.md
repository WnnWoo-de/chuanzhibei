# Green Web Backend

Green Web 项目的后端服务，基于 Node.js + Express + MySQL 构建。

## 1. 快速开始

### 1.1 环境要求
*   Node.js >= 18
*   MySQL >= 8.0 (运行在 localhost:3306)

### 1.2 安装依赖
```bash
npm install
```

```bash
cd "c:\Users\wnnw\Desktop\chuanzhibei-main\grennn_backend\ai_service" && pip install fastapi uvicorn python-multipart openai
```

### 1.3 配置环境变量
复制 `.env.example` (如果有) 或直接编辑 `.env` 文件，填入你的配置信息：
*   数据库密码
*   JWT Secret
*   Google / Microsoft OAuth Client ID & Secret

### 1.4 初始化数据库
```bash
node scripts/init_db.js
```
这将创建 `greenn_web` 数据库。Sequelize 会在启动时自动同步表结构。

### 1.5 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```
服务器默认运行在 `http://localhost:3000`。

## 2. 目录结构
*   `config/`: 数据库与 Passport 配置
*   `controllers/`: 业务逻辑控制器
*   `middleware/`: 中间件 (Auth, Upload)
*   `models/`: Sequelize 数据模型
*   `routes/`: API 路由定义
*   `uploads/`: 上传文件存储

## 3. API 文档
请参考项目根目录下的 `后端.md`。
