/**
 * models/IdempotencyKey.js - 写操作幂等记录
 *
 * 客户端通过 Idempotency-Key 请求头为写操作提供唯一标识。
 * 服务端保存首次成功响应，重复请求直接返回同一结果，避免断网重试产生重复数据。
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdempotencyKey = sequelize.define('IdempotencyKey', {
    key: {
        type: DataTypes.STRING(191),
        primaryKey: true,
    },
    userId: {
        type: DataTypes.CHAR(36),
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    body: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'IdempotencyKeys',
    updatedAt: false,
    indexes: [
        { fields: ['expiresAt'] },
        { fields: ['userId'] },
    ],
});

module.exports = IdempotencyKey;