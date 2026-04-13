/**
 * routes/chat.js - AI 聊天路由
 *
 * 挂载路径：/api/v1/chat
 *
 * 所有接口使用 optionalAuth 中间件：
 *   - 已登录用户：req.user 有值，聊天记录会持久化到数据库
 *   - 游客用户：req.user 为 null，聊天记录仅存在于前端内存
 *
 * 路由列表：
 *   POST   /completions - 发送消息，获取 AI 流式或普通回复
 *   GET    /history     - 获取当前用户的聊天历史记录
 *   DELETE /history     - 清空当前用户的聊天历史记录
 */

const express        = require('express');
const router         = express.Router();
const chatController = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

// 发送消息并获取 AI 回复（支持 SSE 流式输出）
router.post('/completions', optionalAuth, chatController.sendMessage);

// 获取聊天历史记录（游客返回空数组）
router.get('/history',      optionalAuth, chatController.getHistory);

// 清空聊天历史记录（游客直接返回成功）
router.delete('/history',   optionalAuth, chatController.clearHistory);

module.exports = router;
