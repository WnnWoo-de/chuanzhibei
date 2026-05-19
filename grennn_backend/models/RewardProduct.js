const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RewardProduct = sequelize.define('RewardProduct', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '实物商品',
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    productType: {
        type: DataTypes.ENUM('physical', 'virtual', 'certificate'),
        allowNull: false,
        defaultValue: 'physical',
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    accent: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'RewardProducts',
});

module.exports = RewardProduct;
