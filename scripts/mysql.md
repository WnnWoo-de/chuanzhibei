# GreenSight AI Web 数据库完整使用手册

> 技术栈：MySQL 8.0 + Sequelize 6 + Node.js 16+
> 后端框架：Express | ORM：Sequelize | 认证：JWT + Passport OAuth

---

## 目录

1. [环境要求](#一环境要求)
2. [环境变量配置](#二环境变量配置)
3. [初始化数据库](#三初始化数据库)
4. [数据库表结构总览](#四数据库表结构总览)
5. [各表字段详情](#五各表字段详情)
6. [表关系与外键](#六表关系与外键)
7. [接口与数据库操作对应](#七接口与数据库操作对应)
8. [常用SQL查询示例](#八常用sql查询示例)
9. [索引说明](#九索引说明)
10. [开发常用操作](#十开发常用操作)
11. [重置数据库](#十一重置数据库慎用)
12. [相关文件索引](#十二相关文件索引)

---

## 一、环境要求

| 依赖 | 版本要求 |
|------|----------|
| MySQL | 8.0 及以上 |
| Node.js | 16 及以上 |
| mysql2 | ^3.0.0 |
| sequelize | ^6.0.0 |
| dotenv | ^16.0.0 |

```bash
cd grennn_backend
npm install
```

---

## 二、环境变量配置

在 `grennn_backend/` 目录下创建 `.env` 文件：

```env
# 数据库配置
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

# AI 服务
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

---

## 三、初始化数据库

### 方式一：JS 脚本（推荐）

```bash
cd grennn_backend
node scripts/init_db.js
```

成功输出：
```
✅ MySQL 连接成功
📄 正在执行: .../scripts/init_database.sql
🎉 数据库初始化完成！已创建以下表:
   - Users                   (用户账号表)
   - Posts                   (社区帖子表)
   - PostLikes               (帖子点赞记录表)
   - ChatHistories           (AI聊天历史表)
   - ReconstructionRecords   (旧物重构记录表)
   - WasteRecognitionRecords (垃圾识别记录表)
   - CarbonFootprintRecords  (碳足迹记录表)
   - Achievements            (成就定义表)
   - UserAchievements        (用户成就记录表)
   - VolunteerActivities     (志愿者活动表)
   - VolunteerEnrollments    (志愿者报名记录表)
```

### 方式二：命令行导入 SQL

```bash
mysql -u root -p < grennn_backend/scripts/init_database.sql
```

### 方式三：图形化工具

1. 连接 MySQL 服务器
2. 新建查询窗口，打开 `scripts/init_database.sql`
3. 执行全部

### 方式四：服务器自动同步（开发环境）

`server.js` 启动时执行 `sequelize.sync({ alter: true })` 自动同步：

```bash
npm run dev   # 开发模式
npm start     # 生产模式
```

> ⚠️ 生产环境建议改为手动迁移，避免意外修改表结构。

---

## 四、数据库表结构总览

**数据库名：`greenn_web`**（utf8mb4，utf8mb4_unicode_ci）

| # | 表名 | 对应模型/页面 | 主要用途 |
|---|------|--------------|----------|
| 1 | `Users` | `models/User.js` | 用户账号（本地+OAuth） |
| 2 | `Posts` | `models/Post.js` | 社区图文帖子 |
| 3 | `PostLikes` | — | 帖子点赞去重 |
| 4 | `ChatHistories` | `models/ChatHistory.js` | AI多轮对话 |
| 5 | `ReconstructionRecords` | `ReconstructionView.vue` | 旧物重构历史 |
| 6 | `WasteRecognitionRecords` | `WasteRecognitionView.vue` | 垃圾识别历史 |
| 7 | `CarbonFootprintRecords` | `CarbonFootprintView.vue` | 碳足迹分析 |
| 8 | `Achievements` | `AchievementsView.vue` | 成就定义（平台预设） |
| 9 | `UserAchievements` | `AchievementsView.vue` | 用户已解锁成就 |
| 10 | `VolunteerActivities` | `VolunteerView.vue` | 志愿者活动 |
| 11 | `VolunteerEnrollments` | `VolunteerView.vue` | 志愿者报名记录 |

---

## 五、各表字段详情

### 1. Users（用户表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| email | VARCHAR(255) | 否 | — | 邮箱，唯一，用于登录 |
| password | VARCHAR(255) | 是 | NULL | bcrypt加密密码，OAuth用户为空 |
| username | VARCHAR(100) | 否 | — | 用户名（2-20字符） |
| points | INT | 否 | 0 | 绿色积分 |
| googleId | VARCHAR(255) | 是 | NULL | Google OAuth标识 |
| microsoftId | VARCHAR(255) | 是 | NULL | Microsoft OAuth标识 |
| avatar | VARCHAR(1000) | 是 | NULL | 头像URL |
| bio | VARCHAR(500) | 是 | NULL | 个人简介 |
| emailVerified | TINYINT(1) | 否 | 0 | 0=未验证，1=已验证 |
| emailVerificationToken | VARCHAR(255) | 是 | NULL | 邮箱验证令牌 |
| emailVerificationExpires | DATETIME | 是 | NULL | 验证令牌过期时间 |
| passwordResetToken | VARCHAR(255) | 是 | NULL | 密码重置令牌 |
| passwordResetExpires | DATETIME | 是 | NULL | 重置令牌过期时间 |
| lastLoginAt | DATETIME | 是 | NULL | 最后登录时间 |
| lastLoginIp | VARCHAR(50) | 是 | NULL | 最后登录IP |
| createdAt | DATETIME | 否 | — | 创建时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 2. Posts（社区帖子表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| content | TEXT | 否 | — | 帖子正文 |
| images | JSON | 否 | [] | 图片URL数组 |
| likes_count | INT | 否 | 0 | 点赞总数（冗余计数） |
| views_count | INT | 否 | 0 | 浏览次数 |
| userId | CHAR(36) | 是 | NULL | 外键→Users.id（用户删除后置NULL） |
| createdAt | DATETIME | 否 | — | 发布时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 3. PostLikes（帖子点赞记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | BIGINT UNSIGNED | 否 | 自增 | 主键 |
| postId | CHAR(36) | 否 | — | 外键→Posts.id |
| userId | CHAR(36) | 否 | — | 外键→Users.id |
| createdAt | DATETIME | 否 | — | 点赞时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

> (postId, userId) 联合唯一索引，防止重复点赞。

### 4. ChatHistories（AI聊天历史表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| role | ENUM | 否 | — | user=用户，assistant=AI |
| content | MEDIUMTEXT | 否 | — | 消息内容（最大16MB） |
| userId | CHAR(36) | 是 | NULL | 外键→Users.id（级联删除） |
| createdAt | DATETIME | 否 | — | 消息时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

> 游客（未登录）消息不写入此表。

### 5. ReconstructionRecords（旧物重构记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| userId | CHAR(36) | 是 | NULL | 外键→Users.id |
| imageUrl | VARCHAR(1000) | 否 | — | 上传旧物图片路径 |
| originalFilename | VARCHAR(255) | 是 | NULL | 原始文件名 |
| material | VARCHAR(100) | 是 | NULL | AI识别材质（木质/金属/织物等） |
| integrity | VARCHAR(50) | 是 | NULL | 完整度评估（如：良好 B+） |
| carbonReduction | DECIMAL(8,2) | 是 | NULL | 预估碳减排量（kg CO2e） |
| suggestions | JSON | 是 | NULL | AI改造建议数组 |
| analysisId | VARCHAR(50) | 是 | NULL | 分析唯一标识（rec_时间戳） |
| pointsEarned | INT | 否 | 0 | 本次获得积分 |
| isPublished | TINYINT(1) | 否 | 0 | 是否已分享到社区 |
| createdAt | DATETIME | 否 | — | 分析时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 6. WasteRecognitionRecords（垃圾识别记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| userId | CHAR(36) | 是 | NULL | 外键→Users.id |
| imageUrl | VARCHAR(1000) | 否 | — | 上传图片路径 |
| originalFilename | VARCHAR(255) | 是 | NULL | 原始文件名 |
| wasteCategory | VARCHAR(50) | 是 | NULL | 分类结果（可回收/有害/厨余/其他） |
| wasteName | VARCHAR(100) | 是 | NULL | 垃圾物品名称 |
| confidence | DECIMAL(5,2) | 是 | NULL | AI置信度（0-100） |
| aiExplanation | TEXT | 是 | NULL | AI分类说明与处理建议 |
| pointsEarned | INT | 否 | 0 | 本次获得积分 |
| createdAt | DATETIME | 否 | — | 识别时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 7. CarbonFootprintRecords（碳足迹记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| userId | CHAR(36) | 是 | NULL | 外键→Users.id |
| carKm | DECIMAL(8,1) | 否 | 0 | 私家车月里程（km） |
| publicTransportKm | DECIMAL(8,1) | 否 | 0 | 公共交通月里程（km） |
| electricityKwh | DECIMAL(8,1) | 否 | 0 | 月用电量（kWh） |
| gasM3 | DECIMAL(8,1) | 否 | 0 | 月天然气用量（m3） |
| meatFrequency | ENUM | 否 | medium | 肉类频率：low/medium/high |
| transportEmission | DECIMAL(8,2) | 否 | 0 | 交通碳排放（kg CO2e） |
| energyEmission | DECIMAL(8,2) | 否 | 0 | 能源碳排放（kg CO2e） |
| lifestyleEmission | DECIMAL(8,2) | 否 | 0 | 生活碳排放（kg CO2e） |
| totalEmission | DECIMAL(8,2) | 否 | 0 | 月度总排放（kg CO2e） |
| rating | ENUM | 否 | medium | 评级：low/medium/high |
| aiAdvice | TEXT | 是 | NULL | AI减排建议 |
| createdAt | DATETIME | 否 | — | 分析时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 8. Achievements（成就定义表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT UNSIGNED | 否 | 自增 | 主键 |
| code | VARCHAR(50) | 否 | — | 成就唯一代码（如 ECO_BEGINNER） |
| name | VARCHAR(100) | 否 | — | 成就名称 |
| description | VARCHAR(500) | 否 | — | 成就描述 |
| icon | VARCHAR(255) | 是 | NULL | 图标或emoji |
| category | VARCHAR(50) | 否 | general | general/recycling/community/carbon/volunteer |
| conditionJson | JSON | 否 | — | 解锁条件（如 {"type":"points","value":100}） |
| pointsReward | INT | 否 | 0 | 解锁奖励积分 |
| rarity | ENUM | 否 | common | common/rare/epic/legendary |
| sortOrder | INT | 否 | 0 | 展示排序 |
| createdAt | DATETIME | 否 | — | 创建时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

**预置成就列表：**

| code | name | category | 解锁条件 | 奖励积分 | 稀有度 |
|------|------|----------|---------|---------|--------|
| ECO_BEGINNER | 环保新手 | recycling | 完成1次垃圾识别 | 10 | common |
| ECO_IDENTIFIER | 分类达人 | recycling | 完成10次垃圾识别 | 30 | rare |
| ECO_RECYCLER | 旧物重构师 | recycling | 完成1次旧物重构 | 10 | common |
| ECO_CREATOR | 创意改造家 | recycling | 完成5次旧物重构 | 50 | rare |
| CARBON_TRACKER | 碳足迹记录者 | carbon | 完成1次碳足迹分析 | 10 | common |
| CARBON_HERO | 低碳英雄 | carbon | 月碳排放达低碳评级 | 50 | epic |
| COMMUNITY_STAR | 社区之星 | community | 发布1篇社区帖子 | 10 | common |
| POPULAR_POSTER | 人气博主 | community | 累计获50个点赞 | 30 | rare |
| VOLUNTEER_HEART | 志愿之心 | volunteer | 参与1次志愿活动 | 20 | common |
| ECO_WARRIOR | 环保勇士 | general | 积分达500分 | 100 | epic |
| GREEN_LEGEND | 绿色传奇 | general | 积分达2000分 | 500 | legendary |

### 9. UserAchievements（用户成就记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | BIGINT UNSIGNED | 否 | 自增 | 主键 |
| userId | CHAR(36) | 否 | — | 外键→Users.id |
| achievementId | INT UNSIGNED | 否 | — | 外键→Achievements.id |
| unlockedAt | DATETIME | 否 | — | 解锁时间 |
| createdAt | DATETIME | 否 | — | 创建时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 10. VolunteerActivities（志愿者活动表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | CHAR(36) | 否 | UUID v4 | 主键 |
| title | VARCHAR(200) | 否 | — | 活动标题 |
| description | TEXT | 是 | NULL | 活动详情 |
| category | VARCHAR(50) | 否 | cleanup | cleanup/planting/recycling/education |
| location | VARCHAR(255) | 是 | NULL | 活动地点 |
| startTime | DATETIME | 否 | — | 开始时间 |
| endTime | DATETIME | 是 | NULL | 结束时间 |
| maxParticipants | INT | 是 | NULL | 最大人数（NULL=不限） |
| currentCount | INT | 否 | 0 | 当前报名人数 |
| pointsReward | INT | 否 | 0 | 参与奖励积分 |
| status | ENUM | 否 | upcoming | upcoming/ongoing/completed/cancelled |
| coverImage | VARCHAR(1000) | 是 | NULL | 封面图URL |
| organizerId | CHAR(36) | 是 | NULL | 发布者用户ID |
| createdAt | DATETIME | 否 | — | 创建时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

### 11. VolunteerEnrollments（志愿者报名记录表）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | BIGINT UNSIGNED | 否 | 自增 | 主键 |
| userId | CHAR(36) | 否 | — | 外键→Users.id |
| activityId | CHAR(36) | 否 | — | 外键→VolunteerActivities.id |
| status | ENUM | 否 | enrolled | enrolled/attended/cancelled |
| remark | VARCHAR(500) | 是 | NULL | 参与感想 |
| pointsAwarded | INT | 否 | 0 | 实际发放积分 |
| enrolledAt | DATETIME | 否 | — | 报名时间 |
| createdAt | DATETIME | 否 | — | 创建时间 |
| updatedAt | DATETIME | 否 | — | 更新时间 |

---

## 六、表关系与外键

```
Users
  |
  |--< Posts                ON DELETE SET NULL
  |     (一用户多帖子，用户删除帖子保留)
  |
  |--< PostLikes            ON DELETE CASCADE
  |     (用户删除则点赞记录删除)
  |
  |--< ChatHistories        ON DELETE CASCADE
  |     (用户删除则聊天记录删除)
  |
  |--< ReconstructionRecords   ON DELETE SET NULL
  |     (用户删除重构记录保留)
  |
  |--< WasteRecognitionRecords ON DELETE SET NULL
  |     (用户删除识别记录保留)
  |
  |--< CarbonFootprintRecords  ON DELETE SET NULL
  |     (用户删除碳足迹记录保留)
  |
  |--< UserAchievements     ON DELETE CASCADE
  |     (用户删除则成就记录删除)
  |
  |--< VolunteerActivities  ON DELETE SET NULL
  |     (用户删除活动保留，organizer置NULL)
  |
  |--< VolunteerEnrollments ON DELETE CASCADE
        (用户删除则报名记录删除)

Posts
  |--< PostLikes            ON DELETE CASCADE

Achievements
  |--< UserAchievements     ON DELETE CASCADE

VolunteerActivities
  |--< VolunteerEnrollments ON DELETE CASCADE
```

---

## 七、接口与数据库操作对应

### 认证模块 `/api/v1/auth`

| 方法 | 路径 | 数据库操作 | 涉及字段 |
|------|------|-----------|----------|
| POST | /register | Users.create() | email, password(bcrypt), username, emailVerificationToken |
| POST | /login | Users.findOne() | email/username, password比对, lastLoginAt, lastLoginIp |
| GET | /google/callback | Users.findOrCreate() | googleId, email, username, avatar |
| GET | /microsoft/callback | Users.findOrCreate() | microsoftId, email, username |

### 用户模块 `/api/v1/users`

| 方法 | 路径 | 数据库操作 | 涉及字段 |
|------|------|-----------|----------|
| GET | /me | req.user（JWT注入） | id, username, email, points, avatar |
| POST | /me/points | user.save() | points（±amount，最小0，单次限±10000） |

### 聊天模块 `/api/v1/chat`

| 方法 | 路径 | 数据库操作 | 说明 |
|------|------|-----------|------|
| POST | /completions | ChatHistory.create()×2 | 保存用户消息和AI回复（仅登录用户） |
| GET | /history | ChatHistory.findAll() | 按createdAt ASC返回全部记录 |
| DELETE | /history | ChatHistory.destroy() | 删除当前用户全部聊天记录 |

### 社区模块 `/api/v1/community`

| 方法 | 路径 | 数据库操作 | 说明 |
|------|------|-----------|------|
| GET | /posts | Post.findAndCountAll() | 分页，sort=popular(likes_count DESC)或latest(createdAt DESC) |
| POST | /posts | Post.create() | content+image_urls，需登录 |
| POST | /posts/:id/like | post.save() | likes_count +1/-1，最小0 |

### 文件上传 `/api/v1/upload`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | / | multer上传至uploads/，返回URL，不写数据库 |

### 旧物重构 `/api/v1/reconstruction`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /analyze | 接收图片，返回AI模拟分析（ReconstructionRecords待接入） |

### 天气模块 `/api/v1/weather`

> 纯第三方API代理，不涉及数据库操作。

---

## 八、常用 SQL 查询示例

```sql
-- 积分排行榜 Top 10
SELECT username, avatar, points
FROM Users
ORDER BY points DESC
LIMIT 10;

-- 最新帖子列表（带作者信息）
SELECT p.id, LEFT(p.content,100) AS preview,
       p.likes_count, p.createdAt,
       u.username AS author, u.avatar
FROM Posts p
LEFT JOIN Users u ON p.userId = u.id
ORDER BY p.createdAt DESC
LIMIT 20;

-- 热门帖子 Top 10
SELECT p.id, LEFT(p.content,100) AS preview,
       p.likes_count, u.username AS author
FROM Posts p
LEFT JOIN Users u ON p.userId = u.id
ORDER BY p.likes_count DESC
LIMIT 10;

-- 查看某用户聊天历史
SELECT role, LEFT(content,200) AS preview, createdAt
FROM ChatHistories
WHERE userId = 'your-user-id'
ORDER BY createdAt ASC;

-- 月碳足迹趋势（某用户近6次）
SELECT totalEmission, rating, createdAt
FROM CarbonFootprintRecords
WHERE userId = 'your-user-id'
ORDER BY createdAt DESC
LIMIT 6;

-- 旧物重构历史（含AI建议数量）
SELECT id, material, carbonReduction,
       JSON_LENGTH(suggestions) AS suggestion_count,
       pointsEarned, createdAt
FROM ReconstructionRecords
WHERE userId = 'your-user-id'
ORDER BY createdAt DESC;

-- 某用户已解锁成就
SELECT a.name, a.icon, a.category, a.rarity, ua.unlockedAt
FROM UserAchievements ua
JOIN Achievements a ON ua.achievementId = a.id
WHERE ua.userId = 'your-user-id'
ORDER BY ua.unlockedAt DESC;

-- 即将开始的志愿活动
SELECT title, location, startTime,
       currentCount, maxParticipants, pointsReward
FROM VolunteerActivities
WHERE status = 'upcoming'
ORDER BY startTime ASC;

-- 垃圾识别分类统计
SELECT wasteCategory,
       COUNT(*) AS total,
       AVG(confidence) AS avg_confidence
FROM WasteRecognitionRecords
GROUP BY wasteCategory
ORDER BY total DESC;

-- 数据统计概览
SELECT
    (SELECT COUNT(*) FROM Users)                 AS total_users,
    (SELECT COUNT(*) FROM Posts)                 AS total_posts,
    (SELECT COUNT(*) FROM ChatHistories)         AS total_messages,
    (SELECT COUNT(*) FROM ReconstructionRecords) AS total_reconstructions,
    (SELECT COUNT(*) FROM WasteRecognitionRecords) AS total_waste_scans,
    (SELECT COUNT(*) FROM VolunteerEnrollments)  AS total_enrollments;
```

---

## 九、索引说明

### Users 表

| 索引名 | 字段 | 类型 | 用途 |
|--------|------|------|------|
| PRIMARY | id | 主键 | 所有关联查询 |
| uq_users_email | email | 唯一 | 登录查询 |
| uq_users_googleId | googleId | 唯一 | OAuth登录 |
| uq_users_microsoftId | microsoftId | 唯一 | OAuth登录 |
| idx_users_username | username | 普通 | 注册重名检查 |
| idx_users_points | points DESC | 普通 | 积分排行榜 |
| idx_users_lastLoginAt | lastLoginAt | 普通 | 活跃用户统计 |

### Posts 表

| 索引名 | 字段 | 类型 | 用途 |
|--------|------|------|------|
| PRIMARY | id | 主键 | 帖子详情 |
| idx_posts_userId | userId | 普通 | 用户帖子列表 |
| idx_posts_createdAt | createdAt DESC | 普通 | 最新排序分页 |
| idx_posts_likes_count | likes_count DESC | 普通 | 热门排序分页 |

### ChatHistories 表

| 索引名 | 字段 | 类型 | 用途 |
|--------|------|------|------|
| idx_chat_userId_createdAt | (userId, createdAt ASC) | 复合 | getHistory精准查询 |
| idx_chat_role | role | 普通 | 角色过滤统计 |

### CarbonFootprintRecords 表

| 索引名 | 字段 | 类型 | 用途 |
|--------|------|------|------|
| idx_carbon_userId | userId | 普通 | 用户历史查询 |
| idx_carbon_totalEmission | totalEmission | 普通 | 排放量排序统计 |

---

## 十、开发常用操作

### 生成 bcrypt 密码哈希

```bash
node -e "const b=require('bcryptjs'); b.hash('Test@1234',10).then(h=>console.log(h));"
```

### 验证数据库连接

```bash
node -e "
const db = require('./models');
db.sequelize.authenticate()
  .then(() => { console.log('✅ 数据库连接正常'); process.exit(0); })
  .catch(e => { console.error('❌', e.message); process.exit(1); });
"
```

### 手动同步模型（开发环境）

```bash
# alter: true —— 自动修改已有表（保留数据）
node -e "const db=require('./models'); db.sequelize.sync({alter:true}).then(()=>{console.log('同步完成');process.exit(0);})"
```

### 清空某用户聊天记录

```sql
DELETE FROM ChatHistories WHERE userId = 'your-user-id';
```

### 重置某用户积分

```sql
UPDATE Users SET points = 0 WHERE id = 'your-user-id';
```

### 手动解锁成就

```sql
INSERT IGNORE INTO UserAchievements (userId, achievementId, unlockedAt, createdAt, updatedAt)
SELECT 'your-user-id', id, NOW(), NOW(), NOW()
FROM Achievements WHERE code = 'ECO_BEGINNER';
```

---

## 十一、重置数据库（慎用）

> ⚠️ 以下操作会**清空所有数据**，仅在开发环境使用。

```sql
DROP DATABASE IF EXISTS `greenn_web`;
```

重新初始化：

```bash
cd grennn_backend
node scripts/init_db.js
```

---

## 十二、相关文件索引

| 文件路径 | 说明 |
|----------|------|
| `scripts/init_database.sql` | 完整建库建表SQL（含索引、外键、种子数据） |
| `scripts/init_db.js` | Node.js初始化脚本（读取.env + 执行SQL） |
| `scripts/mysql.md` | 本文档 |
| `config/database.js` | Sequelize连接配置（读取.env） |
| `models/User.js` | 用户模型定义 |
| `models/Post.js` | 帖子模型（含belongsTo/hasMany关联） |
| `models/ChatHistory.js` | 聊天历史模型 |
| `models/index.js` | 统一导出所有模型和sequelize实例 |
| `controllers/authController.js` | 注册/登录/OAuth，写入Users表 |
| `controllers/userController.js` | 用户信息、积分更新 |
| `controllers/chatController.js` | AI聊天，读写ChatHistories |
| `controllers/communityController.js` | 帖子增删改查，读写Posts |
| `controllers/reconstructionController.js` | 旧物分析（ReconstructionRecords待接入） |
| `.env` | 环境变量配置（不提交git） |
| `server.js` | 应用入口，sequelize.sync({alter:true}) |
