/**
 * middleware/uploadMiddleware.js - 文件上传中间件配置
 *
 * 基于 multer 库实现本地磁盘文件上传：
 *   - 上传目录：项目根目录下的 uploads/ 文件夹
 *   - 文件命名：时间戳 + 原始文件名，避免重名冲突
 *   - 大小限制：单文件最大 5 MB
 *   - 类型限制：仅允许图片文件（MIME 类型以 image/ 开头）
 *
 * 使用方式：
 *   router.post('/path', upload.single('file'), controller.handler)
 *   router.post('/path', upload.array('files', 5), controller.handler)
 */

const multer = require('multer');
const path = require('path');

// ── 磁盘存储策略配置 ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    /**
     * 指定文件保存目录
     * @param {object} req  - Express 请求对象
     * @param {object} file - 上传的文件信息
     * @param {function} cb - 回调：cb(错误, 目标路径)
     */
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 保存到项目根目录的 uploads/ 文件夹
    },

    /**
     * 生成存储文件名：时间戳毫秒值 + 原始文件名
     * 例如：1700000000000-photo.jpg
     * @param {object} req  - Express 请求对象
     * @param {object} file - 上传的文件信息
     * @param {function} cb - 回调：cb(错误, 文件名)
     */
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// ── multer 实例配置 ───────────────────────────────────────────────────────────
const upload = multer({
    storage, // 使用上面定义的磁盘存储策略

    limits: {
        fileSize: 5 * 1024 * 1024, // 单文件大小上限：5 MB（单位：字节）
    },

    /**
     * 文件类型过滤器：只允许图片格式
     * @param {object}   req  - Express 请求对象
     * @param {object}   file - 上传文件信息（含 mimetype）
     * @param {function} cb   - 回调：cb(错误, 是否接受)
     */
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            // MIME 类型以 image/ 开头（如 image/jpeg、image/png）→ 允许上传
            cb(null, true);
        } else {
            // 非图片类型 → 拒绝并返回错误
            cb(new Error('Only images allowed'));
        }
    }
});

module.exports = upload;
