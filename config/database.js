/**
 * config/database.js - 数据库连接配置
 *
 * 使用 Sequelize ORM 创建与 MySQL 数据库的连接实例。
 * 所有数据库连接参数均从 .env 环境变量文件读取，避免敏感信息硬编码。
 *
 * 环境变量说明：
 *   DB_NAME  - 数据库名称
 *   DB_USER  - 数据库用户名
 *   DB_PASS  - 数据库密码
 *   DB_HOST  - 数据库主机地址（默认 localhost）
 */

const Sequelize = require('sequelize');
require('dotenv').config(); // 确保环境变量已加载

// 创建 Sequelize 实例，建立与 MySQL 的连接
const sequelize = new Sequelize(
    process.env.DB_NAME,  // 数据库名
    process.env.DB_USER,  // 数据库用户名
    process.env.DB_PASS,  // 数据库密码
    {
        host: process.env.DB_HOST, // 数据库主机地址
        dialect: 'mysql',          // 使用 MySQL 方言
        logging: false,            // 关闭 SQL 日志输出；调试时可改为 console.log 查看执行的 SQL 语句
    }
);

module.exports = sequelize;
