const express = require('express');
const router = express.Router();
const multer = require('multer');
const wasteController = require('../controllers/wasteController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimit');
const { validateImage } = require('../middleware/validateImage');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// 内存存储：限制大小、数量与 MIME 类型，避免大文件压垮进程
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
        fields: 4,
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.has(String(file.mimetype || '').toLowerCase())) {
            return cb(new Error('仅支持 JPG、PNG、WebP、GIF 图片'));
        }
        return cb(null, true);
    },
});

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

// 游客也可识别，因此使用更严格的频率限制
const analyzeLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: '识别请求过于频繁，请稍后再试',
});

router.post(
    '/analyze',
    analyzeLimiter,
    optionalAuth,
    handleUpload,
    validateImage({ memory: true }),
    wasteController.analyzeImage,
);

module.exports = router;