/**
 * controllers/weatherController.js - 天气与空气质量控制器
 * 
 * 接口实现基于 Open-Meteo API
 */

const axios = require('axios');

// ── 工具函数 ──────────────────────────────────────────────────────────────────

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

// 天气码转中文和 QWeather 规范图标
const weatherCodeMap = {
    0: { text: "晴", icon: "100" },
    1: { text: "晴间多云", icon: "101" },
    2: { text: "多云", icon: "101" },
    3: { text: "阴", icon: "104" },
    45: { text: "雾", icon: "501" },
    48: { text: "雾", icon: "501" },
    51: { text: "小阵雨", icon: "300" },
    53: { text: "中阵雨", icon: "301" },
    55: { text: "大阵雨", icon: "302" },
    56: { text: "冻毛毛雨", icon: "300" },
    57: { text: "冻毛毛雨", icon: "302" },
    61: { text: "小雨", icon: "305" },
    63: { text: "中雨", icon: "306" },
    65: { text: "大雨", icon: "307" },
    66: { text: "冻雨", icon: "305" },
    67: { text: "冻雨", icon: "307" },
    71: { text: "小雪", icon: "400" },
    73: { text: "中雪", icon: "401" },
    75: { text: "大雪", icon: "402" },
    77: { text: "米雪", icon: "400" },
    80: { text: "阵雨", icon: "300" },
    81: { text: "强阵雨", icon: "301" },
    82: { text: "暴雨", icon: "302" },
    85: { text: "阵雪", icon: "400" },
    86: { text: "阵雪", icon: "402" },
    95: { text: "雷阵雨", icon: "302" },
    96: { text: "雷暴伴有冰雹", icon: "304" },
    99: { text: "雷暴伴有冰雹", icon: "304" }
};

const getWeatherInfo = (code, isNight = false) => {
    const info = weatherCodeMap[code] || { text: "未知", icon: "999" };
    let icon = info.icon;
    if (isNight) {
        if (icon === "100") icon = "150";
        if (icon === "101") icon = "151";
        if (icon === "104") icon = "154";
        if (icon === "300") icon = "350";
        if (icon === "301") icon = "351";
    }
    return { text: info.text, icon };
};

const windDirFromDegree = (deg) => {
    const d = Number(deg);
    if (!Number.isFinite(d)) return '';
    const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
    const index = Math.round(d / 45) % 8;
    return directions[index];
};

const windScaleFromKmh = (kmh) => {
    const v = Number(kmh);
    if (!Number.isFinite(v) || v < 0) return '';
    const ms = v / 3.6;
    const thresholds = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
    for (let i = 0; i < thresholds.length; i += 1) {
        if (ms < thresholds[i]) return String(i);
    }
    return '12';
};

const mapAirGrade = (aqi) => {
    if (!Number.isFinite(aqi))  return { level: '未知',    advice: '暂无空气质量建议。' };
    if (aqi <= 50)              return { level: '优',      advice: '空气质量优，适合外出活动。' };
    if (aqi <= 100)             return { level: '良',      advice: '空气质量良好，敏感人群适度减少户外运动。' };
    if (aqi <= 150)             return { level: '轻度污染', advice: '建议减少长时间户外活动，外出可佩戴口罩。' };
    if (aqi <= 200)             return { level: '中度污染', advice: '儿童、老人及敏感人群尽量避免外出。' };
    if (aqi <= 300)             return { level: '重度污染', advice: '建议减少外出并关闭门窗。' };
    return                             { level: '严重污染', advice: '避免户外活动，做好防护。' };
};

const getPrimaryPollutant = (currentDesc) => {
    let maxItem = 'PM2.5';
    let maxVal = currentDesc.pm2_5 || 0;
    if ((currentDesc.pm10 || 0) > maxVal) { maxItem = 'PM10'; maxVal = currentDesc.pm10; }
    if ((currentDesc.ozone || 0) > maxVal) { maxItem = 'O3'; maxVal = currentDesc.ozone; }
    return maxItem;
};

const cityAliasMap = new Map([
    ['北京', 'Beijing'],
    ['上海', 'Shanghai'],
    ['广州', 'Guangzhou'],
    ['深圳', 'Shenzhen'],
    ['杭州', 'Hangzhou'],
    ['成都', 'Chengdu'],
    ['重庆', 'Chongqing'],
    ['南京', 'Nanjing'],
    ['武汉', 'Wuhan'],
    ['西安', 'Xi\'an'],
    ['天津', 'Tianjin'],
    ['苏州', 'Suzhou']
]);

const normalizeCityName = (name) => {
    if (!name) return '';
    return name.replace(/市$|区$|县$|特别行政区$/, '').trim();
};

