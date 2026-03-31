/**
 * controllers/authController.js - 用户认证控制器
 *
 * 处理以下业务逻辑：
 *   register      - 用户注册（本地账号，邮箱+密码）
 *   login         - 用户登录（支持邮箱或用户名）
 *   oauthCallback - OAuth 第三方登录回调（Google / Microsoft）
 *
 * 安全措施：
 *   - 密码使用 bcrypt（cost factor 10）加盐哈希存储
 *   - 认证成功后颁发有效期 24 小时的 JWT 令牌
 *   - 邮箱注册时生成 emailVerificationToken（待发送验证邮件）
 *   - 登录支持邮箱/用户名双模式，防止用户名枚举攻击
 */

const User    = require('../models/User');
const bcrypt  = require('bcryptjs');     // 密码哈希库
const jwt     = require('jsonwebtoken'); // JWT 生成与验证
const { Op }  = require('sequelize');    // Sequelize 操作符（用于 OR 查询）
const crypto  = require('crypto');       // Node.js 内置加密模块（生成随机令牌）

// ── 工具函数 ──────────────────────────────────────────────────────────────────

/**
 * 生成 JWT 访问令牌
 * 载荷包含用户 ID 和邮箱，有效期 24 小时
 * @param {object} user - 用户数据库对象
 * @returns {string} JWT 字符串
 */
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET 环境变量未配置，无法生成令牌');
    }
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * 生成邮箱验证令牌（或密码重置令牌）
 * 使用 crypto 生成 32 字节随机数并转为十六进制字符串（共 64 位）
 * @returns {string} 随机十六进制令牌
 */
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * 统一返回字段级错误响应
 * @param {object} res     - Express Response 对象
 * @param {number} status  - HTTP 状态码
 * @param {string} message - 主错误信息
 * @param {object} errors  - 各字段的详细错误信息（用于前端表单高亮）
 */
const sendFieldError = (res, status, message, errors = {}) => {
    return res.status(status).json({ error: message, errors });
};

/**
 * 获取客户端真实 IP 地址
 * 兼容反向代理场景（如 Nginx）：优先读取 X-Forwarded-For 头
 * @param {object} req - Express Request 对象
 * @returns {string} IP 地址字符串
 */
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip ||
           'unknown';
};

// ── 注册 ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * 用户注册接口
 *
 * 请求体：{ username, email, password }
 * 成功响应（201）：{ message, user, token, access_token }
 *
 * 校验顺序：
 *   1. 用户名非空、长度 2-20
 *   2. 邮箱非空、格式合法
 *   3. 密码非空、长度 ≥ 6
 *   4. 邮箱/用户名唯一性检查
 */
exports.register = async (req, res) => {
    try {
        // 提取并清理请求参数
        const username = String(req.body?.username || '').trim();
        const email    = String(req.body?.email    || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        // ── 参数校验 ──────────────────────────────────────────────────────────
        if (!username) {
            return sendFieldError(res, 400, '请输入用户名', { username: '请输入用户名' });
        }
        if (username.length < 2 || username.length > 20) {
            return sendFieldError(res, 400, '用户名长度需为 2-20 个字符', { username: '用户名长度需为 2-20 个字符' });
        }
        if (!email) {
            return sendFieldError(res, 400, '请输入邮箱地址', { email: '请输入邮箱地址' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return sendFieldError(res, 400, '请输入有效的邮箱格式', { email: '请输入有效的邮箱格式' });
        }
        if (!password) {
            return sendFieldError(res, 400, '请输入密码', { password: '请输入密码' });
        }
        if (password.length < 6) {
            return sendFieldError(res, 400, '密码长度至少为 6 位', { password: '密码长度至少为 6 位' });
        }

        // ── 唯一性检查（邮箱 OR 用户名）────────────────────────────────────────
        const existingUser = await User.findOne({
            where: { [Op.or]: [{ email }, { username }] }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return sendFieldError(res, 409, '该邮箱已被注册', { email: '该邮箱已被注册' });
            }
            if (existingUser.username === username) {
                return sendFieldError(res, 409, '该用户名已被占用', { username: '该用户名已被占用' });
            }
        }

        // ── 创建用户 ──────────────────────────────────────────────────────────
        const hashedPassword     = await bcrypt.hash(password, 10); // bcrypt cost factor = 10
        const verificationToken  = generateVerificationToken();

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            emailVerificationToken:   verificationToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 令牌 24 小时后过期
        });

        const token = generateToken(user);

        // TODO: 发送邮箱验证邮件
        // await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            message: 'User created',
            user: {
                id:            user.id,
                username:      user.username,
                email:         user.email,
                points:        user.points || 0,
                emailVerified: user.emailVerified
            },
            token,
            access_token: token // 兼容前端双字段读取
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 登录 ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * 用户登录接口（支持邮箱或用户名登录）
 *
 * 请求体：{ email, password }  或  { account, password }
 * 成功响应（200）：{ token, access_token, user }
 *
 * 安全说明：
 *   邮箱/用户名错误和密码错误返回相同的错误信息，防止账号枚举攻击
 */
exports.login = async (req, res) => {
    try {
        // 兼容 email 和 account 两个字段名（前端可能使用不同字段）
        const account  = String(req.body?.email || req.body?.account || '').trim();
        const password = String(req.body?.password || '');

        if (!account) {
            return sendFieldError(res, 400, '请输入邮箱或用户名', { email: '请输入邮箱或用户名' });
        }
        if (!password) {
            return sendFieldError(res, 400, '请输入密码', { password: '请输入密码' });
        }

        // 邮箱统一转小写，用户名区分大小写（OR 查询）
        const normalizedEmail = account.toLowerCase();
        const user = await User.findOne({
            where: { [Op.or]: [{ email: normalizedEmail }, { username: account }] }
        });

        // 用户不存在、无本地密码（纯 OAuth 账号）或密码不匹配 → 统一返回认证失败
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return sendFieldError(res, 401, '邮箱/用户名或密码错误', {
                email:    '邮箱/用户名或密码错误',
                password: '邮箱/用户名或密码错误'
            });
        }

        const token = generateToken(user);

        // 更新最后登录信息（方便审核与安全监控）
        user.lastLoginAt = new Date();
        user.lastLoginIp = getClientIp(req);
        await user.save({ fields: ['lastLoginAt', 'lastLoginIp'] });

        res.json({
            token,
            access_token: token, // 兼容前端双字段读取
            user: {
                id:       user.id,
                username: user.username,
                email:    user.email,
                points:   user.points || 0,
                avatar:   user.avatar || ''
            }
        });
    } catch (err) {
        console.error('Login controller error:', err);
        res.status(500).json({ error: '登录过程中发生内部错误，请稍后重试' });
    }
};

// ── OAuth 回调 ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/google/callback
 * GET /api/v1/auth/microsoft/callback
 * OAuth 第三方登录统一回调处理
 *
 * Passport 认证成功后，req.user 已被填充为对应的数据库用户对象。
 * 生成 JWT 令牌并重定向到前端的 /auth/callback 页面（携带 token 参数）。
 */
exports.oauthCallback = (req, res) => {
    const token = generateToken(req.user);
    // 将令牌以 query string 形式传给前端，前端接收后存入本地存储
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
};
