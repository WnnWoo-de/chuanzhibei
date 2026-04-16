/**
 * server.js - 应用程序入口文件
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const db = require('./models');
const { connectRedis, isRedisConnected } = require('./utils/redis');

dotenv.config();
require('./config/passport');

const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
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
    console.log('Database connection established.');

    if (!shouldAlterSync) {
        await db.sequelize.sync({ alter: false });
        console.log('Database sync completed without alter.');
        return;
    }

    try {
        await db.sequelize.sync({ alter: true });
        console.log('Database sync completed with alter.');
    } catch (err) {
        console.error('Database sync with alter failed:', err.message);
        console.warn('Falling back to sync without alter.');
        await db.sequelize.sync({ alter: false });
        console.log('Database sync completed without alter.');
    }
}

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

startServer();
