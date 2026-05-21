/**
 * routes/auth.js - 认证模块路由
 * 提供本地账号登录/注册，以及 Google / Microsoft OAuth 登录入口
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// 本地账号注册 / 登录
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth：跳转到 Google 授权页
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// Google OAuth：授权成功后回调到此，再交给统一回调处理器签发 JWT
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.oauthCallback
);

// Microsoft OAuth：跳转到微软授权页
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
// Microsoft OAuth：授权成功后回调并统一重定向回前端
router.get('/microsoft/callback', 
    passport.authenticate('microsoft', { failureRedirect: '/login' }),
    authController.oauthCallback
);

module.exports = router;
