# 绿我同行（GreenSight AI Web）项目作品介绍文档

---

## 一、项目详情及使用方式

### 1.1 项目简介

**绿我同行（GreenSight AI Web）** 是一个以 AI 技术驱动环保行为的全栈 Web 应用平台。平台以「绿芽」为核心形象，寓意每一个微小的环保行动都能像绿芽一样生根发芽、茁壮成长。项目面向希望践行绿色低碳生活的普通用户，通过旧物重构、AI 智能助手、碳足迹分析、垃圾智能识别、社区互动、成就激励、志愿者活动、实时天气与空气质量查询、个人中心与账号设置等多个功能模块，构建了一个完整的绿色生活生态系统。

### 1.2 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 + Vite | Vue ^3.5.25 / Vite ^7.2.4 |
| 前端路由 | Vue Router | ^4.6.3 |
| 状态管理 | Pinia | ^3.0.4 |
| UI 组件库 | Element Plus | ^2.11.9 |
| HttP请求 | Asiox| ^2.11.9 |
| CSS 框架 | Tailwind CSS | ^4.1.17 |
| 动画 | GSAP | ^3.13.0 |
| 后端框架 | Node.js + Express | Express ^5.2.1 |
| ORM | Sequelize | ^6.37.8 |
| 数据库 | MySQL | 8.0+ |
| 认证 | JWT + Passport OAuth | jsonwebtoken ^9.0.3 |
| 文件上传 | Multer | ^2.1.1 |
| AI 服务 | GLM（智谱 AI）/ SiliconFlow | — |
| 缓存 | Redis | ^4.6.0 |
| AI识别 |Fast API| ^2.1.1 |

### 1.3 项目结构

```
bisai/
├── grennn_web/                 # 前端（Vue 3 + Vite）
│   ├── src/
│   │   ├── views/              # 页面视图
│   │   │   ├── HomeView.vue          # 首页（轮播 + 功能入口）
│   │   │   ├── ProfileView.vue       # 个人中心
│   │   │   ├── SettingsView.vue      # 账号设置
│   │   │   ├── NotFound.vue          # 404 页面
│   │   │   ├── auth/                 # 注册 / 登录 / OAuth 回调
│   │   │   ├── chat/                 # AI 助手 / 垃圾识别 / 碳足迹
│   │   │   ├── reconstruction/       # 旧物重构
│   │   │   ├── community/            # 社区动态
│   │   │   ├── achievements/         # 成就系统
│   │   │   ├── volunteer/            # 志愿者活动
│   │   │   └── weather/              # 天气查询
│   │   ├── components/           # 公共组件
│   │   │   ├── layout/               # TheNavbar / TheSidebar / TheFooter / TheIntro
│   │   │   ├── ui/                   # BaseButton / BaseInput / SkeletonLoader
│   │   │   └── WeatherIcon.vue       # 和风天气图标组件
│   │   ├── stores/               # Pinia 状态管理（user.js）
│   │   ├── router/               # Vue Router 路由配置
│   │   ├── services/             # 业务服务层（community / reconstruction / weather）
│   │   └── utils/                # 工具函数（API 封装、NProgress 等）
│   └── public/                   # 静态资源（favicon、logo）
└── grennn_backend/             # 后端（Node.js + Express）
    ├── controllers/            # 业务控制器
    │   ├── authController.js         # 注册 / 登录 / OAuth
    │   ├── userController.js         # 用户信息 / 积分
    │   ├── chatController.js         # AI 聊天 / 历史记录
    │   ├── communityController.js    # 帖子 / 点赞
    │   ├── reconstructionController.js  # 旧物重构 AI 分析
    │   ├── uploadController.js       # 通用文件上传
    │   └── weatherController.js      # 天气 API 代理
    ├── models/                 # Sequelize 数据模型（User / Post / ChatHistory）
    ├── routes/                 # API 路由（auth / user / chat / community / reconstruction / upload / weather）
    ├── middleware/             # 中间件（JWT 鉴权 / Multer 文件上传）
    ├── scripts/                # 数据库初始化脚本与文档
    │   ├── init_database.sql         # 完整建库建表 SQL
    │   ├── init_db.js                # Node.js 初始化脚本
    │   └── mysql.md                  # 数据库完整使用手册
    ├── config/                 # 数据库及第三方认证配置（database.js / passport.js）
    ├── utils/                  # 工具函数
    │   └── redis.js              # Redis 连接工具
    └── server.js               # 应用入口
```

