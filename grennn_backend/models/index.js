/**
 * models/index.js - 数据库模型聚合出口
 *
 * 将 Sequelize 实例与所有数据模型集中导出，
 * 方便 server.js 等文件通过统一入口使用数据库功能。
 *
 * 使用示例：
 *   const db = require('./models');
 *   await db.sequelize.sync();  // 同步所有表结构
 *   const user = await db.User.findByPk(id);
 */

const sequelize   = require('../config/database'); // Sequelize 连接实例
const User        = require('./User');              // 用户模型
const Post        = require('./Post');              // 社区动态（帖子）模型
const ChatHistory = require('./ChatHistory');       // 聊天历史记录模型

// 将所有模型与 sequelize 实例打包为一个对象统一导出
const db = {
    sequelize,   // 用于 sync()、transaction()、query() 等数据库级操作
    User,
    Post,
    ChatHistory
};

module.exports = db;
