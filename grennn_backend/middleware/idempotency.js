/**
 * middleware/idempotency.js - 写操作幂等中间件
 *
 * 客户端在写请求中携带 Idempotency-Key 请求头（离线队列重放时沿用同一个键）。
 * 首次成功响应会保存 24 小时；相同键的重复请求直接返回原响应，避免重复发帖、重复兑换。
 * 请求开始时会先写入一条“处理中”记录，防止同一键的并发请求同时执行。
 */

const { UniqueConstraintError } = require('sequelize');
const { IdempotencyKey } = require('../models');

const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const TTL_MS = 24 * 60 * 60 * 1000;
const PROCESSING_TIMEOUT_MS = 2 * 60 * 1000;

module.exports = async function idempotency(req, res, next) {
    const rawKey = req.get('Idempotency-Key');
    if (!rawKey) return next();

    if (!KEY_PATTERN.test(rawKey)) {
        return res.status(400).json({ error: 'Idempotency-Key 格式无效' });
    }

    // 未登录请求不做持久化，避免匿名请求互相占用幂等键
    if (!req.user?.id) return next();

    const key = `${req.user.id}:${rawKey}`;
    const expiresAt = new Date(Date.now() + TTL_MS);

    try {
        const existing = await IdempotencyKey.findByPk(key);
        if (existing) {
            const age = Date.now() - new Date(existing.createdAt).getTime();
            if (existing.status === 0 && age > PROCESSING_TIMEOUT_MS) {
                // 上一次请求可能在处理中崩溃，清理过期占位后重新执行
                await existing.destroy();
            } else if (existing.status === 0) {
                return res.status(409).json({ error: '相同请求正在处理中，请稍后重试' });
            } else if (new Date(existing.expiresAt).getTime() <= Date.now()) {
                await existing.destroy();
            } else {
                return res.status(existing.status).json(existing.body);
            }
        }
    } catch (err) {
        // 幂等表暂不可用时不应阻断正常业务
        void err;
    }

    try {
        await IdempotencyKey.create({
            key,
            userId: req.user.id,
            status: 0,
            body: null,
            expiresAt,
        });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            return res.status(409).json({ error: '相同请求正在处理中，请稍后重试' });
        }
        // 幂等表不可用时继续执行业务，但本次不保证去重
        void err;
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
        const statusCode = res.statusCode || 200;
        if (statusCode >= 200 && statusCode < 300) {
            IdempotencyKey.update(
                { status: statusCode, body, expiresAt },
                { where: { key } },
            ).catch(() => {});
        } else {
            // 业务失败时释放幂等键，允许客户端修正后重试
            IdempotencyKey.destroy({ where: { key } }).catch(() => {});
        }
        return originalJson(body);
    };

    return next();
};