### 1.4 使用方式

#### 启动后端服务

```bash
cd grennn_backend
npm install
# 配置 .env 文件（见下方环境变量说明）
npm run dev        # 开发模式（nodemon 热重载）
npm start          # 生产模式
# 服务运行在 http://localhost:3000
```

#### 启动前端服务

```bash
cd grennn_web
npm install
npm run dev        # 开发模式，默认端口 5173
npm run build      # 生产环境构建
npm run preview    # 预览生产构建
```

## Redis 缓存系统

项目新增的 Redis 功能：

```bash
npm install redis
```

### Redis 配置

在 `.env` 文件中添加 Redis 配置：

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

### 启动 Redis 服务

Windows 系统：
```bash
# 方法一：使用 Redis 服务
redis-server --service-start

# 方法二：临时启动（仅用于开发测试）
redis-server
```

#### 环境变量配置（`grennn_backend/.env`）

```env
# 数据库
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=你的数据库密码
DB_NAME=greenn_web

# JWT
JWT_SECRET=your_jwt_secret_key_here

# 服务器
PORT=3000
FRONTEND_URL=http://localhost:5173
CALLBACK_URL_BASE=http://localhost:3000

# AI 服务（二选一或同时配置）
AI_SERVICE=glm
GLM_API_KEY=your_glm_api_key_here
GLM_MODEL=glm-4-flash
SILICONFLOW_API_KEY=your_siliconflow_api_key

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

#### 初始化数据库

```bash
# 方式一：JS 脚本（推荐，自动读取 .env）
cd grennn_backend
node scripts/init_db.js

# 方式二：直接导入 SQL
mysql -u root -p < grennn_backend/scripts/init_database.sql

# 验证建表成功
mysql -u root -p密码 -e "USE greenn_web; SHOW TABLES;"
```

> 详细数据库配置、字段说明、SQL 示例参见 `grennn_backend/scripts/mysql.md`。

#### 用户使用流程

1. **注册 / 登录**：访问 `/auth/register` 注册，`/auth/login` 登录，或通过 Google / Microsoft OAuth 快速登录。
2. **首页浏览**：全屏轮播展示平台核心功能，侧边栏导航快速跳转各模块。
3. **旧物重构**：进入 `/reconstruction`，上传旧物图片，AI 识别材质并生成 3 条创意改造方案（含步骤、难度、时长、预估碳减排）。
4. **AI 助手对话**：进入 `/chat`，与「绿芽」AI 进行环保主题智能对话，支持停止生成 / 重新生成。
5. **垃圾识别**：进入 `/chat/waste-recognition`，上传图片，AI 识别垃圾类别并给出处理建议。
6. **碳足迹分析**：进入 `/chat/carbon-footprint`，填写月度出行、用电、用气、饮食数据，AI 计算碳排放并给出减排建议。
7. **社区互动**：进入 `/community`，发布图文动态、点赞，查看贡献榜排行（需登录）。
8. **成就系统**：进入 `/achievements`，查看已解锁徽章、积分等级和进度条（需登录）。
9. **志愿者活动**：进入 `/volunteer`，浏览并报名环保志愿活动，参与后获得积分奖励（需登录）。
10. **天气查询**：进入 `/weather`，获取实时天气、5 天预报及空气质量指数（AQI）。
11. **个人中心**：进入 `/profile`，查看头像、用户名、邮箱、环保积分及历史记录（需登录）。
12. **账号设置**：进入 `/settings`，修改账号信息、偏好配置（需登录）。

---

## 三、后端 API 一览

后端服务运行在 `http://localhost:3000`，所有接口以 `/api/v1` 为前缀。

