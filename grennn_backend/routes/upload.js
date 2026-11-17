/**
 * routes/upload.js - 通用文件上传路由
 *
 * 挂载路径：/api/v1/upload
 *
 * 路由列表：
 *   POST / - 上传单个图片文件，返回文件的公开访问 URL（需登录）
 *
 * 中间件链说明：
 *   protect        - 验证 JWT，确保用户已登录（防止未授权上传）
 *   handleUpload   - multer 处理文件上传，字段名为 'file'
 *                    文件保存至 uploads/ 目录，命名为 时间戳-随机字符串
 *   validateImage  - 校验文件头，拒绝伪造 MIME 的非图片内容
 *   uploadFile     - 控制器：返回 { url, filename }
 */

const express            = require('express');
const router             = express.Router();
const uploadController   = require('../controllers/uploadController');
const upload             = require('../middleware/uploadMiddleware');
const { protect }        = require('../middleware/authMiddleware');
const { validateImage }  = require('../middleware/validateImage');

// 通用图片上传接口（multipart/form-data，字段名 'file'）
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

router.post('/', protect, handleUpload, validateImage(), uploadController.uploadFile);

module.exports = router;
