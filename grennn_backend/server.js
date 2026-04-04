/**
 * server.js - 应用程序入口文件
 *
 * 负责初始化 Express 应用、注册中间件、挂载路由，
 * 并在数据库同步完成后启动 HTTP 服务器。
 */

const express = require('express');
const cors = require('cors');           // 跨域资源共享中间件
const dotenv = require('dotenv');       // 环境变量加载工具
const passport = require('passport');  // OAuth 认证框架
const db = require('./models');         // 数据库模型集合

// 加载 .env 文件中的环境变量（必须在使用 process.env 之前调用）
dotenv.config();

// 初始化 Passport OAuth 策略（Google / Microsoft）
require('./config/passport');

const path = require('path');
const helmet = require('helmet'); // HTTP 安全头中间件，防止常见 Web 漏洞
const morgan = require('morgan'); // HTTP 请求日志中间件

// 创建 Express 应用实例
const app = express();

// ── 中间件注册 ──────────────────────────────────────────────────────────────

// 允许所有来源的跨域请求（生产环境建议配置白名单）
app.use(cors());

// 设置安全 HTTP 响应头；crossOriginResourcePolicy 设为 cross-origin 以允许跨域访问 /uploads 图片
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 开发模式下打印每条 HTTP 请求的方法、路径、状态码和响应时间
app.use(morgan('dev'));

// 解析请求体中的 JSON 数据，结果挂载到 req.body
app.use(express.json());

// 初始化 Passport（仅做令牌验证，不启用 session）
app.use(passport.initialize());

// ── 静态文件服务 ─────────────────────────────────────────────────────────────

// 将项目根目录下的 uploads/ 文件夹映射为公开的静态资源路径
// 访问方式：GET /uploads/<文件名>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 路由挂载 ─────────────────────────────────────────────────────────────────

app.use('/api/v1/auth',           require('./routes/auth'));           // 认证相关（注册/登录/OAuth）
app.use('/api/v1/users',          require('./routes/user'));           // 用户信息与积分
app.use('/api/v1/chat',           require('./routes/chat'));           // AI 聊天与历史记录
app.use('/api/v1/community',      require('./routes/community'));      // 社区动态（发帖/点赞）
app.use('/api/v1/reconstruction', require('./routes/reconstruction')); // 旧物重构 AI 分析
app.use('/api/v1/upload',         require('./routes/upload'));         // 通用文件上传
app.use('/api/v1/weather',        require('./routes/weather'));        // 天气与空气质量查询

// ── 数据库同步并启动服务器 ────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

// 先尝试数据库连接与自动同步（按需补全字段，不删除现有数据）
// 若因为索引限制（例如 MySQL 最多 64 个索引）导致 alter 失败，退到不变更索引的同步方式
async function startServer() {
    let dbReady = false;

    try {
        await db.sequelize.authenticate();
        console.log('Database connection established.');
        await db.sequelize.sync({ alter: true });
        console.log('Database sync completed with alter.');
        dbReady = true;
    } catch (err) {
        console.error('Database sync with alter failed:', err.message);

        if (err.message && err.message.includes('Too many keys specified')) {
            try {
                console.warn('Detected index limit issue. Retrying sync without alter.');
                await db.sequelize.sync({ alter: false });
                console.log('Database sync completed without alter.');
                dbReady = true;
            } catch (retryErr) {
                console.error('Database sync without alter failed:', retryErr.message);
            }
        }

        if (!dbReady) {
            console.warn('Database is unavailable. Starting server with weather/public routes only.');
        }
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}${dbReady ? '' : ' (database unavailable)'}`);
    });
}

startServer();
