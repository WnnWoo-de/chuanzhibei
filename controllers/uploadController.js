/**
 * controllers/uploadController.js - 通用文件上传控制器
 *
 * 处理通用文件上传请求，将已上传文件的公开访问 URL 返回给前端。
 * 实际文件存储由 uploadMiddleware（multer）负责，
 * 本控制器只负责构造并返回文件的完整访问 URL。
 *
 * 返回格式：{ url, filename }
 *   url      - 文件的完整公开访问地址（含域名前缀 CALLBACK_URL_BASE）
 *   filename - 服务器上存储的文件名（含时间戳前缀，如 1700000000000-photo.jpg）
 */

/**
 * POST /api/v1/upload
 * 上传单个图片文件（需登录，multipart/form-data，字段名为 'file'）
 *
 * 前置中间件：
 *   protect         - 必须登录
 *   upload.single   - multer 处理文件并挂载到 req.file
 *
 * 错误情况：
 *   400 - 未携带文件（req.file 为空）
 *
 * @param {import('express').Request}  req - req.file 由 multer 中间件填充
 * @param {import('express').Response} res
 */
exports.uploadFile = (req, res) => {
    // 检查是否有文件上传（multer 未接收到文件时 req.file 为 undefined）
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // 拼接文件的完整公开访问 URL
    // CALLBACK_URL_BASE 示例：https://api.example.com 或 http://localhost:3000
    const fileUrl = `${process.env.CALLBACK_URL_BASE}/uploads/${req.file.filename}`;

    res.json({
        url:      fileUrl,          // 前端可直接用于显示图片或存入数据库
        filename: req.file.filename // 服务器侧文件名（含时间戳，唯一）
    });
};
