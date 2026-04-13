/**
 * models/Post.js - 社区动态（帖子）数据模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    tableName: 'Posts',
});

module.exports = Post;
