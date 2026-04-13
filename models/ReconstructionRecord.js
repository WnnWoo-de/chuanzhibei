const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReconstructionRecord = sequelize.define('ReconstructionRecord', {
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
    material: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    integrity: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    carbonReduction: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    analysisId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'ReconstructionRecords',
});

module.exports = ReconstructionRecord;
