/**
 * config/passport.js - Passport OAuth 策略配置
 *
 * 配置第三方登录策略：
 *   - Google OAuth 2.0（通过 passport-google-oauth20）
 *   - Microsoft OAuth 2.0（通过 passport-microsoft）
 *
 * 策略加载条件：对应的 CLIENT_ID 环境变量存在且不为占位符时才注册，
 * 避免因未配置凭据导致启动报错。
 *
 * 用户匹配规则（Google / Microsoft 通用）：
 *   1. 优先通过第三方 ID 查找已有账号
 *   2. 若不存在，则检查邮箱是否已注册 → 已注册则关联第三方 ID
 *   3. 都不存在则创建新用户
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

// ── Session 序列化 / 反序列化 ────────────────────────────────────────────────
// 本项目使用 JWT 无状态认证，serializeUser/deserializeUser 仅为 Passport 框架要求，
// 实际业务中 JWT 令牌由 authController.oauthCallback 生成并返回给前端。

/**
 * 序列化用户：将用户 ID 存入 session（仅保存最小标识）
 */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/**
 * 反序列化用户：从 session 中的 ID 查询完整用户对象
 */
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ── Google OAuth 2.0 策略 ────────────────────────────────────────────────────
// 仅当 GOOGLE_CLIENT_ID 已配置（且非占位符）时注册该策略

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,         // Google 应用客户端 ID
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google 应用客户端密钥
            // OAuth 授权成功后 Google 重定向到此 URL
            callbackURL: `${process.env.CALLBACK_URL_BASE}/api/v1/auth/google/callback`
        },
        /**
         * Google OAuth 验证回调
         * @param {string} accessToken  - Google 颁发的访问令牌（用于调用 Google API）
         * @param {string} refreshToken - 刷新令牌（本项目暂不使用）
         * @param {object} profile      - Google 返回的用户资料（id、emails、displayName 等）
         * @param {function} done       - Passport 完成回调
         */
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. 尝试通过 Google ID 查找已绑定账号
                let user = await User.findOne({ where: { googleId: profile.id } });

                if (!user) {
                    // 2. Google ID 未找到，检查邮箱是否已注册
                    const existingUser = await User.findOne({ where: { email: profile.emails[0].value } });

                    if (existingUser) {
                        // 邮箱已存在 → 将 Google ID 关联到现有账号
                        existingUser.googleId = profile.id;
                        await existingUser.save();
                        return done(null, existingUser);
                    }

                    // 3. 全新用户 → 创建账号
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.displayName,
                        avatar: profile.photos[0]?.value // 头像 URL（可能为 undefined）
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

// ── Microsoft OAuth 2.0 策略 ─────────────────────────────────────────────────
// 仅当 MICROSOFT_CLIENT_ID 已配置（且非占位符）时注册该策略

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_ID !== 'your_microsoft_client_id') {
    passport.use(new MicrosoftStrategy(
        {
            clientID: process.env.MICROSOFT_CLIENT_ID,         // Azure 应用客户端 ID
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET, // Azure 应用客户端密钥
            // OAuth 授权成功后 Microsoft 重定向到此 URL
            callbackURL: `${process.env.CALLBACK_URL_BASE}/api/v1/auth/microsoft/callback`,
            scope: ['user.read'] // 申请读取用户基本资料权限
        },
        /**
         * Microsoft OAuth 验证回调
         * @param {string} accessToken  - Microsoft 颁发的访问令牌
         * @param {string} refreshToken - 刷新令牌（本项目暂不使用）
         * @param {object} profile      - Microsoft 返回的用户资料
         * @param {function} done       - Passport 完成回调
         */
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. 尝试通过 Microsoft ID 查找已绑定账号
                let user = await User.findOne({ where: { microsoftId: profile.id } });

                if (!user) {
                    // 获取邮箱（部分 Microsoft 账号可能不返回邮箱）
                    const email = profile.emails && profile.emails.length > 0
                        ? profile.emails[0].value
                        : null;

                    if (email) {
                        // 2. 检查邮箱是否已注册 → 关联 Microsoft ID
                        const existingUser = await User.findOne({ where: { email } });
                        if (existingUser) {
                            existingUser.microsoftId = profile.id;
                            await existingUser.save();
                            return done(null, existingUser);
                        }
                    }

                    // 3. 全新用户 → 创建账号
                    // 若无法获取邮箱，使用 <microsoftId>@microsoft.com 作为兜底邮箱
                    user = await User.create({
                        microsoftId: profile.id,
                        email: email || `${profile.id}@microsoft.com`,
                        username: profile.displayName || 'Microsoft User',
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

module.exports = passport;
