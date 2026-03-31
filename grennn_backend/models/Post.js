/**
 * models/Post.js - 社区动态（帖子）数据模型
 *
 * 存储用户在社区板块发布的图文帖子。
 *
 * 字段说明：
 *   id          - UUID 主键
 *   content     - 帖子文字内容（TEXT 类型，支持长文本）
 *   images      - 图片 URL 数组（JSON 类型存储，默认空数组）
 *   likes_count - 点赞数（整数，默认 0）
 *   userId      - 外键，关联发帖用户
 *
 * 关联关系：
 *   Post N:1 User（多篇帖子属于同一个用户，查询时以 'author' 别名关联）
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Post = sequelize.define('Post', {
    // ── 主键 ────────────────────────────────────────────────────────────────
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // 插入时自动生成 UUID v4
        primaryKey: true,
    },

    // ── 帖子内容 ─────────────────────────────────────────────────────────────
    content: {
        type: DataTypes.TEXT, // TEXT 类型可容纳较长的帖子正文
        allowNull: false,
    },

    // ── 图片列表 ─────────────────────────────────────────────────────────────
    images: {
        type: DataTypes.JSON, // 以 JSON 数组形式存储多张图片的 URL，如 ["/uploads/xxx.jpg"]
        defaultValue: [],     // 默认无图片
    },

    // ── 点赞数 ───────────────────────────────────────────────────────────────
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 新帖子点赞数从 0 开始
    }
});

// ── 模型关联 ─────────────────────────────────────────────────────────────────
// 帖子通过 userId 外键关联到作者用户；查询时使用 as: 'author' 别名引用
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' }); // Post → User（多对一）
User.hasMany(Post, { foreignKey: 'userId' });                  // User → Post（一对多）

module.exports = Post;
