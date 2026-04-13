# Open-Meteo DWD API 接入说明

本文说明 `C:\Users\wnnw\Desktop\天气\vue-weather` 项目中，如何接入 Open-Meteo 的 DWD 天气接口，并在前端页面中查询天气。

参考文档：

- https://open-meteo.com/en/docs/dwd-api

## 1. 接入目标

本项目的天气查询流程是：

1. 用户在前端输入城市名，例如 `北京`
2. 后端先调用 Open-Meteo Geocoding API，把城市名转换成经纬度
3. 后端再调用 Open-Meteo DWD API，使用 `icon_seamless` 模型获取天气
4. 后端把前端需要的字段整理后返回
5. 前端展示当前天气和未来 12 小时气温

## 2. 已安装依赖

项目中新增的依赖：

```bash
npm install openmeteo
```

对应位置：

- `package.json`
- `package-lock.json`

## 3. 主要文件

本次接入主要修改了以下文件：

- `weather-backend/server.js`
- `src/WeatherQuery.vue`

## 4. 后端接入逻辑

后端入口文件：

- `weather-backend/server.js`

### 4.1 引入 SDK

```js
import { fetchWeatherApi } from 'openmeteo'
```

这个 SDK 用来请求 Open-Meteo 接口，并解析 FlatBuffers 返回结果。

### 4.2 查询城市经纬度

后端先调用地理编码接口：

```http
GET https://geocoding-api.open-meteo.com/v1/search
```

请求参数：

- `name`: 城市名
- `count=10`
- `language=zh`
- `format=json`

示例：

```js
const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
  params: {
    name: city,
    count: 10,
    language: 'zh',
    format: 'json',
  },
})
```

### 4.3 城市候选优化

因为中文城市名可能有重名，例如输入 `北京` 时，地理编码首条结果不一定是北京市，所以后端做了两层优化：

1. 为常见城市增加英文别名，例如 `北京 -> Beijing`
2. 对候选结果排序，优先选择：
   - `country_code = CN`
   - 名称精确匹配
   - 更高行政级别，例如 `PPLC`、`PPLA`
   - 更高人口

这样可以尽量避免重名乡镇被误选。

### 4.4 请求 DWD ICON 天气

天气接口使用：

```http
GET https://api.open-meteo.com/v1/dwd-icon
```

请求由 `fetchWeatherApi` 发出：

```js
const params = {
  latitude,
  longitude,
  current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m',
  hourly: 'temperature_2m',
  forecast_hours: 12,
  models: 'icon_seamless',
  timezone: 'auto',
  wind_speed_unit: 'ms',
}

const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/dwd-icon', params)
```

### 4.5 当前使用的关键参数

- `latitude`: 纬度
- `longitude`: 经度
- `current`: 当前天气字段
- `hourly`: 逐小时天气字段
- `forecast_hours: 12`: 返回未来 12 小时
- `models: icon_seamless`: 使用 DWD ICON Seamless 模型
- `timezone: auto`: 自动使用当地时区
- `wind_speed_unit: ms`: 风速单位为米每秒

### 4.6 返回数据解析

`openmeteo` SDK 返回的是结构化对象，不是直接的 JSON，需要按索引取值：

```js
const response = responses[0]
const current = response.current()
const hourly = response.hourly()

const temp = current.variables(0)?.value()
const humidity = current.variables(1)?.value()
const weatherCode = current.variables(2)?.value()
const windSpeed = current.variables(3)?.value()
const windDirection = current.variables(4)?.value()
```

其中索引顺序必须和请求参数中的字段顺序一致。

## 5. 项目后端暴露的接口

项目给前端暴露的接口是：

```http
GET /api/weather?city=北京
```

由前端访问本地接口，不直接访问 Open-Meteo。

这样做的好处：

- 前端逻辑更简单
- 城市转经纬度逻辑统一放在后端
- 可以在后端集中处理错误和字段转换
- 后续更换天气源时，前端改动更小

### 5.1 返回示例

