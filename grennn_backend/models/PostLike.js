const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostLike = sequelize.define('PostLike', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    postId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    userId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
}, {
    tableName: 'PostLikes',
});

module.exports = PostLike;
