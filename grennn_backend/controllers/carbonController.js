/**
 * controllers/carbonController.js - 碳足迹控制器
 * 负责碳排放估算、记录落库以及最近一次记录查询
 */
const { CarbonFootprintRecord } = require('../models');

/**
 * 根据用户输入的通勤、用电和饮食数据估算碳排放
 * 返回交通、用电、生活方式三部分排放以及总评级
 */
function calculateEmissions({ commuteKm, commuteMode, electricityKwh, meatMeals }) {
    // 不同通勤方式对应的单位公里排放因子（kg CO2e / km）
    const commuteFactors = { bike: 0, bus: 0.08, car: 0.19 };
    const transportEmission = commuteKm * (commuteFactors[commuteMode] ?? commuteFactors.bus);
    const energyEmission = electricityKwh * 0.58;
    const lifestyleEmission = meatMeals * 1.4;
    const totalEmission = transportEmission + energyEmission + lifestyleEmission;
    // 根据总排放粗略分成低/中/高三个等级，供前端展示标签
    const rating = totalEmission <= 5 ? 'low' : totalEmission <= 12 ? 'medium' : 'high';
    return {
        transportEmission: Number(transportEmission.toFixed(2)),
        energyEmission: Number(energyEmission.toFixed(2)),
        lifestyleEmission: Number(lifestyleEmission.toFixed(2)),
        totalEmission: Number(totalEmission.toFixed(2)),
        rating,
    };
}

/**
 * POST /api/v1/carbon/records
 * 创建一条新的碳足迹记录，并附带一段简单 AI 建议
 */
exports.createRecord = async (req, res) => {
    try {
        // 从请求体中读取用户输入，并对通勤方式做白名单校验
        const commuteKm = Number(req.body?.commuteKm || 0);
        const commuteMode = ['bike', 'bus', 'car'].includes(req.body?.commuteMode) ? req.body.commuteMode : 'bus';
        const electricityKwh = Number(req.body?.electricityKwh || 0);
        const meatMeals = Number(req.body?.meatMeals || 0);

        const emissions = calculateEmissions({ commuteKm, commuteMode, electricityKwh, meatMeals });
        // 根据占比最高的排放来源生成一条简单优化建议
        const aiAdvice = `优先优化${emissions.transportEmission >= emissions.energyEmission && emissions.transportEmission >= emissions.lifestyleEmission ? '通勤方式' : emissions.energyEmission >= emissions.lifestyleEmission ? '家庭用电' : '饮食结构'}，可进一步降低今日碳足迹。`;

        const record = await CarbonFootprintRecord.create({
            userId: req.user?.id || null,
            commuteKm,
            commuteMode,
            electricityKwh,
            meatMeals,
            ...emissions,
            aiAdvice,
        });

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/v1/carbon/records/latest
 * 返回当前登录用户最近一次保存的碳足迹记录
 */
exports.getLatestRecord = async (req, res) => {
    try {
        const record = await CarbonFootprintRecord.findOne({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
        });
        res.json(record || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
