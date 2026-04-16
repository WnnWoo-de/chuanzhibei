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

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 使用更简洁的日志格式，仅在开发模式下启用详细日志
const logLevel = process.env.LOG_LEVEL || 'dev';
if (logLevel !== 'quiet') {
    app.use(morgan(logLevel === 'simple' ? 'tiny' : 'dev'));
}

app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
