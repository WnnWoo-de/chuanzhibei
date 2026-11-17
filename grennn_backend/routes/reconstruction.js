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
 *   handleUpload     - multer 处理 multipart/form-data，接收字段 'file'（最大 5MB）
 *   validateImage    - 校验文件头，拒绝伪造 MIME 的非图片内容
 *   analyzeImage     - 控制器：读取 req.file，返回分析结果
 */

const express                    = require('express');
const router                     = express.Router();
const reconstructionController   = require('../controllers/reconstructionController');
const upload                     = require('../middleware/uploadMiddleware');
const { optionalAuth }           = require('../middleware/authMiddleware');
const { createRateLimiter }      = require('../middleware/rateLimit');
const { validateImage }          = require('../middleware/validateImage');

// 上传图片并分析（字段名 'file'，仅支持图片格式，大小 ≤ 5MB）
const analyzeLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 12, message: '分析请求过于频繁，请稍后再试' });

/** 将 Multer 的异常转换为 JSON 响应，避免返回 HTML 错误页 */
const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: '图片不能超过 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: '一次只能上传一张图片' });
        }
        return res.status(400).json({ error: err.message || '图片上传失败' });
    });
};

router.post('/analyze', analyzeLimiter, optionalAuth, handleUpload, validateImage(), reconstructionController.analyzeImage);

module.exports = router;