### 3.1 认证模块 `/api/v1/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/register` | 邮箱注册（bcrypt 加密密码） |
| POST | `/login` | 邮箱密码登录，返回 JWT |
| GET | `/google` | 跳转 Google OAuth |
| GET | `/google/callback` | Google OAuth 回调 |
| GET | `/microsoft` | 跳转 Microsoft OAuth |
| GET | `/microsoft/callback` | Microsoft OAuth 回调 |

### 3.2 用户模块 `/api/v1/users`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/me` | 获取当前登录用户信息 |
| POST | `/me/points` | 更新积分（±amount，单次限 ±10000） |

### 3.3 聊天模块 `/api/v1/chat`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/completions` | 发送消息，SSE 流式返回 AI 回复，登录用户自动保存历史 |
| GET | `/history` | 获取当前用户全部聊天历史（按时间升序） |
| DELETE | `/history` | 清空当前用户聊天记录 |

### 3.4 社区模块 `/api/v1/community`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/posts` | 分页获取帖子列表（sort=latest/popular） |
| POST | `/posts` | 发布新帖子（需登录，支持多图） |
| POST | `/posts/:id/like` | 点赞 / 取消点赞 |

### 3.5 旧物重构 `/api/v1/reconstruction`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/analyze` | 上传图片，返回材质识别 + 3 条改造建议（含碳减排估算） |

### 3.6 文件上传 `/api/v1/upload`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 上传图片至 `uploads/`，返回可访问 URL |

### 3.7 天气模块 `/api/v1/weather`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/current` 等 | 代理和风天气 API，返回实时天气 / 预报 / AQI |

---

## 四、数据库概览

**数据库名：`greenn_web`**（MySQL 8.0+，utf8mb4）

| # | 表名 | 主要用途 |
|---|------|----------|
| 1 | `Users` | 用户账号（本地注册 + Google/Microsoft OAuth） |
| 2 | `Posts` | 社区图文帖子 |
| 3 | `PostLikes` | 帖子点赞去重记录 |
| 4 | `ChatHistories` | AI 多轮对话历史 |
| 5 | `ReconstructionRecords` | 旧物重构分析历史 |
| 6 | `WasteRecognitionRecords` | 垃圾识别历史 |
| 7 | `CarbonFootprintRecords` | 碳足迹分析记录 |
| 8 | `Achievements` | 成就定义（平台预设，含 11 条） |
| 9 | `UserAchievements` | 用户已解锁成就记录 |
| 10 | `VolunteerActivities` | 志愿者活动 |
| 11 | `VolunteerEnrollments` | 志愿者报名记录 |

> 完整字段说明、外键关系、索引设计及常用 SQL 查询示例，详见 `grennn_backend/scripts/mysql.md`。

---

## 五、核心功能模块说明

### 5.1 旧物重构（Reconstruction）

- **入口**：`/reconstruction`，对应 `ReconstructionView.vue`
- **后端**：`POST /api/v1/reconstruction/analyze`，由 `reconstructionController.js` 处理
- **流程**：用户上传旧物图片 → Multer 存储至 `uploads/` → AI 识别材质（木质 / 金属 / 织物 / 玻璃 / 塑料 / 陶瓷）→ 随机抽取 3 条改造建议（含标题、步骤、难度、时长、预估碳减排）→ 前端卡片展示
- **返回字段**：`analysis_id`、`image_url`、`material`、`integrity`、`carbon_reduction`、`suggestions[]`
- **待接入**：真实视觉 AI（通义千问-VL / GPT-4o 等），结果写入 `ReconstructionRecords` 表

### 5.2 AI 助手对话（Chat）

