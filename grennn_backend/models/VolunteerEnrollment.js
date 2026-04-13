const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VolunteerEnrollment = sequelize.define('VolunteerEnrollment', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    activityId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('registered', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'registered',
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    remark: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    agreedRules: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    loggedHours: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0,
    },
    reflection: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    pointsAwarded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    enrolledAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'VolunteerEnrollments',
});

module.exports = VolunteerEnrollment;