```json
{
  "city": "北京市",
  "latitude": 39.9075,
  "longitude": 116.39723,
  "source": "Open-Meteo DWD ICON",
  "model": "icon_seamless",
  "temp": 17.24,
  "humidity": 51,
  "text": "晴",
  "windScale": "1",
  "windDir": "东北",
  "hourly": [
    {
      "time": "2026-03-25T10:00:00Z",
      "temperature": 15.89
    }
  ]
}
```

## 6. 天气字段转换

后端还做了两类转换，方便前端直接展示：

### 6.1 天气码转中文

Open-Meteo 返回 `weather_code`，后端通过 `weatherTextFromCode()` 转成中文描述，例如：

- `0 -> 晴`
- `1 -> 晴间多云`
- `3 -> 阴`
- `61 -> 小雨`
- `95 -> 雷暴`

### 6.2 风向和风力转换

后端补充了两个方法：

- `windDirFromDegree()`：把风向角度转成中文方位
- `windScaleFromMs()`：把米每秒风速转成风力等级

这样前端直接展示：

```text
东北 1级
```

## 7. 前端使用方式

前端页面文件：

- `src/WeatherQuery.vue`

前端调用方式：

```js
const response = await fetch(`/api/weather?city=${encodeURIComponent(normalizedCity)}`)
const data = await response.json()
weather.value = data
```

页面当前展示内容：

- 城市名
- 数据来源
- 模型名
- 天气状况
- 温度
- 湿度
- 风向风力
- 未来 12 小时气温

## 8. 启动方式

项目启动需要两个服务：

### 8.1 启动后端

```bash
npm run server
```

默认端口：

```text
http://localhost:3000
```

### 8.2 启动前端

```bash
npm run dev
```

默认端口：

```text
http://localhost:5173
```

### 8.3 Vite 代理

`vite.config.ts` 中已配置代理：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

因此前端请求 `/api/weather` 时，会自动转发到本地 Node 后端。

## 9. 调试建议

如果天气查不到，优先检查以下几点：

1. 后端服务是否已启动
2. 前端开发服务是否已启动
3. 输入城市是否存在重名
4. Open-Meteo Geocoding 是否返回了有效经纬度
5. DWD ICON 接口是否返回了 `current()` 和 `hourly()`

可以直接测试：

```http
http://localhost:3000/api/weather?city=北京
```

## 10. 当前方案特点

当前实现的特点：

- 使用 Open-Meteo 官方 JS SDK
- 使用 DWD `icon_seamless` 模型
- 前后端职责清晰
- 前端不直接耦合第三方天气 API
- 支持未来 12 小时温度展示
- 对中文城市重名做了基础优化

如果后续要扩展，还可以继续加：

- 每日天气预报
- 降水概率
- 体感温度
- 天气图标
- 城市下拉候选列表

## 11. 详细 JS 逻辑说明

这一节按 `weather-backend/server.js` 的实际执行顺序，详细解释每段 JavaScript 逻辑。

### 11.1 模块导入

