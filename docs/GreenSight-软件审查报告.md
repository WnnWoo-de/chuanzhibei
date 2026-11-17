# GreenSight（绿我同行）软件审查报告

| 项目 | 内容 |
| --- | --- |
| 审查日期 | 2026 年 11 月 7 日 |
| 审查范围 | 本地 `chuanzhibei-main2`、GitHub `main` 和 Cloudflare Pages 公开站点 |
| 项目结构 | Vue 3 / Vite 前端、Express / MySQL 后端、FastAPI 视觉识别服务 |
| 审查方式 | 源码检查、前端构建与测试、隔离复现、线上只读 HTTP 检查 |

## 1. 审查结论

**Cloudflare Pages 已上线前端页面，但抽查的业务 API 都返回了首页 HTML。** 当前链接适合作为前端演示入口。开放真实注册、上传、积分和兑换前，应先修复聊天脚本注入、积分与兑换、离线操作归属以及游客上传限制，再接通后端并验收完整流程。

前端已按业务拆分页面和服务，生产构建可以生成静态资源与 PWA 文件。后端使用 bcrypt 存储密码，聊天历史查询按当前用户筛选，兑换也已将库存和兑换记录写入同一事务。现有测试覆盖了部分组件和工具函数，但当前测试与 lint 均未通过。

## 2. 线上部署验证