- **入口**：`/chat`，对应 `ChatView.vue`
- **后端**：`POST /api/v1/chat/completions`，SSE 流式响应
- **特性**：支持停止生成、重新生成；登录用户消息自动保存至 `ChatHistories` 表；游客消息不落库
- **历史记录**：`GET /api/v1/chat/history`（登录用户可查），`DELETE /api/v1/chat/history`（清空）

### 5.3 垃圾识别（Waste Recognition）

- **入口**：`/chat/waste-recognition`，对应 `WasteRecognitionView.vue`
- **功能**：上传垃圾图片，AI 返回分类结果（可回收 / 有害 / 厨余 / 其他）、置信度及处理建议
- **数据库**：结果存入 `WasteRecognitionRecords` 表，并给用户增加积分

### 5.4 碳足迹分析（Carbon Footprint）

- **入口**：`/chat/carbon-footprint`，对应 `CarbonFootprintView.vue`
- **功能**：用户填写月度私家车里程、公共交通里程、用电量、天然气用量、肉类频率，系统计算交通 / 能源 / 生活三项碳排放，AI 给出减排建议
- **数据库**：结果存入 `CarbonFootprintRecords` 表

### 5.5 社区互动（Community）

- **入口**：`/community`，需登录，对应 `CommunityView.vue`
- **功能**：发布图文动态（支持多图上传）、点赞 / 取消点赞、分页加载、热度 / 最新双排序、贡献榜积分排行
- **数据库**：`Posts` + `PostLikes` 表，`likes_count` 冗余计数优化排序查询

### 5.6 成就系统（Achievements）

- **入口**：`/achievements`，需登录，对应 `AchievementsView.vue`
- **预置成就**：11 枚，涵盖 recycling / carbon / community / volunteer / general 五个类别，稀有度分为 common / rare / epic / legendary
- **触发方式**：完成对应操作（垃圾识别、重构、发帖、报名志愿等）后后端检查并写入 `UserAchievements`

### 5.7 志愿者活动（Volunteer）

- **入口**：`/volunteer`，需登录，对应 `VolunteerView.vue`
- **功能**：浏览 upcoming / ongoing / completed 活动，报名参与，参与后后端发放积分
- **数据库**：`VolunteerActivities` + `VolunteerEnrollments` 表

### 5.8 天气查询（Weather）

- **入口**：`/weather`，对应 `WeatherQuery.vue`
- **功能**：实时天气、5 天预报、空气质量指数（AQI），使用和风天气 API，前端通过自定义 `WeatherIcon.vue` 组件展示图标
- **后端**：纯代理转发，不涉及数据库

### 5.9 个人中心 & 账号设置

- **个人中心** `/profile`：展示头像、用户名、邮箱、环保积分，需登录
- **账号设置** `/settings`：修改账号信息与偏好，多 Tab 导航（账号 / 通知 / 隐私等），需登录
- **状态管理**：用户信息由 Pinia `user.js` store 统一管理，路由守卫在首次访问时调用 `userStore.init()` 初始化

---

## 六、认证与安全

- **本地认证**：邮箱 + 密码，密码使用 `bcryptjs` 加密存储，登录成功返回 JWT
- **OAuth 认证**：集成 Google OAuth 2.0 和 Microsoft OAuth，通过 `passport-google-oauth20` / `passport-microsoft` 实现，`Users.findOrCreate` 自动注册新 OAuth 用户
- **JWT 鉴权**：所有需登录接口通过 `authMiddleware.js` 验证 Bearer Token，解析后将用户信息注入 `req.user`
- **安全中间件**：`helmet`（安全 HTTP 头）+ `cors`（跨域控制）+ `morgan`（请求日志）
- **路由级权限**：前端路由元信息 `requiresAuth` / `guestOnly` + 路由守卫双重保护

---

## 七、文件上传

- 使用 `multer` 中间件处理 `multipart/form-data`
- 上传文件存储至 `grennn_backend/uploads/` 目录
- Express 静态托管：`app.use('/uploads', express.static(...))` + `helmet crossOriginResourcePolicy: cross-origin` 允许前端跨域访问图片
- 上传接口：`POST /api/v1/upload`，返回可直接访问的图片 URL

