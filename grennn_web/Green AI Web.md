# Green AI Web

Green AI Web 是一个旨在通过 AI 技术促进环保行为的全栈 Web 应用。它结合了前端 Vue.js、后端 Node.js 和 MySQL 数据库，为用户提供了一个记录、分享和激励环保活动的平台。
## 以 https://www.creativewebmanual.com/ 为准
## 功能

- **用户认证**：注册、登录和个人资料管理
- **旧物重构**：用户上传旧物品，系统分析物品价值，推荐重构方案
- **AI 聊天助手**：接入ai 基于用户活动数据，提供个性化的环保建议，环保活动记录和追踪用户的环保活动，如回收、减少碳足迹等
- **成就系统**：通过完成环保任务解锁成就，激励用户持续参与
- **活动社区和排行榜**：志愿服务分享感受，展示顶尖用户的环保贡献，营造社区竞争氛围

## 技术栈

### 前端

- **Vue.js 3**：渐进式 JavaScript 框架，用于构建用户界面
- **Vite**：下一代前端构建工具，提供极速的开发体验
- **Pinia**：Vue 的官方状态管理库
- **Vue Router**：Vue.js 的官方路由管理器
- **Element Plus & Vuetify**：Vue 3 组件库，提供丰富美观的 UI 组件
- **Axios**：用于 HTTP 请求
- **Chart.js & Vue Chart.js**：用于数据可视化
- **GSAP**：用于动画效果
- **TensorFlow.js**：用于机器学习功能
- **Tailwind CSS**：功能类优先的 CSS 框架，用于快速构建自定义设计

### 后端

- **Node.js**：基于 Chrome V8 引擎的 JavaScript 运行时
- **Express.js**：快速、极简的 Node.js Web 应用框架
- **MySQL 8.0**：流行的开源关系型数据库
- **Sequelize**：基于 Promise 的 Node.js ORM，用于数据库交互
- **MySQL2**：MySQL 数据库驱动
- **JWT (jsonwebtoken)**：用于用户认证和授权
- **Bcrypt.js**：用于密码哈希
- **Dotenv**：用于加载环境变量
- **Express 中间件**：
  - **安全**：helmet、cors、express-rate-limit、express-mongo-sanitize、xss
  - **日志**：morgan
  - **文件上传**：multer

## 项目结构
greenn/
├── .env                 # 根目录环境变量
├── server/              # 后端代码
│   ├── .env             # 后端环境变量
│   ├── config/          # 数据库配置
│   ├── models/          # Sequelize 模型
│   ├── routes/          # API 路由
│   ├── middleware/      # Express 中间件
│   ├── scripts/         # 数据库脚本
│   └── server.js        # 服务器入口
├── src/                 # 前端代码
│   ├── api/             # API 请求模块
│   ├── assets/          # 静态资源
│   ├── components/      # Vue 组件
│   ├── router/          # Vue 路由
│   ├── stores/          # Pinia stores
│   ├── views/           # Vue 视图
│   └── main.js          # 前端入口
├── package.json         # 项目依赖和脚本
└── Readme.md            # 项目说明