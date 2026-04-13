const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievement = sequelize.define('UserAchievement', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    achievementId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    target: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    unlockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'UserAchievements',
});

module.exports = UserAchievement;
