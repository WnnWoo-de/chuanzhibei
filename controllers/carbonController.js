const { CarbonFootprintRecord } = require('../models');

function calculateEmissions({ commuteKm, commuteMode, electricityKwh, meatMeals }) {
    const commuteFactors = { bike: 0, bus: 0.08, car: 0.19 };
    const transportEmission = commuteKm * (commuteFactors[commuteMode] ?? commuteFactors.bus);
    const energyEmission = electricityKwh * 0.58;
    const lifestyleEmission = meatMeals * 1.4;
    const totalEmission = transportEmission + energyEmission + lifestyleEmission;
    const rating = totalEmission <= 5 ? 'low' : totalEmission <= 12 ? 'medium' : 'high';
    return {
        transportEmission: Number(transportEmission.toFixed(2)),
        energyEmission: Number(energyEmission.toFixed(2)),
        lifestyleEmission: Number(lifestyleEmission.toFixed(2)),
        totalEmission: Number(totalEmission.toFixed(2)),
        rating,
    };
}

exports.createRecord = async (req, res) => {
    try {
        const commuteKm = Number(req.body?.commuteKm || 0);
        const commuteMode = ['bike', 'bus', 'car'].includes(req.body?.commuteMode) ? req.body.commuteMode : 'bus';
        const electricityKwh = Number(req.body?.electricityKwh || 0);
        const meatMeals = Number(req.body?.meatMeals || 0);

        const emissions = calculateEmissions({ commuteKm, commuteMode, electricityKwh, meatMeals });
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
