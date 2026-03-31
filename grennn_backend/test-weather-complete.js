#!/usr/bin/env node

/**
 * test-weather-complete.js - 天气 API 完整测试脚本
 *
 * 功能：
 *   对天气相关的所有 API 端点进行系统性测试，包括：
 *     1. 综合天气查询（当前天气 + 5 日预报 + 空气质量）
 *     2. 单独空气质量查询
 *     3. 错误处理验证（缺少参数、无效城市名）
 *
 * 使用方式：
 *   1. 确保后端服务已启动：npm run dev
 *   2. 运行脚本：node test-weather-complete.js
 *
 * 测试城市：北京、上海、深圳
 */

const axios = require('axios');

// 后端服务地址
const API_BASE_URL = 'http://localhost:3000';
// 待测试的城市列表
const TEST_CITIES = ['北京', '上海', '深圳'];

// ── ANSI 终端颜色代码（用于彩色输出，提升可读性）────────────────────────────
const colors = {
    reset:  '\x1b[0m',
    green:  '\x1b[32m', // 成功信息
    red:    '\x1b[31m', // 错误信息
    yellow: '\x1b[33m', // 数据详情
    blue:   '\x1b[34m', // 操作步骤
    cyan:   '\x1b[36m', // 测试标题
};

/**
 * 输出带颜色的日志
 * @param {string} color   - colors 对象中的颜色键名
 * @param {string} message - 要输出的文本
 */
function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ── 测试用例 1：综合天气查询 ──────────────────────────────────────────────────

/**
 * 测试 GET /api/v1/weather/query
 * 验证返回数据包含：城市信息、当前天气、5 日预报、空气质量
 * @returns {boolean} 测试是否成功（服务器连接失败时返回 false 终止后续测试）
 */
async function testWeatherQuery() {
    log('cyan', '\n📍 测试：完整天气查询 (包含当前天气、预报、空气质量)');
    log('cyan', '═'.repeat(60));

    for (const city of TEST_CITIES) {
        try {
            log('blue', `\n查询城市: ${city}`);
            const response = await axios.get(`${API_BASE_URL}/api/v1/weather/query`, {
                params:  { city },
                timeout: 10000,
            });

            const data = response.data;
            log('green', `✅ 成功获取 ${data.city.name} 的天气数据`);

            // 打印当前天气核心字段
            log('yellow', '\n  当前天气:');
            log('yellow', `    温度: ${data.now.temp}°C (体感: ${data.now.feelsLike}°C)`);
            log('yellow', `    天气: ${data.now.text}`);
            log('yellow', `    湿度: ${data.now.humidity}%`);
            log('yellow', `    风力: ${data.now.windScale}级 ${data.now.windDir}`);

            // 打印 5 日预报（只展示前 2 天避免输出过长）
            log('yellow', `\n  5天预报: ${data.forecast.length} 天`);
            data.forecast.slice(0, 2).forEach((day, idx) => {
                log('yellow', `    Day ${idx + 1}: ${day.date} ${day.textDay} ${day.tempMax}°C/${day.tempMin}°C`);
            });

            // 打印空气质量摘要
            log('yellow', '\n  空气质量:');
            log('yellow', `    AQI: ${data.airQuality.aqi} (${data.airQuality.level})`);
            log('yellow', `    主要污染物: ${data.airQuality.primary}`);
            log('yellow', `    建议: ${data.airQuality.advice}`);
            if (data.airQuality.pollutants.length > 0) {
                log('yellow', `    污染物数据: ${data.airQuality.pollutants.length} 项`);
                // 只展示前 3 种污染物
                data.airQuality.pollutants.slice(0, 3).forEach(p => {
                    log('yellow', `      - ${p.name}: ${p.value} ${p.unit}`);
                });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                log('red', `❌ 未找到城市: ${city}`);
            } else if (error.code === 'ECONNREFUSED') {
                // 服务器未启动，终止所有测试
                log('red', `❌ 无法连接到服务器 (${API_BASE_URL})`);
                log('red', `   请确保后端服务已启动: npm run dev`);
                return false;
            } else {
                log('red', `❌ 查询失败: ${error.message}`);
            }
        }
    }
    return true;
}

// ── 测试用例 2：单独空气质量查询 ─────────────────────────────────────────────

