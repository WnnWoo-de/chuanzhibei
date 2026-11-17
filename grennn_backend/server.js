/**
 * server.js - 应用程序入口文件
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const db = require('./models');

dotenv.config();
require('./config/passport');

const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 默认只允许本地前端与 FRONTEND_URL 跨域；部署时可通过 CORS_ORIGINS 配置白名单。
// 如需临时放开所有来源，可显式设置 CORS_ORIGINS=*
const parseOrigins = (value) => String(value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = new Set([
    ...parseOrigins(process.env.CORS_ORIGINS),
    ...parseOrigins(process.env.FRONTEND_URL),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]);
const allowAnyOrigin = allowedOrigins.has('*');

app.disable('x-powered-by');
app.use(cors({
    origin(origin, callback) {
        // 无 Origin 的请求（curl、服务端调用）不受浏览器 CORS 限制
        if (!origin || allowAnyOrigin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    optionsSuccessStatus: 204,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 使用更简洁的日志格式，仅在开发模式下启用详细日志
const logLevel = process.env.LOG_LEVEL || 'dev';
if (logLevel !== 'quiet') {
    app.use(morgan(logLevel === 'simple' ? 'tiny' : 'dev'));
}

app.use(express.json({ limit: '1mb' }));
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '7d',
}));

// 健康检查：用于部署平台探活，不依赖数据库连接
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

app.use('/api/v1/auth',           require('./routes/auth'));
app.use('/api/v1/users',          require('./routes/user'));
app.use('/api/v1/chat',           require('./routes/chat'));
app.use('/api/v1/community',      require('./routes/community'));
app.use('/api/v1/reconstruction', require('./routes/reconstruction'));
app.use('/api/reconstruction',    require('./routes/reconstruction'));
app.use('/api/v1/upload',         require('./routes/upload'));
app.use('/api/v1/weather',        require('./routes/weather'));
app.use('/api/v1/achievements',   require('./routes/achievement'));
app.use('/api/v1/volunteer',      require('./routes/volunteer'));
app.use('/api/v1/waste',          require('./routes/waste'));
app.use('/api/v1/carbon',         require('./routes/carbon'));
app.use('/api/v1/store',          require('./routes/store'));
app.use('/api/v1/quiz',           require('./routes/quiz'));

// 未匹配的 API 路径统一返回 JSON，避免前端拿到 HTML
app.use('/api', (req, res) => {
    res.status(404).json({ error: `API not found: ${req.method} ${req.originalUrl}` });
});

// 统一错误处理：识别 JSON 解析失败、请求体超限与业务抛出的状态码
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: '请求体不是合法的 JSON' });
    }
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({ error: '请求体过大' });
    }

    const status = Number(err?.status || err?.statusCode) || 500;
    if (status >= 500) {
        console.error('Unhandled server error:', err);
    }
    return res.status(status).json({
        error: status >= 500 && process.env.NODE_ENV === 'production'
            ? '服务器内部错误'
            : (err?.message || '服务器内部错误'),
    });
});

const PORT = process.env.PORT || 3000;
const shouldAlterSync = String(process.env.DB_SYNC_ALTER || '').toLowerCase() === 'true';

async function syncDatabase() {
    await db.sequelize.authenticate();
    if (process.env.LOG_LEVEL !== 'quiet') {
        console.log('Database connected.');
    }

    if (!shouldAlterSync) {
        await db.sequelize.sync({ alter: false });
        if (process.env.LOG_LEVEL !== 'quiet') {
            console.log('Database sync done.');
        }
        return;
    }

    try {
        await db.sequelize.sync({ alter: true });
        if (process.env.LOG_LEVEL !== 'quiet') {
            console.log('Database sync with alter done.');
        }
    } catch (err) {
        if (process.env.LOG_LEVEL !== 'quiet') {
            console.error('Sync with alter failed:', err.message);
            console.warn('Falling back to standard sync.');
        }
        await db.sequelize.sync({ alter: false });
        if (process.env.LOG_LEVEL !== 'quiet') {
            console.log('Database sync done.');
        }
    }
}

async function startServer() {
    let dbReady = false;

    try {
        await syncDatabase();
        dbReady = true;
    } catch (err) {
        console.error('Database initialization failed:', err.message);
        console.warn('Database unavailable.');
    }

    app.listen(PORT, () => {
        const statusText = dbReady
            ? ' (database connected)'
            : ' (database unavailable)';

        console.log(`Server running on port ${PORT}${statusText}`);
    });
}

startServer();
