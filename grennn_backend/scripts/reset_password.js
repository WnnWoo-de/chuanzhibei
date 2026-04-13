/**
 * scripts/reset_password.js - 用户密码重置工具
 *
 * 功能：
 *   1. 查询并展示数据库中最近注册的 20 个用户（含密码状态诊断）
 *   2. 若配置了 TARGET_EMAIL，则将对应用户的密码重置为 NEW_PASSWORD
 *
 * 使用方式：
 *   node scripts/reset_password.js
 *
 * 配置步骤：
 *   - 只查看用户列表：保持 TARGET_EMAIL 为空字符串直接运行
 *   - 重置指定用户密码：填写 TARGET_EMAIL（支持邮箱或用户名）和 NEW_PASSWORD 后运行
 *
 * 注意：此脚本直接操作数据库，请仅在开发/运维场景下使用，勿暴露给普通用户。
 */

const bcrypt = require('bcryptjs'); // 密码哈希库，与注册时保持一致
require('dotenv').config();         // 加载 .env 中的数据库连接配置

// ── 配置区域（运行前按需修改）────────────────────────────────────────────────
const TARGET_EMAIL = '';            // 要重置密码的用户邮箱或用户名；留空则只查看用户列表
const NEW_PASSWORD = 'Test@123456'; // 重置后的新密码（建议使用强密码）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 主函数：查询用户列表并按需重置密码
 */
async function main() {
    // 在函数内动态 require Sequelize，避免模块加载顺序问题
    const { Sequelize } = require('sequelize');

    // 创建独立的 Sequelize 实例（不复用 models/ 中的实例，保持脚本独立性）
    const sequelize = new Sequelize(
        process.env.DB_NAME || 'greenn_web', // 数据库名
        process.env.DB_USER || 'root',       // 数据库用户名
        process.env.DB_PASS || '',           // 数据库密码
        {
            host:    process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false, // 关闭 SQL 日志，减少输出噪音
        }
    );

    try {
        // 测试数据库连接是否正常
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功\n');

        // ── 查询用户列表 ──────────────────────────────────────────────────────
        // 使用原生 SQL 查询，按注册时间降序排列，最多显示 20 条
        const [users] = await sequelize.query(
            'SELECT id, email, username, password, points, createdAt FROM Users ORDER BY createdAt DESC LIMIT 20'
        );

        console.log(`📋 数据库中共找到 ${users.length} 个用户：`);
        console.log('------------------------------------------------------------');

        // 遍历并展示每个用户的信息，同时诊断密码状态
        users.forEach((u, i) => {
            // 密码状态诊断：
            //   以 $2 开头 → bcrypt 哈希（正常）
            //   有值但非 bcrypt → 可能是明文或其他哈希（异常）
            //   无值 → OAuth 用户（Google/Microsoft 登录，无本地密码）
            const pwStatus = u.password
                ? (u.password.startsWith('$2') ? '✅ bcrypt 加密' : '❌ 明文/非bcrypt')
                : '⚠️  无密码 (OAuth用户)';

            console.log(`${i + 1}. 邮箱: ${u.email}`);
            console.log(`   用户名: ${u.username}`);
            console.log(`   积分: ${u.points}`);
            console.log(`   密码状态: ${pwStatus}`);
            console.log(`   注册时间: ${u.createdAt}`);
            console.log();
        });

        // 若未配置目标邮箱，提示用户如何使用重置功能后退出
        if (!TARGET_EMAIL) {
            console.log('💡 提示: 如需重置密码，请在脚本顶部填入 TARGET_EMAIL 和 NEW_PASSWORD 后重新运行');
            return;
        }

        // ── 重置指定用户密码 ──────────────────────────────────────────────────
        // 支持邮箱或用户名两种方式查找目标用户
        const [target] = await sequelize.query(
            'SELECT id, email, username FROM Users WHERE email = ? OR username = ?',
            { replacements: [TARGET_EMAIL, TARGET_EMAIL] } // 参数化查询，防止 SQL 注入
        );

        if (!target || target.length === 0) {
            console.log(`❌ 找不到用户: ${TARGET_EMAIL}`);
            return;
        }

        const u = target[0];

        // 使用 bcrypt 对新密码进行哈希（cost factor 与注册时保持一致：10）
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

        // 更新数据库中的密码字段，同时刷新 updatedAt 时间戳
        await sequelize.query(
            'UPDATE Users SET password = ?, updatedAt = NOW() WHERE id = ?',
            { replacements: [hashedPassword, u.id] }
        );

        console.log('✅ 密码重置成功！');
        console.log(`   邮箱: ${u.email}`);
        console.log(`   用户名: ${u.username}`);
        console.log(`   新密码: ${NEW_PASSWORD}`);

    } catch (err) {
        console.error('❌ 错误:', err.message);
    } finally {
        // 关闭数据库连接，释放资源
        await sequelize.close();
    }
}

// 执行主函数
main();