/**
 * 测试 GET /api/v1/weather/air-quality
 * 验证返回数据包含：城市信息、AQI、等级、污染物列表
 * @returns {boolean} 测试是否成功
 */
async function testAirQualityQuery() {
    log('cyan', '\n🌫️  测试：单独空气质量查询');
    log('cyan', '═'.repeat(60));

    for (const city of TEST_CITIES) {
        try {
            log('blue', `\n查询城市: ${city}`);
            const response = await axios.get(`${API_BASE_URL}/api/v1/weather/air-quality`, {
                params:  { city },
                timeout: 10000,
            });

            const data = response.data;
            log('green', `✅ 成功获取 ${data.city.name} 的空气质量数据`);
            log('yellow', `  AQI: ${data.airQuality.aqi}`);
            log('yellow', `  等级: ${data.airQuality.level}`);
            log('yellow', `  主要污染物: ${data.airQuality.primary}`);
            log('yellow', `  污染物数量: ${data.airQuality.pollutants.length}`);

            // 若有污染物数据则逐项展示
            if (data.airQuality.pollutants.length > 0) {
                log('yellow', '  详细数据:');
                data.airQuality.pollutants.forEach(p => {
                    log('yellow', `    ${p.name}: ${p.value} ${p.unit}`);
                });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                log('red', `❌ 未找到城市: ${city}`);
            } else if (error.code === 'ECONNREFUSED') {
                log('red', `❌ 无法连接到服务器`);
                return false;
            } else {
                log('red', `❌ 查询失败: ${error.message}`);
            }
        }
    }
    return true;
}

// ── 测试用例 3：错误处理验证 ──────────────────────────────────────────────────

/**
 * 验证接口在异常输入下的错误处理行为：
 *   - 缺少 city 参数 → 期望返回 400 Bad Request
 *   - 无效城市名    → 期望返回 404 或兜底数据（取决于后端实现）
 */
async function testErrorHandling() {
    log('cyan', '\n⚠️  测试：错误处理');
    log('cyan', '═'.repeat(60));

    // 场景 1：缺少必填参数 city
    try {
        log('blue', '\n测试: 缺少城市参数');
        await axios.get(`${API_BASE_URL}/api/v1/weather/query`, { timeout: 5000 });
        log('red', '❌ 应该返回错误，但请求成功了（接口需要加参数校验）');
    } catch (error) {
        if (error.response?.status === 400) {
            // 正确行为：后端返回 400 并附带错误信息
            log('green', `✅ 正确返回 400: ${error.response.data.error}`);
        } else {
            log('red', `❌ 意外错误: ${error.message}`);
        }
    }

    // 场景 2：传入不存在的城市名
    try {
        log('blue', '\n测试: 无效城市名称');
        const resp = await axios.get(`${API_BASE_URL}/api/v1/weather/query`, {
            params:  { city: '不存在的城市XXXXX' },
            timeout: 10000,
        });
        // 若后端使用兜底数据，此处不会抛错，属于正常兜底行为
        log('yellow', `⚠️  返回了兜底数据，城市名: ${resp.data?.city?.name}（后端使用通用兜底）`);
    } catch (error) {
        if (error.response?.status === 404) {
            log('green', `✅ 正确返回 404: ${error.response.data.error}`);
        } else {
            log('yellow', `⚠️  返回状态: ${error.response?.status}，信息: ${error.message}`);
        }
    }
}

// ── 执行全部测试 ──────────────────────────────────────────────────────────────

/**
 * 按顺序运行所有测试用例
 * 任意测试因服务器不可达而失败时，立即终止后续测试
 */
async function runAllTests() {
    log('cyan', '\n🌤️  开始完整天气API测试...');
    log('cyan', '═'.repeat(60));

    // 测试 1：综合天气查询
    const test1 = await testWeatherQuery();
    if (!test1) return; // 服务器不可达，终止测试

    // 测试 2：空气质量查询
    const test2 = await testAirQualityQuery();
    if (!test2) return;

    // 测试 3：错误处理
    await testErrorHandling();

    log('green', '\n✨ 所有测试完成！');
    log('cyan', '═'.repeat(60));
}

// 启动测试，捕获未处理的顶层异常
runAllTests().catch(err => {
    log('red', `\n❌ 测试出错: ${err.message}`);
    process.exit(1); // 非零退出码，便于 CI/CD 脚本检测失败
});
