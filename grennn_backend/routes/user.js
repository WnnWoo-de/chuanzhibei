/**
 * routes/user.js - 用户信息路由
 *
 * 挂载路径：/api/v1/users
 *
 * 所有接口均需通过 protect 中间件（必须登录）。
 *
 * 路由列表：
 *   GET  /me        - 获取当前登录用户的基本信息
 *   PUT  /me        - 更新当前登录用户资料
 *   POST /me/points - 为当前用户增加或扣减积分
 */

const express          = require('express');
const router           = express.Router();
const userController   = require('../controllers/userController');
const { protect }      = require('../middleware/authMiddleware');

// 获取当前用户信息（id、username、email、points、avatar、bio 等）
router.get('/me',         protect, userController.getMe);

// 更新当前用户资料（请求体：{ username, avatar, bio }）
router.put('/me',         protect, userController.updateMe);

// 更新当前用户积分（请求体：{ amount: number }，正数加分，负数扣分）
router.post('/me/points', protect, userController.updatePoints);

module.exports = router;
