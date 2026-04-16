/**
 * routes/reconstruction.js - 旧物重构路由
 *
 * 挂载路径：/api/v1/reconstruction
 *
 * 路由列表：
 *   POST /analyze - 上传旧物图片并获取 AI 改造建议（游客/登录用户均可）
 *
 * 中间件链说明：
 *   optionalAuth     - 可选认证：有 JWT 则识别用户，无 JWT 则按游客处理
 *   upload.single    - multer 处理 multipart/form-data，
 *                      接收字段名为 'file' 的单个图片文件（最大 5MB）
 *   analyzeImage     - 控制器：读取 req.file，返回分析结果
 */

const express                    = require('express');
const router                     = express.Router();
const reconstructionController   = require('../controllers/reconstructionController');
const upload                     = require('../middleware/uploadMiddleware');
const { optionalAuth }           = require('../middleware/authMiddleware');

// 上传图片并分析（字段名 'file'，仅支持图片格式，大小 ≤ 5MB）
router.post('/analyze', optionalAuth, upload.single('file'), reconstructionController.analyzeImage);

module.exports = router;
