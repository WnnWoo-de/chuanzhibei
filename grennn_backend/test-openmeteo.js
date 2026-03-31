const { queryWeather } = require('./controllers/weatherController');

const req = { query: { city: '北京' } };
const res = {
    status: (code) => {
        console.log('Status code:', code);
        return res;
    },
    json: (data) => {
        console.log(JSON.stringify(data, null, 2));
    }
};

(async () => {
    await queryWeather(req, res);
})();
