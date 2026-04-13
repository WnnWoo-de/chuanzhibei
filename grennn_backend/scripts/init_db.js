/**
 * scripts/init_db.js - 数据库初始化脚本
 *
 * 功能：
 *   1. 连接 MySQL 服务器（不指定数据库，避免库不存在时报错）
 *   2. 读取 scripts/init_database.sql 文件
 *   3. 执行 SQL 完成建库、建表、创建索引等操作
 *
 * 使用方式：
 *   node scripts/init_db.js
 *
 * 前置条件：
 *   - MySQL 服务已启动
 *   - .env 文件中已正确配置 DB_HOST / DB_PORT / DB_USER / DB_PASS
 *   - scripts/init_database.sql 文件存在
 */

const mysql = require('mysql2/promise');
const path  = require('path');
const fs    = require('fs');
require('dotenv').config();

const SQL_FILE = path.join(__dirname, 'init_database.sql');

async function init() {
    const connection = await mysql.createConnection({
        host:               process.env.DB_HOST || '127.0.0.1',
        port:               process.env.DB_PORT || 3306,
        user:               process.env.DB_USER || 'root',
        password:           process.env.DB_PASS || '',
        multipleStatements: true,
    });

    try {
        console.log('✅ MySQL 连接成功');

        if (!fs.existsSync(SQL_FILE)) {
            throw new Error(`SQL 文件不存在: ${SQL_FILE}`);
        }

        const sql = fs.readFileSync(SQL_FILE, 'utf8');
        console.log(`📄 正在执行: ${SQL_FILE}`);

        await connection.query(sql);

        console.log('🎉 数据库初始化完成！已创建以下表:');
        console.log('   - Users                   (用户账号表)');
        console.log('   - Posts                   (社区帖子表)');
        console.log('   - PostLikes               (帖子点赞记录表)');
        console.log('   - ChatHistories           (AI聊天历史表)');
        console.log('   - ReconstructionRecords   (旧物重构记录表)');
        console.log('   - WasteRecognitionRecords (垃圾识别记录表)');
        console.log('   - CarbonFootprintRecords  (碳足迹记录表)');
        console.log('   - Achievements            (成就定义表)');
        console.log('   - UserAchievements        (用户成就记录表)');
        console.log('   - VolunteerActivities     (志愿者活动表)');
        console.log('   - VolunteerEnrollments    (志愿者报名记录表)');

    } catch (err) {
        console.error('❌ 初始化失败:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

init();
