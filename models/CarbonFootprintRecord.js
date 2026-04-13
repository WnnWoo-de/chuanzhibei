const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarbonFootprintRecord = sequelize.define('CarbonFootprintRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    commuteKm: {
        type: DataTypes.DECIMAL(8, 1),
        allowNull: false,
        defaultValue: 0,
    },
    commuteMode: {
        type: DataTypes.ENUM('bike', 'bus', 'car'),
        allowNull: false,
        defaultValue: 'bus',
    },
    electricityKwh: {
        type: DataTypes.DECIMAL(8, 1),
        allowNull: false,
        defaultValue: 0,
    },
    meatMeals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    transportEmission: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
    },
    energyEmission: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
    },
    lifestyleEmission: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
    },
    totalEmission: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
    },
    rating: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
    },
    aiAdvice: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'CarbonFootprintRecords',
});

module.exports = CarbonFootprintRecord;
