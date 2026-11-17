/**
 * middleware/validateImage.js - 上传图片内容校验
 *
 * 仅检查 MIME/扩展名并不可靠：攻击者可以把任意文件伪装成 image/jpeg。
 * 这里读取文件头（魔法字节）确认内容确实是支持的图片格式。
 */

const fs = require('fs/promises');

const HEADER_LENGTH = 12;

const isJpeg = (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
const isPng = (buf) => buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isGif = (buf) => buf.subarray(0, 4).toString('ascii') === 'GIF8';
const isWebp = (buf) => buf.subarray(0, 4).toString('ascii') === 'RIFF'
    && buf.subarray(8, 12).toString('ascii') === 'WEBP';

const isValidImage = (buf) => Boolean(buf?.length) && (isJpeg(buf) || isPng(buf) || isGif(buf) || isWebp(buf));

const readHeader = async (filePath) => {
    const handle = await fs.open(filePath, 'r');
    try {
        const buffer = Buffer.alloc(HEADER_LENGTH);
        const { bytesRead } = await handle.read(buffer, 0, HEADER_LENGTH, 0);
        return buffer.subarray(0, bytesRead);
    } finally {
        await handle.close();
    }
};

/**
 * @param {object}  [options]
 * @param {boolean} [options.memory] 文件是否保存在 req.file.buffer（内存存储）
 */
const validateImage = ({ memory = false } = {}) => async (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const header = memory ? file.buffer : await readHeader(file.path);
        if (!isValidImage(header)) {
            if (!memory && file.path) {
                await fs.unlink(file.path).catch(() => {});
            }
            return res.status(415).json({ error: '文件内容不是有效图片' });
        }
        return next();
    } catch (err) {
        console.error('validateImage failed:', err?.message);
        if (!memory && file.path) {
            await fs.unlink(file.path).catch(() => {});
        }
        return res.status(400).json({ error: '图片校验失败，请重新上传' });
    }
};

module.exports = { validateImage, isValidImage };
