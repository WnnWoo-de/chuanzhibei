/**
 * models/User.js - 用户数据模型
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    googleId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    microsoftId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    bio: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastLoginIp: {
        type: DataTypes.STRING(50),
        allowNull: true,
    }
}, {
    tableName: 'Users',
});

module.exports = User;
