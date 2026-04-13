# Vue 3 + Node.js 集成和风天气 API 完整指南

本文档包含完整的代码示例，指导你如何使用 Node.js 构建一个天气查询后端代理，并在 Vue 3 项目中调用该接口实现地区天气查询。

## 1. 准备工作
 第一步 帮我根据这个项目写一个适配这个主题的WeatherQuery.vue页面
 发挥你的想象，设计具有ui设计的天气查询页面，显示天气信息的区域。

1. 确保已在 [和风天气控制台](https://console.qweather.com/) 注册并创建项目，获取到你的 `API_KEY`。
2. 本地已安装 Node.js 环境。

---

## 2. 后端：Node.js 代理服务

我们将使用 Express 搭建一个简单的服务端，并使用 Axios 发起对和风天气的 HTTP 请求。

### 2.1 初始化项目与安装依赖

在后端文件夹（例如 ` grennn_backend `），在终端执行以下命令：

```bash
npm init -y
npm install express axios cors dotenv

2.2 配置环境变量
在 grennn_backend 根目录下新建一个 .env 文件，填入你的和风天气凭据：

# 和风天气配置
QWEATHER_API_KEY=084248a962674ad9b44644ea654de3ea
# 免费订阅版的专属 Host 是 devapi
QWEATHER_HOST=devapi.qweather.com 
PORT=3000


2.3 编写核心服务代码
在根目录下新建 server.js：

JavaScript
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // 允许前端跨域请求
app.use(express.json());

const API_KEY = process.env.QWEATHER_API_KEY;
const API_HOST = process.env.QWEATHER_HOST;

// 定义获取天气的 API 路由
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: '请提供城市名称' });
  }

  try {
    // 步骤 1：调用 GeoAPI 获取城市 Location ID
    const geoResponse = await axios.get(`https://geoapi.qweather.com/v2/city/lookup`, {
      params: { location: city, key: API_KEY }
    });

    if (geoResponse.data.code !== '200' || geoResponse.data.location.length === 0) {
      return res.status(404).json({ error: '未找到该城市' });
    }

    const locationId = geoResponse.data.location[0].id;
    const locationName = geoResponse.data.location[0].name;

    // 步骤 2：使用 Location ID 查询实时天气
    const weatherResponse = await axios.get(`https://${API_HOST}/v7/weather/now`, {
      params: { location: locationId, key: API_KEY }
    });

    if (weatherResponse.data.code === '200') {
      const weatherData = weatherResponse.data.now;
      // 整合数据返回给前端
      res.json({
        city: locationName,
        temp: weatherData.temp,           // 温度
        text: weatherData.text,           // 天气状况
        windDir: weatherData.windDir,     // 风向
        windScale: weatherData.windScale, // 风力
        humidity: weatherData.humidity    // 湿度
      });
    } else {
      res.status(500).json({ error: '获取气象数据失败' });
    }

  } catch (error) {
    console.error('API 请求错误:', error.message);
    res.status(500).json({ error: '服务端内部错误' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`天气代理服务已启动: http://localhost:${PORT}`);
});