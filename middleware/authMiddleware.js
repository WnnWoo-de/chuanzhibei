/**
 * middleware/authMiddleware.js - JWT 身份认证中间件
 *
 * 提供两种认证策略：
 *
 *   protect      - 严格认证：请求必须携带有效 JWT，否则返回 401。
 *                  用于需要登录才能访问的接口（如发帖、修改积分等）。
 *
 *   optionalAuth - 可选认证：有令牌则解析用户，无令牌或令牌无效则以游客身份继续。
 *                  用于同时支持登录用户和游客的接口（如聊天、查看历史等）。
 *
 * JWT 令牌格式：Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 严格认证中间件 - 必须登录
 *
 * 从请求头 Authorization 中提取 Bearer 令牌，验证签名并查询对应用户。
 * 验证成功后将用户对象挂载到 req.user，并调用 next() 继续处理。
 * 验证失败返回 401 Unauthorized。
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const protect = async (req, res, next) => {
    let token;

    // 检查请求头中是否存在以 Bearer 开头的 Authorization 字段
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 提取令牌字符串（去掉 'Bearer ' 前缀）
            token = req.headers.authorization.split(' ')[1];

            // 使用服务器密钥验证令牌签名并解码载荷
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 根据令牌中的用户 ID 查询数据库，将完整用户对象挂载到 req.user
            req.user = await User.findByPk(decoded.id);

            next(); // 认证通过，继续执行后续中间件或路由处理器
        } catch (error) {
            // 令牌签名无效、已过期或其他 JWT 错误
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        // 请求头中不含 Bearer 令牌
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

/**
 * 可选认证中间件 - 支持游客模式
 *
 * 逻辑与 protect 相同，但令牌缺失或无效时不返回 401，
 * 而是将 req.user 设为 null 并调用 next() 允许请求继续。
 * 路由处理器中可通过 req.user 是否为 null 区分登录用户和游客。
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id);
        } catch (error) {
            // 令牌无效或已过期 → 当作游客处理，不中断请求
            req.user = null;
        }
    } else {
        // 未携带令牌 → 游客模式
        req.user = null;
    }

    next();
};

module.exports = { protect, optionalAuth };
