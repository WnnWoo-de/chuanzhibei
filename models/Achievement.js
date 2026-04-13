const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general',
    },
    requirement: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    conditionJson: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    pointsReward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    rarity: {
        type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
        allowNull: false,
        defaultValue: 'common',
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'Achievements',
});

module.exports = Achievement;
