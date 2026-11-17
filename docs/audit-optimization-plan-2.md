# GreenSight 第二轮审计与优化计划

> 审计范围：`grennn_web`（Vue 3 + Vite）与 `grennn_backend`（Express + Sequelize）。
> 目标：在不改变现有架构与业务入口的前提下，修复安全、数据一致性和“假交互”问题，并清理仓库中的生成物。

## 一、审计发现

### P1 - 安全 / 数据一致性

- [x] **CORS 完全开放**：`app.use(cors())` 允许任意站点跨域调用接口。
- [x] **静态上传目录未加固**：`/uploads` 未禁止点文件、未限制缓存策略。
- [x] **缺少统一 JSON 错误处理**：非法 JSON、超限请求、未知 `/api` 路径会返回 HTML 或默认错误页。
- [x] **碳足迹接口缺少输入边界**：负数、`NaN`、超大数值可写入数据库；游客接口无频率限制。
- [x] **点赞计数存在竞态**：`findOne + create + save` 在并发下可能重复计数或抛唯一键错误；模型未声明唯一索引。
- [x] **Vite 开发服务器暴露风险**：默认监听 `0.0.0.0`，同网段设备可通过 `/siliconflow-api` 代理间接使用服务端 API Key。
- [x] **模型与现有表结构漂移**：`Posts.views_count` 存在于模型但数据库中不存在，导致已有部署无法发帖。

### P2 - 正确性 / 体验 / 仓库卫生

- [x] **设置页保存为 Mock**：`SettingsView.vue` 存在 `TODO: 接入后端接口`，修改用户名/简介不会持久化。
- [x] **通知偏好不持久化**：刷新后开关状态丢失。
- [x] **安全区按钮无行为**：修改密码与注销账号按钮点击后没有任何反馈。
- [x] **生产环境强制使用志愿活动 Mock**：`import.meta.env.PROD` 导致真实接口失败时静默展示假数据，且完全不请求真实数据。
- [x] **Mock 状态键包含疑似密钥字面量**：已改为普通、可读的本地存储键。
- [x] **仓库跟踪生成物**：`dev-dist/`、`auto-imports.d.ts`、`components.d.ts` 被提交。
- [x] **遗留重复页面**：未被路由引用的 `LoginView.vue`、`RegisterView.vue`、`WeatherQuery.vue` 增加维护成本。

## 二、实施项

1. 后端入口加固：CORS 白名单、上传目录安全选项、JSON 限制、404/错误处理、关闭 `x-powered-by`、`/api/health`。
2. 碳足迹：数值范围校验、非法输入返回 400、接口限流。
3. 社区点赞：事务 + 行锁，补唯一索引声明；移除数据库中不存在的 `views_count` 字段。
4. 前端设置页：接入 `PUT /api/v1/users/me`；通知偏好按账号持久化；修改密码发送重置邮件；注销入口给出明确指引。
5. 志愿活动：仅当 `VITE_USE_MOCK_VOLUNTEER=true` 时使用 Mock，默认走真实接口。
6. Vite：开发服务器默认只监听本机，API 代理目标可配置，移除带密钥的 `/siliconflow-api` 代理；新增前端环境变量示例。
7. 仓库清理：移除生成物与未引用页面，更新忽略规则。
8. 验证：前端单测、ESLint、生产构建、后端启动与关键接口冒烟。

## 三、验证记录

- `npx eslint src --no-fix`：通过，无输出。
- `npm run test:unit -- --run`：4 个测试文件、20 个测试全部通过。
- `npm run build`：构建成功；仅保留既有的大 chunk 提示。
- 后端 `node --check`：`server.js`、碳足迹/社区/用户控制器、`PostLike` 模型、碳足迹路由全部通过。
- 后端启动：`Database connected`、`Database sync done`、`Server running`。
- `GET /api/health`：200 `{"status":"ok"}`。
- CORS：允许 `http://localhost:5173`，不返回 `http://evil.example` 的允许头。
- 非法 JSON：400 JSON 错误；未知 `/api`：404 JSON；碳足迹负数：400。
- 碳足迹合法游客请求：201，计算值正确。
- 并发点赞 5 次：全部 200，最终仅 1 条点赞记录、计数为 1；取消后计数与记录均归零。
- 局部资料更新：仅传 `username` 时，原有 `bio` 与 `avatar` 保持不变。
- 数据库模型与现有表结构比对：修复后无缺失字段。
