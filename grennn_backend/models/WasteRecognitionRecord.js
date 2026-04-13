const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WasteRecognitionRecord = sequelize.define('WasteRecognitionRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    originalFilename: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    wasteCategory: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    wasteName: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    confidence: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    aiExplanation: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tips: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'WasteRecognitionRecords',
});

module.exports = WasteRecognitionRecord;
