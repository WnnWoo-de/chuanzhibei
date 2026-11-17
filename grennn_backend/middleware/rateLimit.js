/**
 * middleware/rateLimit.js - 轻量固定窗口限流
 *
 * 用于游客上传、登录/注册等易被滥用的接口。
 * 单实例内存实现，适合比赛/演示部署；多实例部署应改用 Redis。
 */

const buckets = new Map();
let lastCleanup = Date.now();

const cleanup = (now, windowMs) => {
    if (now - lastCleanup < windowMs) return;
    lastCleanup = now;
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
};

const createRateLimiter = ({
    windowMs = 60 * 1000,
    max = 30,
    keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
    message = '请求过于频繁，请稍后再试',
} = {}) => (req, res, next) => {
    const now = Date.now();
    cleanup(now, windowMs);

    const key = keyGenerator(req);
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + windowMs };
        buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
        res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
        return res.status(429).json({ error: message });
    }

    return next();
};

module.exports = { createRateLimiter };