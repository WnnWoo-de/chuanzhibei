const axios = require('axios');

const cityAliasMap = new Map([
    ['北京', 'Beijing'],
    ['上海', 'Shanghai'],
    ['广州', 'Guangzhou'],
    ['深圳', 'Shenzhen'],
    ['杭州', 'Hangzhou'],
    ['成都', 'Chengdu'],
]);

const getGeo = async (cityName) => {
    const alias = cityAliasMap.get(cityName) || cityName;
    let res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: cityName, count: 5, language: 'zh', format: 'json' }
    });
    console.log("Original result length:", res.data?.results?.length);
    if (!res.data?.results?.length && alias !== cityName) {
        res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: { name: alias, count: 5, language: 'zh', format: 'json' }
        });
    }
    
    const candidates = res.data?.results || [];
    if (candidates.length > 0) {
        // Sort to prefer CN
        candidates.sort((a, b) => {
            if (a.country_code === 'CN' && b.country_code !== 'CN') return -1;
            if (a.country_code !== 'CN' && b.country_code === 'CN') return 1;
            return (b.population || 0) - (a.population || 0);
        });
        console.log("Best match:", JSON.stringify(candidates[0], null, 2));
    } else {
        console.log("No match found");
    }
}

getGeo('北京');
