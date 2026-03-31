/**
 * models/User.js - 用户数据模型
 *
 * 定义 users 表的字段结构与约束，包含：
 *   - 基础信息：邮箱、密码（bcrypt 哈希）、用户名、头像
 *   - 第三方登录：Google ID、Microsoft ID（均可为空）
 *   - 积分系统：points 字段（默认 0）
 *   - 邮箱验证：验证令牌、令牌过期时间、验证状态标志
 *   - 密码重置：重置令牌、令牌过期时间
 *   - 登录追踪：最后登录时间、最后登录 IP
 *
 * Sequelize 会自动为每条记录添加 createdAt 和 updatedAt 时间戳字段。
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    // ── 主键 ────────────────────────────────────────────────────────────────
    id: {
        type: DataTypes.UUID,           // 使用 UUID 而非自增 INT，安全性更高
        defaultValue: DataTypes.UUIDV4, // 插入时自动生成 v4 UUID
        primaryKey: true,
    },

    // ── 认证信息 ─────────────────────────────────────────────────────────────
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,                   // 邮箱全局唯一
        validate: { isEmail: true }     // Sequelize 层校验邮箱格式
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,                // OAuth 用户无本地密码，允许为空
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // ── 积分 ─────────────────────────────────────────────────────────────────
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,                // 新用户积分初始为 0
    },

    // ── 第三方登录 ID ────────────────────────────────────────────────────────
    googleId: {
        type: DataTypes.STRING,
        unique: true,                   // 一个 Google 账号只能绑定一个本平台用户
        allowNull: true                 // 非 Google 登录用户此字段为空
    },
    microsoftId: {
        type: DataTypes.STRING,
        unique: true,                   // 一个 Microsoft 账号只能绑定一个本平台用户
        allowNull: true                 // 非 Microsoft 登录用户此字段为空
    },

    // ── 用户资料 ─────────────────────────────────────────────────────────────
    avatar: {
        type: DataTypes.STRING,         // 存储头像 URL（本地上传路径或第三方头像链接）
        allowNull: true
    },

    // ── 邮箱验证 ─────────────────────────────────────────────────────────────
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,            // 注册后默认未验证
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,                // 验证完成后可清空
    },
    emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,                // 验证令牌的有效期截止时间
    },

    // ── 密码重置 ─────────────────────────────────────────────────────────────
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,                // 重置完成后应立即清空
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,                // 重置令牌的有效期截止时间（通常为 1 小时）
    },

    // ── 登录追踪 ─────────────────────────────────────────────────────────────
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,                // 记录用户最后一次成功登录的时间
    },
    lastLoginIp: {
        type: DataTypes.STRING,
        allowNull: true,                // 记录用户最后一次登录的 IP 地址
    }
});

module.exports = User;
