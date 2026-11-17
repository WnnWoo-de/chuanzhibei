/**
 * models/ChatHistory.js - 聊天历史记录数据模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatHistory = sequelize.define('ChatHistory', {
    id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
    },
    userId: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
}, {
    tableName: 'ChatHistories',
});

module.exports = ChatHistory;
