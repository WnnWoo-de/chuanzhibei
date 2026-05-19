const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('single', 'multiple', 'judge'),
        allowNull: false,
        defaultValue: 'single',
    },
    question: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    answer: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    explanation: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
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
    tableName: 'QuizQuestions',
});

module.exports = QuizQuestion;
