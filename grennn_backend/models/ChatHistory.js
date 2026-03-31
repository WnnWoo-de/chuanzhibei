/**
 * models/ChatHistory.js - 聊天历史记录数据模型
 *
 * 存储用户与 AI 助手的对话记录，每条记录对应一条单独的消息。
 *
 * 字段说明：
 *   id      - UUID 主键
 *   role    - 消息角色：'user'（用户发送）或 'assistant'（AI 回复）
 *   content - 消息文本内容
 *   userId  - 外键，关联 User 表（每条记录属于某个登录用户）
 *
 * 关联关系：
 *   ChatHistory N:1 User（多条聊天记录属于同一个用户）
 *
 * 注意：游客模式下的聊天记录不会写入数据库，仅保存在前端内存中。
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const ChatHistory = sequelize.define('ChatHistory', {
    // ── 主键 ────────────────────────────────────────────────────────────────
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // 自动生成 UUID v4
        primaryKey: true,
    },

    // ── 消息角色 ─────────────────────────────────────────────────────────────
    role: {
        type: DataTypes.ENUM('user', 'assistant'), // 只允许两个固定值
        allowNull: false,
    },

    // ── 消息内容 ─────────────────────────────────────────────────────────────
    content: {
        type: DataTypes.TEXT, // TEXT 类型支持长文本，比 STRING 更适合存储 AI 回复
        allowNull: false,
    }
});

// ── 模型关联 ─────────────────────────────────────────────────────────────────
// 每条聊天记录通过 userId 外键关联到对应用户
ChatHistory.belongsTo(User, { foreignKey: 'userId' }); // ChatHistory → User（多对一）
User.hasMany(ChatHistory, { foreignKey: 'userId' });    // User → ChatHistory（一对多）

module.exports = ChatHistory;
