/**
 * models/PointTransaction.js - 积分流水模型
 *
 * 每一条积分变动都由服务端写入，eventKey 唯一约束用于防止重复发放。
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointTransaction = sequelize.define('PointTransaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    eventKey: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    balanceAfter: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'PointTransactions',
    updatedAt: false,
    indexes: [
        { fields: ['userId', 'createdAt'] },
        { fields: ['userId', 'reason', 'createdAt'] },
    ],
});

module.exports = PointTransaction;