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
const { IdempotencyKey } = require('../models');
const bcrypt  = require('bcryptjs');     // 密码哈希库
const jwt     = require('jsonwebtoken'); // JWT 生成与验证
const { Op }  = require('sequelize');    // Sequelize 操作符（用于 OR 查询）
const crypto  = require('crypto');       // Node.js 内置加密模块（生成随机令牌）
const passport = require('passport');    // 第三方登录策略
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/email');
const { getUserRole } = require('../services/roles');

const getSafeRedirectPath = (redirect) => {
    if (typeof redirect !== 'string') return '';
    if (!redirect.startsWith('/')) return '';
    if (redirect.startsWith('//')) return '';
    return redirect;
};

const getOAuthRedirectFromState = (state) => {
    if (typeof state !== 'string' || !state) return '';
    try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        return getSafeRedirectPath(decoded?.redirect);
    } catch {
        return '';
    }
};

/** 生成 OAuth state（签名 JWT，10 分钟有效），同时携带回跳路径 */
const createOAuthState = (redirect) => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET 环境变量未配置');
    return jwt.sign(
        { redirect: getSafeRedirectPath(redirect), nonce: crypto.randomBytes(8).toString('hex') },
        process.env.JWT_SECRET,
        { expiresIn: '10m' },
    );
};

/** 对邮箱令牌做哈希后再入库，数据库泄漏时无法直接使用令牌 */
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

/** 是否允许在响应中返回重置令牌（仅用于无 SMTP 的本地演示） */
const isDebugResetEnabled = () => (
    process.env.NODE_ENV !== 'production' &&
    String(process.env.AUTH_DEBUG_RESET || '').toLowerCase() === 'true'
);

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
            emailVerificationToken:   hashToken(verificationToken),
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 令牌 24 小时后过期
        });

        const token = generateToken(user);

        // 异步发送邮箱验证邮件，不阻塞注册响应
        sendVerificationEmail(user.email, verificationToken).catch((err) => {
            console.error('sendVerificationEmail failed:', err?.message);
        });

        res.status(201).json({
            message: 'User created',
            user: {
                id:            user.id,
                username:      user.username,
                email:         user.email,
                points:        user.points || 0,
                emailVerified: user.emailVerified,
                role:          getUserRole(user),
            },
            token,
            access_token: token // 兼容前端双字段读取
        });
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return sendFieldError(res, 409, '该邮箱或用户名已被注册', {
                email: '该邮箱或用户名已被注册',
                username: '该邮箱或用户名已被占用',
            });
        }
        console.error('Register controller error:', err);
        res.status(500).json({ error: '注册失败，请稍后重试' });
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
                avatar:   user.avatar || '',
                role:     getUserRole(user),
            }
        });
    } catch (err) {
        console.error('Login controller error:', err);
        res.status(500).json({ error: '登录过程中发生内部错误，请稍后重试' });
    }
};

// ── 密码重置与邮箱验证 ────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/forgot-password
 * 请求密码重置邮件。无论邮箱是否存在都返回同一提示，避免账号枚举。
 */
exports.forgotPassword = async (req, res) => {
    const genericMessage = '如果该邮箱已注册，我们已发送密码重置邮件，请查收';
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return sendFieldError(res, 400, '请输入有效的邮箱格式', { email: '请输入有效的邮箱格式' });
        }

        const user = await User.findOne({ where: { email } });
        // 第三方账号没有本地密码，同样返回统一提示
        if (!user || !user.password) return res.json({ message: genericMessage });

        const rawToken = generateVerificationToken();
        user.passwordResetToken = hashToken(rawToken);
        user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();

        sendPasswordResetEmail(user.email, rawToken).catch((err) => {
            console.error('sendPasswordResetEmail failed:', err?.message);
        });

        if (isDebugResetEnabled()) {
            return res.json({ message: genericMessage, reset_token: rawToken, debug: true });
        }
        return res.json({ message: genericMessage });
    } catch (err) {
        console.error('forgotPassword controller error:', err);
        return res.status(500).json({ error: '发送重置邮件失败，请稍后重试' });
    }
};

/**
 * POST /api/v1/auth/reset-password
 * 使用一次性令牌重置密码。请求体：{ token, password }
 */
