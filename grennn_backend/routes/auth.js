/**
 * routes/auth.js - 认证模块路由
 * 提供本地账号登录/注册、密码重置、邮箱验证，以及 Google / Microsoft OAuth 登录入口
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { createRateLimiter } = require('../middleware/rateLimit');

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: '登录/注册尝试过于频繁，请 15 分钟后再试',
});

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const resetLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: '操作过于频繁，请稍后再试',
});

// 本地账号注册 / 登录
router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

// 密码重置：发送邮件 + 使用一次性令牌重置
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);

// 邮箱验证
router.post('/verify-email', resetLimiter, authController.verifyEmail);
router.post('/resend-verification', resetLimiter, authController.resendVerification);

// OAuth 一次性授权码换取令牌
router.post('/oauth/exchange', resetLimiter, authController.exchangeOAuthCode);

// Google OAuth：跳转到 Google 授权页（无 session，使用签名 state）
router.get('/google', authController.oauthStart('google'));
// Google OAuth：校验 state 后交由 Passport 处理，再签发一次性授权码
router.get('/google/callback',
    authController.validateOAuthState,
    passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/auth?oauth=failed` }),
    authController.oauthCallback
);

// Microsoft OAuth：跳转到微软授权页
router.get('/microsoft', authController.oauthStart('microsoft'));
// Microsoft OAuth：授权成功后回调并统一重定向回前端
router.get('/microsoft/callback',
    authController.validateOAuthState,
    passport.authenticate('microsoft', { session: false, failureRedirect: `${frontendUrl}/auth?oauth=failed` }),
    authController.oauthCallback
);

module.exports = router;