- [GitHub 仓库](https://github.com/WnnWoo-de/chuanzhibei) 提供源码和部署记录。[Cloudflare Pages](https://chuanzhibei.pages.dev/) 是本次验证的站点。
- [GitHub Actions 部署记录](https://github.com/WnnWoo-de/chuanzhibei/actions/runs/26630287647) 对应 `main` 提交 `6616114`，运行结果为成功。[工作流](https://github.com/WnnWoo-de/chuanzhibei/blob/main/.github/workflows/verify-web-build.yml) 构建前端并上传 `dist`，未部署 Express、MySQL 或 FastAPI。
- 本地 [Vite 配置](../grennn_web/vite.config.js#L135) 只在开发服务器中代理 `/api` 到 `localhost:3000`。[Cloudflare 配置](../wrangler.toml#L6) 指向 `dist`，[静态路由规则](../grennn_web/public/_redirects#L1) 将未匹配的路径回退到首页。

| 实测 GET 路径 | HTTP 状态 | 响应内容 |
| --- | --- | --- |
| `/` | 200 | GreenSight 首页 HTML |
| `/chat` | 200 | 同一份 HTML，由 Vue 负责页面路由 |
| `/api/v1/users/me` | 200 | 与首页逐字节相同的 HTML |
| `/api/v1/weather/query?city=Beijing` | 200 | 与首页逐字节相同的 HTML |
| `/api/v1/store/products` | 200 | 与首页逐字节相同的 HTML |
| `/api/v1/volunteer/activities` | 200 | 与首页逐字节相同的 HTML |

天气查询在响应无法解析为 JSON 时会回退到本地模拟数据，并在页面上标明模拟模式。演示时应按模拟数据介绍。正式部署需为 `/api/*` 配置后端转发，避免接口失败时被静态回退规则掩盖。验收时同时检查 HTTP 状态、`Content-Type` 和响应结构。

## 3. 优先修复项

P1 指开放真实业务前应解决的问题。P2 指影响功能完整性、并发能力或交付质量的问题。

| 编号 | 优先级 | 问题 | 证据 |
| --- | --- | --- | --- |
| GS-01 | P1 | 聊天 Markdown 可注入脚本 | 本地复现，线上聊天包含同一渲染逻辑 |
| GS-02 | P1 | 普通用户可直接增加积分 | 隔离复现 |
| GS-03 | P1 | 并发兑换可少扣积分 | 隔离复现 |
| GS-04 | P1 | 离线写操作和聊天缓存缺少账号隔离 | 离线重放已复现，聊天缓存经源码确认 |
| GS-05 | P1 | 游客上传未限制文件大小 | 源码确认 |
| GS-06 | P2 | 找回密码与 OAuth 回调存在缺口 | 源码确认，Passport 错误已隔离复现 |
| GS-07 | P2 | 答题记录信任客户端传入的分数 | 隔离复现 |
| GS-08 | P2 | AI 识别的同步模型调用阻塞事件循环 | 源码确认 |

### GS-01 聊天 Markdown 可注入脚本

自定义 Markdown 渲染器将链接标题和地址直接拼进 HTML，聊天组件通过 `v-html` 插入结果。隔离复现中，包含引号的链接标题被解析为鼠标事件属性，触发事件后测试脚本成功执行。线上聊天资源包保留了相同的渲染逻辑。接入真实 AI 回复后，恶意内容在当前站点执行脚本，可能读取存放于 `localStorage` 的登录令牌。

**修复建议。** 对 Markdown 生成的 HTML 做净化，限制链接协议，并回归检查链接标题、事件属性和 `javascript:` 链接。[Markdown 渲染器](../grennn_web/src/views/chat/chatMarkdown.js#L5) · [消息组件](../grennn_web/src/views/chat/components/ChatMessageList.vue#L32)

### GS-02 普通用户可直接增加积分

`POST /api/v1/users/me/points` 允许登录用户提交积分变化量，只检查数值与单次上限。隔离测试中，未提交任何业务事件仍可单次增加 10,000 分，并可重复调用。这会影响排行榜和积分兑换。

**修复建议。** 由服务端核实答题、识别或志愿服务等业务事件并计算奖励。用唯一的事件标识防止重复发分。[积分接口](../grennn_backend/controllers/userController.js#L117)

### GS-03 并发兑换可少扣积分

兑换事务锁定了商品行，校验和扣分仍使用鉴权阶段读出的用户余额。隔离测试中，两个请求均预先读到 500 分，各自成功兑换 500 分的商品，最终余额为 0，共扣 500 分。

**修复建议。** 在事务内锁定并重新读取用户余额，或用带余额条件的原子更新扣分。将扣分、扣库存和记录写入放在同一事务中。[兑换逻辑](../grennn_backend/controllers/storeController.js#L101)

### GS-04 离线操作和聊天缓存缺少账号隔离

离线队列没有记录原始账号，重放时由请求拦截器附加当前账号的凭据。隔离测试中，A 断网时排队的帖子在切换到 B 后带着 B 的凭据发送。聊天历史也使用全局缓存键，登出后个人中心可能展示前一位用户的聊天片段。

**修复建议。** 按账号隔离队列和聊天缓存，重放前确认账号归属。对发帖、兑换等写操作增加幂等校验，覆盖断网、换号、重试三种情况。[离线队列](../grennn_web/src/utils/pwaSync.js#L87) · [聊天缓存](../grennn_web/src/stores/user.js#L454) · [个人中心](../grennn_web/src/views/system/ProfileView.vue#L249)

### GS-05 游客上传未限制文件大小

垃圾识别接口允许游客上传，使用 Multer 将文件读入进程内存，且未设置 `fileSize`。大文件或并发上传可能导致后端内存耗尽。JSON 请求体限制无法约束该接口使用的 multipart 上传。

**修复建议。** 限制请求和文件大小、文件数量，校验图片实际格式，并限制游客请求频率和并发。[上传路由](../grennn_backend/routes/waste.js#L8)

### GS-06 找回密码与 OAuth 回调存在缺口

前端调用 `/api/v1/auth/verify-email` 和 `/api/v1/auth/reset-password`，当前 Express 没有注册这两个路由。Google、Microsoft 回调使用 Passport 默认的登录会话行为，但 Express 没有配置会话中间件。隔离验证复现了 `Login sessions require session support`。

**修复建议。** 为找回密码实现通过邮箱送达、一次性且限时的令牌。OAuth 回调按 JWT 方案配置 `session: false`，并验证授权请求与回调的关联。[找回密码请求](../grennn_web/src/stores/user.js#L339) · [OAuth 路由](../grennn_backend/routes/auth.js#L17)

### GS-07 答题记录信任客户端分数

隔离测试中，使用未知题号且不提交答案仍能保存 `earnedPoints=9999` 的记录。这能伪造答题成绩。该记录接口本身没有更新用户积分余额。

**修复建议。** 由服务端核验题目、选项和提交状态，根据标准答案计算成绩，限制同一答题机会的重复提交。[答题记录接口](../grennn_backend/controllers/quizController.js#L89)

### GS-08 AI 模型调用阻塞事件循环

FastAPI 的异步识别处理器调用同步 OpenAI SDK。模型响应较慢时，同一进程的其他请求会被阻塞。旧物重构流程还会连续发起两次模型调用。

**修复建议。** 改用异步客户端或将同步调用放入线程池，并设置上游超时和并发上限。[模型调用](../grennn_backend/ai_service/main.py#L46) · [识别服务](../grennn_backend/ai_service/main.py#L169)

## 4. 构建、测试与交付检查

| 检查 | 结果 |
| --- | --- |
| 前端生产构建 | 通过。Vite 生成了静态产物和 PWA 文件。最大 JS 产物约 597 kB，gzip 后约 221 kB。PWA 预缓存约 7.7 MiB，宜在移动端弱网下测量首次加载。 |
| 前端单元测试 | 16 项通过，1 项断言失败，另有 1 个测试文件未能运行。旧物重构映射的结果与 [测试断言](../grennn_web/src/components/ui/__tests__/BaseButton.spec.js#L196) 不一致。[天气测试](../grennn_web/src/views/weather/__tests__/WeatherQuery.spec.js) 加载 Element Plus CSS 时出现 `Unknown file extension .css`。 |
| ESLint | 对 `src` 的只读检查报告 8 处错误，包括 [Vue 组件的 TypeScript 解析](../grennn_web/src/components/effects/Silk.vue#L11)、[社区页模板的无效属性](../grennn_web/src/views/community/CommunityView.vue#L358) 和未使用变量。 |
| 持续集成 | 当前 GitHub 工作流检查构建和产物目录。单元测试和 lint 尚未作为部署前的检查步骤。 |
| 环境变量 | 本地交付目录包含填写了值的后端 `.env`。在公开 `main` 的文件树和该路径的提交查询中未发现此文件。对外分发应排除 `.env`，并用无真实值的示例文件说明所需变量。 |

## 5. 建议验收顺序

1. **修复 P1。** 验证聊天内容无法注入事件属性，换号后不会重放他人的请求，普通用户无法直接改余额，并发兑换不会超用余额，超限文件在进入识别逻辑前被拒绝。
2. **接通预发布环境。** 让 Cloudflare 的 `/api/*` 指向实际服务，确认未登录的用户接口返回 401 和 JSON，天气接口返回可解析的数据，错误路径不回退到 HTML。
3. **验证业务闭环。** 用专门的测试账号执行注册、登录、上传识别、积分到账、兑换和记录查询，并检查两种 OAuth 回调、密码找回、断网重试及切换账号。
4. **恢复发布检查。** 修复现有单元测试和 lint 错误，在构建与发布之间增加自动检查。比赛演示中持续标记模拟天气、AI 兜底回复和演示管理端。

线上验证范围为公开页面与 GET 响应。积分、兑换、答题和离线重放的复现在隔离环境中进行，未连接生产数据库，也未使用真实用户账号或调用付费 AI 服务。
