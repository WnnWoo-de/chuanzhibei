/**
 * middleware/uploadMiddleware.js - 文件上传中间件配置
 *
 * 基于 multer 库实现本地磁盘文件上传：
 *   - 上传目录：项目根目录下的 uploads/ 文件夹
 *   - 文件命名：时间戳 + 随机十六进制串，避免重名冲突与路径注入
 *   - 大小限制：单文件最大 5 MB
 *   - 类型限制：仅允许 JPG / PNG / WebP / GIF
 *
 * 使用方式：
 *   router.post('/path', upload.single('file'), controller.handler)
 *   router.post('/path', upload.array('files', 5), controller.handler)
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXTENSION_BY_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

// ── 磁盘存储策略配置 ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    /**
     * 指定文件保存目录
     * @param {object} req  - Express 请求对象
     * @param {object} file - 上传的文件信息
     * @param {function} cb - 回调：cb(错误, 目标路径)
     */
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // 保存到项目根目录的 uploads/ 文件夹
    },

    /**
     * 生成随机存储文件名，避免原始文件名中的路径片段或特殊字符造成风险。
     * 扩展名由 MIME 类型决定，不直接信任客户端文件名。
     * @param {object} req  - Express 请求对象
     * @param {object} file - 上传的文件信息
     * @param {function} cb - 回调：cb(错误, 文件名)
     */
    filename: (req, file, cb) => {
        const ext = EXTENSION_BY_MIME[String(file.mimetype || '').toLowerCase()] || '.img';
        cb(null, `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${ext}`);
    }
});

// ── multer 实例配置 ───────────────────────────────────────────────────────────
const upload = multer({
    storage, // 使用上面定义的磁盘存储策略

    limits: {
        fileSize: 5 * 1024 * 1024, // 单文件大小上限：5 MB（单位：字节）
    },

    /**
     * 文件类型过滤器：仅允许 JPG / PNG / WebP / GIF
     * @param {object}   req  - Express 请求对象
     * @param {object}   file - 上传文件信息（含 mimetype）
     * @param {function} cb   - 回调：cb(错误, 是否接受)
     */
    fileFilter: (req, file, cb) => {
        if (EXTENSION_BY_MIME[String(file.mimetype || '').toLowerCase()]) {
            cb(null, true);
        } else {
            cb(new Error('仅支持 JPG、PNG、WebP、GIF 图片'));
        }
    }
});

module.exports = upload;
