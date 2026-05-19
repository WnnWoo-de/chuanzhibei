const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizRecord = sequelize.define('QuizRecord', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    questionIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    correctCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    earnedPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'QuizRecords',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'date'],
        },
    ],
});

module.exports = QuizRecord;
