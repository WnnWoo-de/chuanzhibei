/**
 * routes/weather.js - 天气与空气质量路由
 *
 * 挂载路径：/api/v1/weather
 *
 * 所有接口无需登录（公开访问）。
 *
 * 路由列表：
 *   GET /query       - 查询综合天气数据（当前天气 + 5 日预报 + 空气质量）
 *   GET /air-quality - 单独查询指定城市的实时空气质量数据
 *
 * 查询参数（两个接口相同）：
 *   city - 城市名称（中文），例如 '北京'、'上海'、'深圳'
 *
 * 数据来源优先级：
 *   1. 和风天气 API（需配置 QWEATHER_API_KEY）
 *   2. 本地预设模拟数据（覆盖北京/上海/深圳/杭州/成都/西安）
 *   3. 通用兜底：返回北京模拟数据并替换城市名
 */

const express            = require('express');
const router             = express.Router();
const weatherController  = require('../controllers/weatherController');

// 查询综合天气（当前天气 + 5 日预报 + 空气质量）
router.get('/query',       weatherController.queryWeather);

// 单独查询实时空气质量
router.get('/air-quality', weatherController.queryAirQuality);

module.exports = router;
