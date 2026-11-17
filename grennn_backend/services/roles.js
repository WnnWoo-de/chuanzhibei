/**
 * services/roles.js - 轻量角色判定
 *
 * 项目没有为每个用户保存 role 字段，管理员通过 ADMIN_EMAILS 环境变量配置
 * （逗号分隔的邮箱列表）。未配置时所有用户都是普通用户，避免默认提权。
 */

const parseAdminEmails = () => String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const getUserRole = (emailOrUser) => {
    const email = typeof emailOrUser === 'string'
        ? emailOrUser
        : emailOrUser?.email;
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return 'user';
    return parseAdminEmails().includes(normalized) ? 'admin' : 'user';
};

module.exports = { getUserRole };
