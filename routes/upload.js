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
 *   upload.single  - multer 处理文件上传，字段名为 'file'
 *                    文件保存至 uploads/ 目录，命名为 时间戳-原始文件名
 *   uploadFile     - 控制器：返回 { url, filename }
 */

const express            = require('express');
const router             = express.Router();
const uploadController   = require('../controllers/uploadController');
const upload             = require('../middleware/uploadMiddleware');
const { protect }        = require('../middleware/authMiddleware');

// 通用图片上传接口（multipart/form-data，字段名 'file'）
router.post('/', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;
