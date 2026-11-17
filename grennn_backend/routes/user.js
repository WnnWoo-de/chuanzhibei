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
 *   GET  /me/points - 查询当前用户的积分流水
 *
 * 注意：不提供客户端直接修改积分的接口，积分由服务端业务事件发放。
 */

const express          = require('express');
const router           = express.Router();
const userController   = require('../controllers/userController');
const { protect }      = require('../middleware/authMiddleware');

// 获取当前用户信息（id、username、email、points、avatar、bio 等）
router.get('/me',         protect, userController.getMe);

// 更新当前用户资料（请求体：{ username, avatar, bio }）
router.put('/me',         protect, userController.updateMe);

// 查询当前用户积分流水
router.get('/me/points',  protect, userController.listPointTransactions);

module.exports = router;
