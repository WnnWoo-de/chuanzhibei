/**
 * routes/community.js - 社区动态路由
 *
 * 挂载路径：/api/v1/community
 *
 * 所有接口均需通过 protect 中间件（必须登录）。
 *
 * 路由列表：
 *   GET  /posts         - 分页获取帖子列表（支持时间/热度排序）
 *   POST /posts         - 发布新帖子（文字 + 可选图片 URL 数组）
 *   POST /posts/:id/like - 为指定帖子点赞或取消点赞
 */

const express              = require('express');
const router               = express.Router();
const communityController  = require('../controllers/communityController');
const { protect }          = require('../middleware/authMiddleware');

// 获取帖子列表（分页）
router.get('/posts',              protect, communityController.getPosts);

// 发布新帖子
router.post('/posts',             protect, communityController.createPost);

// 为帖子点赞 / 取消点赞
router.post('/posts/:id/like',    protect, communityController.likePost);

module.exports = router;