const getGeoLocation = async (cityName) => {
    try {
        const rawName = String(cityName).trim();
        const normalized = rawName.replace(/市$|区$|县$|特别行政区$/, '');
        const alias = cityAliasMap.get(normalized);
        
        let candidates = [];
        
        const fetchGeo = async (q) => {
            if (!q) return [];
            try {
                const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
                    params: { name: q, count: 5, language: 'zh', format: 'json' },
                    timeout: 8000
                });
                return res.data?.results || [];
            } catch (err) {
                return [];
            }
        };

        // 1. 优先使用英文别名（如果存在），针对一线城市最准确
        if (alias) {
            candidates = await fetchGeo(alias);
        }
        
        // 2. 使用用户原始输入 (例如 "重庆", "天河区")
        if (candidates.length === 0) {
            candidates = await fetchGeo(rawName);
        }
        
        // 3. 尝试去除市/区/县后缀搜索 (例如 "天河")
        if (candidates.length === 0 && rawName !== normalized) {
            candidates = await fetchGeo(normalized);
        }
        
        // 4. 尝试补全“市”搜索，因为 Open-Meteo 对部分城市需要带“市”才能匹配到，例如没有别名时的 "重庆市"
        if (candidates.length === 0 && !rawName.endsWith('市') && !rawName.endsWith('区') && !rawName.endsWith('县')) {
            candidates = await fetchGeo(normalized + '市');
        }
        
        if (candidates.length > 0) {
            // Sort to prefer CN and highest population
            candidates.sort((a, b) => {
                if (a.country_code === 'CN' && b.country_code !== 'CN') return -1;
                if (a.country_code !== 'CN' && b.country_code === 'CN') return 1;
                return (b.population || 0) - (a.population || 0);
            });
            return candidates[0];
        }
    } catch (e) {
        console.error('Geocoding error:', e.message);
    }
    return null;
};

// ── 接口实现 ───────────────────────────────────────────────────────────

exports.queryAirQuality = async (req, res) => {
    const city = String(req.query?.city || '').trim();
    if (!city) return res.status(400).json({ error: '请提供城市名称' });

    try {
        const location = await getGeoLocation(city);
        if (!location) return res.status(404).json({ error: '未找到该城市' });

        const airResp = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
            params: {
                latitude: location.latitude,
                longitude: location.longitude,
                current: 'european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
                hourly: 'pm10,pm2_5,european_aqi',
                timezone: 'auto'
            },
            timeout: 8000
        });

        const currentAir = airResp.data?.current || {};
        const hourlyAir = airResp.data?.hourly || {};
        
        const aqi = toNumber(currentAir.european_aqi) || 50;
        const grade = mapAirGrade(aqi);

        let pm25Trend = [];
        if (hourlyAir.time && hourlyAir.pm2_5) {
            const limit = Math.min(24, hourlyAir.time.length);
            for(let i=0; i<limit; i++) {
                pm25Trend.push({ date: hourlyAir.time[i], value: toNumber(hourlyAir.pm2_5[i]) });
            }
        }

        const airQuality = {
            aqi,
            category: grade.level,
            level: grade.level,
            advice: grade.advice,
            primary: getPrimaryPollutant(currentAir),
            pollutants: [
                { key: 'pm10', name: 'PM10', unit: 'μg/m³', value: toNumber(currentAir.pm10) },
                { key: 'pm2p5', name: 'PM2.5', unit: 'μg/m³', value: toNumber(currentAir.pm2_5) },
                { key: 'o3', name: 'O₃', unit: 'μg/m³', value: toNumber(currentAir.ozone) },
                { key: 'no2', name: 'NO₂', unit: 'μg/m³', value: toNumber(currentAir.nitrogen_dioxide) },
                { key: 'so2', name: 'SO₂', unit: 'μg/m³', value: toNumber(currentAir.sulphur_dioxide) },
                { key: 'co', name: 'CO', unit: 'μg/m³', value: toNumber(currentAir.carbon_monoxide) },
            ].filter(p => p.value !== null),
            trend: { pm2p5: pm25Trend }
        };

        return res.json({
            city: { id: String(location.id), name: location.name, adm1: location.admin1 || '', adm2: location.admin2 || '' },
            airQuality
        });
    } catch (e) {
        console.error('Air quality query error:', e.message);
        return res.status(500).json({ error: '空气质量查询失败' });
    }
};


