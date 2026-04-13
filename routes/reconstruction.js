/**
 * routes/reconstruction.js - 旧物重构路由
 *
 * 挂载路径：/api/v1/reconstruction
 *
 * 路由列表：
 *   POST /analyze - 上传旧物图片并获取 AI 改造建议（需登录）
 *
 * 中间件链说明：
 *   protect          - 验证 JWT，确保用户已登录
 *   upload.single    - multer 处理 multipart/form-data，
 *                      接收字段名为 'file' 的单个图片文件（最大 5MB）
 *   analyzeImage     - 控制器：读取 req.file，返回分析结果
 */

const express                    = require('express');
const router                     = express.Router();
const reconstructionController   = require('../controllers/reconstructionController');
const upload                     = require('../middleware/uploadMiddleware');
const { protect }                = require('../middleware/authMiddleware');

// 上传图片并分析（字段名 'file'，仅支持图片格式，大小 ≤ 5MB）
router.post('/analyze', protect, upload.single('file'), reconstructionController.analyzeImage);

module.exports = router;