代码：

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { fetchWeatherApi } from 'openmeteo'
```

作用：

- `path` 和 `fileURLToPath`：用于在 ES Module 环境下拿到当前文件目录
- `axios`：请求 Geocoding API
- `cors`：允许前端跨域访问后端
- `dotenv`：读取环境变量
- `express`：创建本地天气接口服务
- `fetchWeatherApi`：调用 Open-Meteo SDK 请求 DWD ICON 天气

### 11.2 处理当前文件目录

代码：

```js
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
```

作用：

因为项目使用的是 ES Module，不能直接使用 CommonJS 里的 `__dirname`，所以这里手动生成当前文件路径。

用途：

- 后续 `dotenv.config()` 读取 `.env` 文件时会用到

### 11.3 创建 Express 应用

代码：

```js
const app = express()
app.use(cors())
app.use(express.json())
```

作用：

- `express()`：创建服务器实例
- `app.use(cors())`：允许前端页面请求这个服务
- `app.use(express.json())`：允许后端处理 JSON 请求体

虽然当前天气接口是 `GET` 请求，没有用到请求体，但保留 `express.json()` 也没有问题。

### 11.4 读取环境变量

代码：

```js
dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
```

作用：

尝试读取两处 `.env`：

1. `weather-backend/.env`
2. 项目根目录 `.env`

虽然当前 Open-Meteo 免费接口不依赖 API Key，但这段结构保留后，后续切换别的天气源会更方便。

### 11.5 天气码转中文

代码核心：

```js
const weatherTextFromCode = (code) => {
  const mapping = new Map([
    [0, '晴'],
    [1, '晴间多云'],
    [2, '多云'],
    [3, '阴'],
    [61, '小雨'],
    [63, '中雨'],
    [65, '大雨'],
    [95, '雷暴'],
  ])

  return mapping.get(code) || '未知'
}
```

作用：

Open-Meteo 返回的是 `weather_code` 数字，不适合直接给用户看，所以这里转换成中文。

执行逻辑：

1. 接收一个数字天气码
2. 在 `Map` 里查对应中文
3. 找不到时返回 `未知`

示例：

```js
weatherTextFromCode(0)   // 晴
weatherTextFromCode(61)  // 小雨
weatherTextFromCode(999) // 未知
```

### 11.6 风向角度转中文方向

代码：

```js
const windDirFromDegree = (deg) => {
  const d = Number(deg)
  if (!Number.isFinite(d)) return ''
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const index = Math.round(d / 45) % 8
  return directions[index]
}
```

作用：

把 Open-Meteo 返回的风向角度，比如 `70`、`180`、`300`，转成中文方向。

执行逻辑：

1. 先把输入转成数字
2. 如果不是有效数字，返回空字符串
3. 按 45 度一个方向进行划分
4. 用数组下标取出方位

示例：

```js
windDirFromDegree(0)    // 北
windDirFromDegree(45)   // 东北
windDirFromDegree(90)   // 东
windDirFromDegree(225)  // 西南
```

### 11.7 风速转风力等级

代码：

```js
const windScaleFromMs = (ms) => {
  const v = Number(ms)
  if (!Number.isFinite(v) || v < 0) return ''
  const thresholds = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7]
  for (let i = 0; i < thresholds.length; i += 1) {
    if (v < thresholds[i]) return String(i)
  }
  return '12'
}
```

作用：

Open-Meteo 返回的是米每秒风速，页面想显示的是常见的风力等级，所以这里做转换。

执行逻辑：

1. 把风速转成数字
2. 无效或负数时直接返回空字符串
3. 按风力阈值逐个比较
4. 找到第一个大于当前风速的阈值，返回对应等级
5. 如果超过所有阈值，就返回 `12`

示例：

```js
windScaleFromMs(0.2) // 0
windScaleFromMs(2.0) // 2
windScaleFromMs(6.0) // 4
```

### 11.8 生成时间数组

代码：

```js
const range = (start, stop, step) =>
  Array.from({ length: Math.max(0, (stop - start) / step) }, (_, i) => start + i * step)