exports.resetPassword = async (req, res) => {
    try {
        const token = String(req.body?.token || '').trim();
        const password = String(req.body?.password || '');

        if (!/^[a-f0-9]{64}$/i.test(token)) {
            return sendFieldError(res, 400, '重置链接无效或已过期', { token: '重置链接无效或已过期' });
        }
        if (!password || password.length < 8) {
            return sendFieldError(res, 400, '密码长度至少为 8 位', { password: '密码长度至少为 8 位' });
        }

        const user = await User.findOne({
            where: {
                passwordResetToken: hashToken(token),
                passwordResetExpires: { [Op.gt]: new Date() },
            },
        });
        if (!user) {
            return sendFieldError(res, 400, '重置链接无效或已过期', { token: '重置链接无效或已过期' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        return res.json({ message: '密码已重置，请使用新密码登录' });
    } catch (err) {
        console.error('resetPassword controller error:', err);
        return res.status(500).json({ error: '重置密码失败，请稍后重试' });
    }
};

/**
 * POST /api/v1/auth/verify-email
 * 使用一次性令牌验证邮箱。请求体：{ token }
 */
exports.verifyEmail = async (req, res) => {
    try {
        const token = String(req.body?.token || '').trim();
        if (!/^[a-f0-9]{64}$/i.test(token)) {
            return sendFieldError(res, 400, '验证链接无效或已过期', { token: '验证链接无效或已过期' });
        }

        const user = await User.findOne({
            where: {
                emailVerificationToken: hashToken(token),
                emailVerificationExpires: { [Op.gt]: new Date() },
            },
        });
        if (!user) {
            return sendFieldError(res, 400, '验证链接无效或已过期', { token: '验证链接无效或已过期' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        return res.json({ message: '邮箱验证成功' });
    } catch (err) {
        console.error('verifyEmail controller error:', err);
        return res.status(500).json({ error: '验证邮箱失败，请稍后重试' });
    }
};

/**
 * POST /api/v1/auth/resend-verification
 * 重新发送邮箱验证邮件；邮箱不存在时仍返回统一提示。
 */
exports.resendVerification = async (req, res) => {
    const genericMessage = '如果该邮箱需要验证，验证邮件已重新发送';
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const user = await User.findOne({ where: { email } });
        if (!user || user.emailVerified) return res.json({ message: genericMessage });

        const rawToken = generateVerificationToken();
        user.emailVerificationToken = hashToken(rawToken);
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        sendVerificationEmail(user.email, rawToken).catch((err) => {
            console.error('sendVerificationEmail failed:', err?.message);
        });
        return res.json({ message: genericMessage });
    } catch (err) {
        console.error('resendVerification controller error:', err);
        return res.status(500).json({ error: '发送验证邮件失败，请稍后重试' });
    }
};

// ── OAuth 回调 ────────────────────────────────────────────────────────────────

/** OAuth 授权入口：生成签名 state 并跳转到第三方授权页 */
exports.oauthStart = (provider) => (req, res, next) => {
    const scope = provider === 'google' ? ['profile', 'email'] : ['user.read'];
    const state = createOAuthState(req.query?.redirect);
    return passport.authenticate(provider, { scope, state, session: false })(req, res, next);
};

/** OAuth 回调前校验 state，防止 CSRF 与开放重定向 */
exports.validateOAuthState = (req, res, next) => {
    const state = req.query?.state;
    if (typeof state !== 'string' || !state) {
        return res.status(400).json({ error: '缺少 OAuth state' });
    }
    try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        req.oauthRedirect = getSafeRedirectPath(decoded?.redirect);
        return next();
    } catch {
        return res.status(400).json({ error: 'OAuth state 无效或已过期' });
    }
};

/**
 * GET /api/v1/auth/google/callback
 * GET /api/v1/auth/microsoft/callback
 * OAuth 第三方登录统一回调处理。
 * 不在 URL 中直接传递长期令牌，而是发放 60 秒有效的一次性 code。
 */
exports.oauthCallback = (req, res) => {
    const redirect = req.oauthRedirect || getOAuthRedirectFromState(req.query?.state);
    const code = jwt.sign(
        { id: req.user.id, email: req.user.email, scope: 'oauth-exchange' },
        process.env.JWT_SECRET,
        { expiresIn: '60s', jwtid: crypto.randomBytes(16).toString('hex') },
    );
    const query = new URLSearchParams({ code });
    if (redirect) query.set('redirect', redirect);
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    res.redirect(`${frontendBase}/auth/callback?${query.toString()}`);
};

/**
 * POST /api/v1/auth/oauth/exchange
 * 用一次性 code 换取长期访问令牌。请求体：{ code }
 */
exports.exchangeOAuthCode = async (req, res) => {
    try {
        const code = String(req.body?.code || '');
        if (!code) return res.status(400).json({ error: '缺少授权码' });

        let payload;
        try {
            payload = jwt.verify(code, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: '授权码无效或已过期' });
        }
        if (payload?.scope !== 'oauth-exchange' || !payload?.jti) {
            return res.status(401).json({ error: '授权码类型无效' });
        }

        // 通过主键唯一约束保证同一个 code 只能使用一次
        try {
            await IdempotencyKey.create({
                key: `oauth:${payload.jti}`,
                userId: payload.id,
                status: 200,
                body: {},
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            });
        } catch (err) {
            if (err?.name === 'SequelizeUniqueConstraintError') {
                return res.status(401).json({ error: '授权码已使用，请重新登录' });
            }
            // 幂等表不可用时仍允许登录，但要记录告警
            console.error('OAuth code 去重失败:', err.message);
        }

        const user = await User.findByPk(payload.id);
        if (!user) return res.status(401).json({ error: '用户不存在' });

        return res.json({
            access_token: generateToken(user),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: user.points,
                avatar: user.avatar,
                bio: user.bio,
                emailVerified: user.emailVerified,
                role: getUserRole(user),
            },
        });
    } catch (err) {
        console.error('exchangeOAuthCode controller error:', err);
        return res.status(500).json({ error: '登录失败，请稍后重试' });
    }
};
