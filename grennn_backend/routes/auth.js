/**
 * routes/auth.js - 认证路由
 *
 * 挂载路径：/api/v1/auth
 *
 * 路由列表：
 *   POST /register           - 本地账号注册（邮箱 + 密码）
 *   POST /login              - 本地账号登录（邮箱/用户名 + 密码）
 *   GET  /google             - 发起 Google OAuth 授权（重定向到 Google 登录页）
 *   GET  /google/callback    - Google OAuth 授权回调，认证成功后重定向到前端
 *   GET  /microsoft          - 发起 Microsoft OAuth 授权
 *   GET  /microsoft/callback - Microsoft OAuth 授权回调
 *
 * OAuth 流程说明：
 *   1. 前端引导用户访问 /google 或 /microsoft
 *   2. Passport 将用户重定向至第三方登录页
 *   3. 用户授权后，第三方回调到对应 /callback 路由
 *   4. Passport 完成用户查找/创建，调用 oauthCallback 生成 JWT 并跳回前端
 */

const express          = require('express');
const router           = express.Router();
const passport         = require('passport');
const authController   = require('../controllers/authController');

// ── 本地认证 ──────────────────────────────────────────────────────────────────
router.post('/register', authController.register); // 用户注册
router.post('/login',    authController.login);    // 用户登录

// ── Google OAuth 2.0 ─────────────────────────────────────────────────────────
// 请求 Google 授权，scope 指定需要的权限：基本资料 + 邮箱
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
// Google 授权回调：失败重定向到 /login，成功调用 oauthCallback 颁发 JWT
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.oauthCallback
);

// ── Microsoft OAuth 2.0 ──────────────────────────────────────────────────────
// 请求 Microsoft 授权，scope 指定读取用户基本资料
router.get('/microsoft',
    passport.authenticate('microsoft', { scope: ['user.read'] })
);
// Microsoft 授权回调：失败重定向到 /login，成功调用 oauthCallback 颁发 JWT
router.get('/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    authController.oauthCallback
);

module.exports = router;