```

作用：

Open-Meteo SDK 的逐小时结果不是直接给每个时间点字符串，而是给：

- 开始时间
- 结束时间
- 间隔秒数

所以需要自己把每个整点时间生成出来。

示例：

```js
range(0, 10800, 3600)
// [0, 3600, 7200]
```

### 11.9 城市别名映射

代码：

```js
const cityAliasMap = new Map([
  ['北京', 'Beijing'],
  ['上海', 'Shanghai'],
  ['广州', 'Guangzhou'],
])
```

作用：

部分中文城市名直接查询时，Geocoding 返回的第一条可能不是你想要的城市。

所以这里给常见城市补一个英文别名，再多查一次，提高命中率。

示例：

```js
const alias = cityAliasMap.get('北京')
// alias = 'Beijing'
```

### 11.10 请求地理编码候选

代码：

```js
const fetchGeoCandidates = async (name) => {
  const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name, count: 10, language: 'zh', format: 'json' },
    timeout: 8000,
    validateStatus: () => true,
  })

  if (response.status !== 200) {
    throw new Error('地理位置查询失败')
  }

  return Array.isArray(response.data?.results) ? response.data.results : []
}
```

作用：

这个函数专门负责查城市候选列表。

执行逻辑：

1. 用 `axios.get()` 请求 Open-Meteo Geocoding
2. 把查询词作为 `name`
3. 最多取 10 条候选
4. 如果 HTTP 状态不是 `200`，主动抛错
5. 如果返回结构里有 `results`，就返回数组，否则返回空数组

为什么用了 `validateStatus: () => true`：

- 默认情况下，`axios` 碰到非 2xx 会直接抛异常
- 这里选择自己判断 `response.status`
- 这样错误处理更可控

### 11.11 地理编码候选排序

代码核心：

```js
const selectBestLocation = (city, candidates) => {
  const normalizedCity = normalizeCityName(city)

  return [...candidates]
    .filter((candidate) => Number.isFinite(candidate?.latitude) && Number.isFinite(candidate?.longitude))
    .sort((a, b) => {
      const aCountryScore = a?.country_code === 'CN' ? 1 : 0
      const bCountryScore = b?.country_code === 'CN' ? 1 : 0
      if (aCountryScore !== bCountryScore) return bCountryScore - aCountryScore

      const aExactScore = normalizeCityName(a?.name) === normalizedCity ? 1 : 0
      const bExactScore = normalizeCityName(b?.name) === normalizedCity ? 1 : 0
      if (aExactScore !== bExactScore) return bExactScore - aExactScore

      const aFeatureScore = featurePriority.get(a?.feature_code) ?? 0
      const bFeatureScore = featurePriority.get(b?.feature_code) ?? 0
      if (aFeatureScore !== bFeatureScore) return bFeatureScore - aFeatureScore

      return Number(b?.population || 0) - Number(a?.population || 0)
    })[0]
}
```

作用：

这个函数从多个候选城市中选出最合理的一条。

排序规则：

1. 优先中国城市
2. 优先名称精确匹配
3. 优先行政级别更高的城市
4. 优先人口更多的城市

为什么这样设计：

- 防止查到国外重名城市
- 防止查到中国的同名小镇
- 优先选择更常见、更大的城市

### 11.12 天气接口主流程

接口定义：

```js
app.get('/api/weather', async (req, res) => {
```

这是前端调用的主接口。

请求方式：

```http
GET /api/weather?city=北京
```

#### 第一步：读取城市名

```js
const city = typeof req.query.city === 'string' ? req.query.city.trim() : ''
```

作用：

- 从 URL 查询参数中读取 `city`
- 如果不是字符串，就给空字符串
- 同时去掉首尾空格

#### 第二步：校验参数

```js
if (!city) {
  return res.status(400).json({ error: '请提供城市名称' })
}
```

作用：

如果用户没传城市名，直接返回 `400`，避免继续请求第三方接口。

#### 第三步：准备候选城市

```js
const alias = cityAliasMap.get(city)
const candidateGroups = await Promise.all([
  fetchGeoCandidates(city),
  alias ? fetchGeoCandidates(alias) : [],
])
const first = selectBestLocation(city, candidateGroups.flat())
```

作用：

1. 先查原始城市名
2. 如果有别名，再查一次别名
3. 用 `Promise.all()` 并发请求，提高速度
4. `flat()` 把两组候选合并成一个数组
5. 用 `selectBestLocation()` 选最佳结果

这里的并发请求是重点：

- 如果顺序执行，两次查询会更慢
- 并发执行能减少等待时间

#### 第四步：拿经纬度

```js
const latitude = first?.latitude
const longitude = first?.longitude
const resolvedName = first?.name
```

作用：

从筛选后的城市对象里取出经纬度和城市名。

#### 第五步：检查经纬度是否有效

```js
if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
  return res.status(404).json({ error: '未找到该城市' })
}
```

作用：

如果最终没拿到有效坐标，说明这个城市没有匹配成功，直接返回 `404`。

#### 第六步：组装 Open-Meteo 请求参数

```js
const params = {
  latitude,
  longitude,
  current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m',
  hourly: 'temperature_2m',
  forecast_hours: 12,
  models: 'icon_seamless',
  timezone: 'auto',
  wind_speed_unit: 'ms',
}
```

这里是整个天气查询最关键的参数对象。

注意点：

- `current` 的字段顺序，后面解析时必须严格一致
- `hourly` 目前只取了 `temperature_2m`
- `forecast_hours: 12` 表示只拿未来 12 小时
- `models: 'icon_seamless'` 指定 DWD 模型

#### 第七步：请求 DWD 天气

```js
const responses = await fetchWeatherApi('https://api.open-meteo.com/v1/dwd-icon', params)
const response = responses[0]
const current = response?.current()
const hourly = response?.hourly()
const utcOffsetSeconds = response?.utcOffsetSeconds?.() ?? 0
```

作用：

1. 调用 Open-Meteo SDK
2. 取第一组地点结果
3. 读取当前天气对象
4. 读取逐小时天气对象
5. 读取时区偏移秒数，后面拼本地时间要用

为什么取 `responses[0]`：

- SDK 支持一次请求多个地点
- 当前项目每次只查一个城市，所以只需要第一项

#### 第八步：校验结果

```js
if (!current || !hourly) {
  return res.status(502).json({ error: '获取气象数据失败' })
}
```

作用：

如果 Open-Meteo 返回结构异常，直接返回 `502`，表示上游天气服务数据不可用。

#### 第九步：处理逐小时数据

代码：

```js
const hourlyTimes = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
  (time) => new Date((time + utcOffsetSeconds) * 1000).toISOString(),
)
const hourlyTemperatures = Array.from(hourly.variables(0)?.valuesArray() ?? [])
const hourlyForecast = hourlyTimes.map((time, index) => ({
  time,
  temperature: hourlyTemperatures[index],
}))
```

这段是整个接口里最值得重点理解的逻辑。

执行过程：

1. `hourly.time()` 取开始时间
2. `hourly.timeEnd()` 取结束时间
3. `hourly.interval()` 取时间间隔
4. 用 `range()` 生成每一个小时的时间戳
5. 加上 `utcOffsetSeconds`，修正到当地时区
6. 转成 JS `Date`
7. 再转成 ISO 字符串
8. 从 `hourly.variables(0)` 取出逐小时温度数组
9. 把时间数组和温度数组按索引拼成对象数组

最终结果类似：

```js
[
  { time: '2026-03-25T10:00:00Z', temperature: 15.89 },
  { time: '2026-03-25T11:00:00Z', temperature: 18.24 }
]
```

#### 第十步：整理成前端需要的 JSON

代码：

```js
return res.json({
  city: resolvedName || city,
  latitude,
  longitude,
  source: 'Open-Meteo DWD ICON',
  model: 'icon_seamless',
  temp: current.variables(0)?.value(),
  humidity: current.variables(1)?.value(),
  text: weatherTextFromCode(current.variables(2)?.value()),
  windScale: windScaleFromMs(current.variables(3)?.value()),
  windDir: windDirFromDegree(current.variables(4)?.value()),
  hourly: hourlyForecast,
})
```

这一段是“后端适配层”。

作用：

把 Open-Meteo SDK 返回的结构，转成前端更容易直接用的普通 JSON。

对应关系：

- `current.variables(0)` -> 温度
- `current.variables(1)` -> 湿度
- `current.variables(2)` -> 天气码，再转中文
- `current.variables(3)` -> 风速，再转风力等级
- `current.variables(4)` -> 风向角度，再转中文方向

### 11.13 异常处理

代码：

```js
} catch (error) {
  const message = error instanceof Error ? error.message : '未知错误'
  console.error('API 请求错误:', message)
  return res.status(500).json({ error: '服务端内部错误' })
}
```

作用：

只要主流程里有任何异常，比如：

- Geocoding 请求失败
- Open-Meteo 请求失败
- 数据解析异常

都会进入 `catch`，避免服务直接崩掉。

执行逻辑：

1. 先取错误信息
2. 打印到控制台，方便调试
3. 返回统一的 `500` 错误给前端

### 11.14 启动服务

代码：

```js
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`天气代理服务已启动: http://localhost:${PORT}`)
})
```

作用：

- 如果环境变量里有 `PORT`，就用环境变量
- 否则默认监听 `3000`
- 启动成功后打印访问地址

## 12. 前端 JS 逻辑说明

除了后端，前端页面也有一层自己的 JS 逻辑，主要在 `src/WeatherQuery.vue`。

### 12.1 响应式状态

代码：

```js
const searchCity = ref('')
const weather = ref(null)
const loading = ref(false)
const errorMessage = ref('')
```

作用：

- `searchCity`：输入框里的城市名
- `weather`：后端返回的天气数据
- `loading`：查询按钮加载状态
- `errorMessage`：错误提示

### 12.2 格式化时间

代码：

```js
const formatHour = (isoTime) => {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) {
    return isoTime
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
```

作用：

把后端返回的 ISO 时间字符串，格式化成更适合页面显示的时间。

例如：

```js
'2026-03-25T10:00:00Z'
```

可能显示为：

```text
03/25 18:00
```

### 12.3 调用后端接口

代码：

```js
const fetchWeatherByCity = async (city) => {
  const normalizedCity = city.trim()

  if (!normalizedCity) {
    errorMessage.value = '城市名不能为空'
    return
  }

  loading.value = true
  errorMessage.value = ''
  weather.value = null

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(normalizedCity)}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '请求失败')
    }

    weather.value = data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '请求失败'
  } finally {
    loading.value = false
  }
}
```

执行逻辑：

1. 去掉城市名前后空格
2. 如果为空，直接提示
3. 开始请求前，把页面状态切到加载中
4. 用 `fetch()` 请求 `/api/weather`
5. 把响应解析成 JSON
6. 如果不是成功状态，抛出错误
7. 成功时把数据写入 `weather.value`
8. 失败时把错误信息写入 `errorMessage`
9. 无论成功还是失败，最后都关闭加载状态

### 12.4 触发搜索

代码：

```js
const goSearch = async () => {
  const city = searchCity.value.trim()
  if (!city) {
    errorMessage.value = '城市名不能为空'
    return
  }

  await router.push({ name: 'weather-city', params: { city } })
}
```

作用：

用户点击按钮或按回车后，不是直接查天气，而是先更新路由。

这样做的好处：

- URL 会变化，例如 `/weather/北京`
- 页面可直接分享链接
- 刷新页面后还能根据路由重新查询

### 12.5 监听路由变化自动查询

代码：

```js
watch(
  () => [route.params.city, route.query.city],
  async ([paramCity, queryCity]) => {
    const cityFromParam = typeof paramCity === 'string' ? paramCity : ''
    const cityFromQuery = typeof queryCity === 'string' ? queryCity : ''
    const city = (cityFromParam || cityFromQuery).trim()

    if (!city) return

    if (searchCity.value !== city) {
      searchCity.value = city
    }

    await fetchWeatherByCity(city)
  },
  { immediate: true },
)
```

执行逻辑：

1. 监听路由参数变化
2. 从 `params.city` 或 `query.city` 中取城市名
3. 如果没有城市名，不执行
4. 如果输入框内容和路由中的城市不同，就同步输入框
5. 调用 `fetchWeatherByCity(city)` 获取天气
6. `immediate: true` 表示组件一加载就立刻执行一次

这保证了：

- 首次打开 `/weather/北京` 会自动查天气
- 修改路由时页面会自动刷新天气数据

## 13. 一句话总结 JS 结构

整个项目的 JS 逻辑可以概括为：

1. 前端拿到城市名
2. 前端请求本地 `/api/weather`
3. 后端用 Geocoding 把城市转经纬度
4. 后端用 `fetchWeatherApi()` 请求 DWD `icon_seamless`
5. 后端把复杂结果整理成简单 JSON
6. 前端把 JSON 渲染到页面上
