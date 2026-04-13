const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VolunteerActivity = sequelize.define('VolunteerActivity', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '社区清洁',
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    durationHours: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0,
    },
    maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    currentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    pointsReward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    pointsPerHour: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    isUrgent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    notes: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    coverImage: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    organizerId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    tableName: 'VolunteerActivities',
});

module.exports = VolunteerActivity;
