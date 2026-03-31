#!/usr/bin/env node

/**
 * test-weather-api.js - 天气 API 基础测试脚本
 *
 * 功能：
 *   快速验证后端天气查询接口（/api/v1/weather/query）是否正常响应，
 *   遍历预设城市列表，打印关键天气字段用于肉眼核查。
 *
 * 使用方式：
 *   1. 确保后端服务已启动：npm run dev
 *   2. 运行脚本：node test-weather-api.js
 *
 * 测试城市：北京、上海、深圳、杭州
 *
 * 常见错误说明：
 *   ECONNREFUSED - 后端服务未启动，请先执行 npm run dev
 *   404          - 城市未找到（和风 API 未命中且不在模拟数据中）
 */

const axios = require('axios');

// 后端服务地址（与 .env 中的 PORT 保持一致，默认 3000）
const API_BASE_URL = 'http://localhost:3000';

// 待测试的城市列表
const TEST_CITIES = ['北京', '上海', '深圳', '杭州'];

/**
 * 执行天气 API 测试
 * 逐个城市发起请求，打印核心字段，遇到连接失败时终止循环
 */
async function testWeatherAPI() {
    console.log('🌤️  开始测试天气API...\n');

    for (const city of TEST_CITIES) {
        try {
            console.log(`📍 查询城市: ${city}`);

            // 向后端发起 GET 请求，超时 10 秒
            const response = await axios.get(`${API_BASE_URL}/api/v1/weather/query`, {
                params:  { city },
                timeout: 10000,
            });

            const data = response.data;

            // 打印关键字段用于快速核查
            console.log(`✅ 成功获取 ${data.city.name} 的天气数据`);
            console.log(`   当前温度: ${data.now.temp}°C`);
            console.log(`   天气状况: ${data.now.text}`);
            console.log(`   空气质量: ${data.airQuality.level} (AQI: ${data.airQuality.aqi})`);
            console.log(`   预报天数: ${data.forecast.length} 天\n`);

        } catch (error) {
            if (error.response?.status === 404) {
                // 城市不在和风 API 结果中，且不在模拟数据库中
                console.log(`❌ 未找到城市: ${city}\n`);
            } else if (error.code === 'ECONNREFUSED') {
                // 后端服务未启动，无需继续测试其他城市
                console.log(`❌ 无法连接到服务器 (${API_BASE_URL})`);
                console.log(`   请确保后端服务已启动: npm run dev\n`);
                break;
            } else {
                console.log(`❌ 查询失败: ${error.message}\n`);
            }
        }
    }

    console.log('✨ 测试完成！');
}

// 执行测试
testWeatherAPI();
