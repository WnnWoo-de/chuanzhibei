const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RedeemRecord = sequelize.define('RedeemRecord', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    productName: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    productType: {
        type: DataTypes.ENUM('physical', 'virtual', 'certificate'),
        allowNull: false,
        defaultValue: 'physical',
    },
    costPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'fulfilled', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    fulfilledAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'RedeemRecords',
});

module.exports = RedeemRecord;
