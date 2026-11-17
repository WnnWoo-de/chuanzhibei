/**
 * services/email.js - 邮件发送服务
 *
 * 通过 SMTP 发送验证邮件 / 密码重置邮件。
 * 未配置 SMTP 时不会阻塞主流程：开发环境把链接输出到日志，生产环境仅记录告警。
 */

const nodemailer = require('nodemailer');

let transporter = null;

const isSmtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);

const getTransporter = () => {
    if (!isSmtpConfigured()) return null;
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
            : undefined,
    });
    return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
    const client = getTransporter();
    if (!client) {
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[email:dev] 未配置 SMTP，邮件未发送 → ${to} | ${subject}\n${text}`);
        } else {
            console.warn('[email] 未配置 SMTP，邮件未发送。请设置 SMTP_HOST / SMTP_PORT 等变量。');
        }
        return { sent: false };
    }

    await client.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@greensight.local',
        to,
        subject,
        text,
        html,
    });
    return { sent: true };
};

const getFrontendBase = () => {
    const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
    return raw.replace(/\/+$/, '');
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${getFrontendBase()}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    return sendMail({
        to: email,
        subject: 'GreenSight 密码重置',
        text: `你请求重置 GreenSight 账号密码，请在 30 分钟内打开以下链接完成重置：\n${resetUrl}\n\n如果不是你本人操作，请忽略此邮件。`,
        html: `<p>你请求重置 GreenSight 账号密码，请在 30 分钟内点击以下链接完成重置：</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>如果不是你本人操作，请忽略此邮件。</p>`,
    });
};

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${getFrontendBase()}/auth/verify-email?token=${encodeURIComponent(token)}`;
    return sendMail({
        to: email,
        subject: 'GreenSight 邮箱验证',
        text: `请打开以下链接验证你的 GreenSight 邮箱：\n${verifyUrl}`,
        html: `<p>请点击以下链接验证你的 GreenSight 邮箱：</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });
};

module.exports = {
    isSmtpConfigured,
    sendPasswordResetEmail,
    sendVerificationEmail,
};