exports.queryWeather = async (req, res) => {
    const city = String(req.query?.city || '').trim();
    if (!city) return res.status(400).json({ error: '请提供城市名称' });

    try {
        const location = await getGeoLocation(city);
        if (!location) {
            return res.status(404).json({ error: '未找到对应的城市坐标，请换个词重试' });
        }

        const lat = location.latitude;
        const lon = location.longitude;

        // Fetch Weather
        const weatherReq = axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant',
                timezone: 'auto',
                forecast_days: 10
            },
            timeout: 8000
        });

        // Fetch Air Quality
        const airReq = axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
                hourly: 'pm2_5',
                timezone: 'auto'
            },
            timeout: 8000
        });

        const [wRes, aRes] = await Promise.all([weatherReq, airReq]);

        const wd = wRes.data;
        const current = wd.current || {};
        const hourly = wd.hourly || {};
        const daily = wd.daily || {};
        
        const ad = aRes.data;
        const currentAir = ad.current || {};
        
        // 1. Current Weather
        const isNight = current.is_day === 0;
        const currentInfo = getWeatherInfo(current.weather_code, isNight);
        
        const nowObj = {
            obsTime: current.time,
            temp: toNumber(current.temperature_2m),
            feelsLike: toNumber(current.apparent_temperature),
            text: currentInfo.text,
            icon: currentInfo.icon,
            humidity: toNumber(current.relative_humidity_2m),
            windDir: windDirFromDegree(current.wind_direction_10m),
            windSpeed: toNumber(current.wind_speed_10m),
            windScale: windScaleFromKmh(current.wind_speed_10m),
            pressure: toNumber(current.pressure_msl),
            vis: 10, // API maybe doesn't give visibility, fallback to 10km
            uvIndex: daily.uv_index_max?.[0] || 0,
            sunset: daily.sunset?.[0],
            sunrise: daily.sunrise?.[0],
            precipitation: toNumber(current.precipitation)
        };

        // 2. Hourly Forecast (next 24 hours)
        let hourlyArr = [];
        if (hourly.time) {
            const nowTime = new Date().getTime();
            for (let i = 0; i < hourly.time.length; i++) {
                const hTime = new Date(hourly.time[i]).getTime();
                if (hTime >= nowTime - 3600000 && hourlyArr.length < 24) {
                    const isNightH = false; // simplify
                    const hInfo = getWeatherInfo(hourly.weather_code[i], isNightH);
                    hourlyArr.push({
                        time: hourly.time[i],
                        temp: toNumber(hourly.temperature_2m[i]),
                        icon: hInfo.icon,
                        precipProb: Math.round(hourly.precipitation_probability[i] || 0),
                        windScale: windScaleFromKmh(hourly.wind_speed_10m[i])
                    });
                }
            }
        }

        // 3. Daily Forecast (10 days)
        let forecastArr = [];
        if (daily.time) {
            for (let i = 0; i < daily.time.length; i++) {
                const infoDay = getWeatherInfo(daily.weather_code[i], false);
                const infoNight = getWeatherInfo(daily.weather_code[i], true); // proxy
                forecastArr.push({
                    date: daily.time[i],
                    textDay: infoDay.text,
                    textNight: infoNight.text,
                    iconDay: infoDay.icon,
                    iconNight: infoNight.icon,
                    tempMax: toNumber(daily.temperature_2m_max[i]),
                    tempMin: toNumber(daily.temperature_2m_min[i]),
                    precipSum: toNumber(daily.precipitation_sum[i]),
                    precipProb: toNumber(daily.precipitation_probability_max[i]),
                    uvIndex: toNumber(daily.uv_index_max[i]),
                    windScaleDay: windScaleFromKmh(daily.wind_speed_10m_max[i]),
                    windDirDay: windDirFromDegree(daily.wind_direction_10m_dominant[i]),
                });
            }
        }

        // 4. Air Quality
        const aqi = toNumber(currentAir.european_aqi) || 50;
        const grade = mapAirGrade(aqi);
        let pm25Trend = [];
        if (ad.hourly?.time && ad.hourly?.pm2_5) {
            const limit = Math.min(24, ad.hourly.time.length);
            for(let i=0; i<limit; i++) {
                pm25Trend.push({ date: ad.hourly.time[i], value: toNumber(ad.hourly.pm2_5[i]) });
            }
        }
        
        const airQualityObj = {
            aqi,
            category: grade.level,
            level: grade.level,
            advice: grade.advice,
            primary: getPrimaryPollutant(currentAir),
            pollutants: [
                { key: 'pm10', name: 'PM10', unit: 'μg/m³', value: toNumber(currentAir.pm10) },
                { key: 'pm2p5', name: 'PM2.5', unit: 'μg/m³', value: toNumber(currentAir.pm2_5) },
                { key: 'o3', name: 'O₃', unit: 'μg/m³', value: toNumber(currentAir.ozone) },
                { key: 'no2', name: 'NO₂', unit: 'μg/m³', value: toNumber(currentAir.nitrogen_dioxide) },
                { key: 'so2', name: 'SO₂', unit: 'μg/m³', value: toNumber(currentAir.sulphur_dioxide) },
                { key: 'co', name: 'CO', unit: 'μg/m³', value: toNumber(currentAir.carbon_monoxide) },
            ].filter(p => p.value !== null),
            trend: { pm2p5: pm25Trend }
        };

        // Combine Response
        return res.json({
            city: { 
                id: String(location.id), 
                name: location.name, 
                adm1: location.admin1 || '', 
                adm2: location.admin2 || '',
                country: location.country || ''
            },
            now: nowObj,
            hourly: hourlyArr,
            forecast: forecastArr,
            airQuality: airQualityObj
        });
        
    } catch (e) {
        console.error('Weather query error:', e.message);
        return res.status(500).json({ error: '天气查询失败，请稍后再试' });
    }
};