---

## 八、积分系统

用户完成各类环保行为可获得积分（`Users.points`），积累积分可解锁成就徽章：

| 行为 | 积分奖励（参考值） |
|------|-------------------|
| 完成垃圾识别 | +积分（见 `WasteRecognitionRecords.pointsEarned`） |
| 完成旧物重构分析 | +积分（见 `ReconstructionRecords.pointsEarned`） |
| 参与志愿者活动 | +`VolunteerActivities.pointsReward` |
| 解锁成就 | +`Achievements.pointsReward`（10 ~ 500 不等） |

积分排行榜在社区页面展示，激励用户持续参与环保行动。

---

## 九、Redis 缓存系统

### 9.1 功能说明

项目新增了 Redis 缓存系统，用于：
- 提升 API 响应速度
- 减少数据库压力
- 支持会话管理和数据缓存

### 9.2 配置

Redis 连接配置在 `utils/redis.js` 文件中：

```javascript
const redis = require('redis');

let client = null;
let isConnected = false;

async function connectRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        client = redis.createClient({
            url: redisUrl
        });

        client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            isConnected = false;
        });

        client.on('connect', () => {
            console.log('Redis Client Connecting...');
        });

        client.on('ready', () => {
            console.log('Redis Client Ready');
            isConnected = true;
        });

        client.on('end', () => {
            console.log('Redis Client Disconnected');
            isConnected = false;
        });

        await client.connect();
        return client;
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        isConnected = false;
        throw err;
    }
}

function getRedisClient() {
    if (!client) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return client;
}

function isRedisConnected() {
    return isConnected;
}

async function disconnectRedis() {
    if (client) {
        await client.quit();
        isConnected = false;
    }
}

module.exports = {
    connectRedis,
    getRedisClient,
    isRedisConnected,
    disconnectRedis
};
```

### 9.3 使用方式

Redis 连接会在服务器启动时自动建立：

```javascript
// server.js
const { connectRedis, isRedisConnected } = require('./utils/redis');

async function startServer() {
    let dbReady = false;
    let redisReady = false;

    try {
        await syncDatabase();
        dbReady = true;
    } catch (err) {
        console.error('Database initialization failed:', err.message);
        console.warn('Database is unavailable. Starting server with limited database features.');
    }

    try {
        const redisEnabled = String(process.env.REDIS_ENABLED || '').toLowerCase() === 'true';
        if (redisEnabled) {
            await connectRedis();
            redisReady = true;
            console.log('Redis connection established.');
        } else {
            console.log('Redis is disabled by configuration.');
        }
    } catch (err) {
        console.error('Redis connection failed:', err.message);
        console.warn('Redis is unavailable. Starting server without Redis features.');
    }

    app.listen(PORT, () => {
        const statusParts = [];
        if (dbReady) {
            statusParts.push('database');
        }
        if (redisReady) {
            statusParts.push('Redis');
        }

        const statusText = statusParts.length > 0
            ? ` (${statusParts.join(', ')})`
            : ' (database and Redis unavailable)';

        console.log(`Server running on port ${PORT}${statusText}`);
    });
}
```

---

## 十、相关文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 数据库完整手册 | `grennn_backend/scripts/mysql.md` | 表结构、外键、索引、SQL 示例、开发操作 |
| 数据库初始化 SQL | `grennn_backend/scripts/init_database.sql` | 完整建库建表（含种子数据） |
| 前端设计文档 | `grennn_web/DESIGN.md` | 前端设计规范 |
| 天气系统实现文档 | `天气系统实现文档.md` | 天气模块详细实现说明 |
| 天气 API 说明 | `天气api.md` | 和风天气 API 接入指南 |
| 快速启动指南 | `快速启动指南.md` | 一键启动步骤 |
| 优化计划 | `grennn_web/.trae/documents/Optimization Plan for National Award Goal.md` | 国奖目标优化计划 |
