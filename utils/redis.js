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
