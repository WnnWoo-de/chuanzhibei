const { WasteRecognitionRecord } = require('../models');

exports.analyzeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const keywords = String(req.file.originalname || '').toLowerCase();
    let result;

    if (keywords.includes('bottle') || keywords.includes('瓶') || keywords.includes('塑料')) {
        result = {
            itemName: '塑料瓶 / 玻璃瓶',
            confidence: 96,
            category: '可回收物',
            description: '适宜回收和资源化利用的废弃物。塑料瓶属于可回收的高价值废弃物。',
            tips: ['请清空瓶内残留液体并简单冲洗。', '建议压扁后投放，以节省回收桶空间。', '如果是玻璃瓶，请小心轻放避免破碎。']
        };
    } else if (keywords.includes('battery') || keywords.includes('电池')) {
        result = {
            itemName: '废旧电池',
            confidence: 94,
            category: '有害垃圾',
            description: '含有毒有害化学物质的垃圾。会对土壤和地下水造成严重污染。',
            tips: ['请勿破坏电池外壳，防止有害物质泄漏。', '必须投放到专门的有害垃圾桶或回收点。', '建议优先使用可充电电池。']
        };
    } else if (keywords.includes('apple') || keywords.includes('果') || keywords.includes('food')) {
        result = {
            itemName: '水果残余 / 厨余',
            confidence: 98,
            category: '厨余垃圾',
            description: '家庭或饮食服务产生的易腐性垃圾，可用于堆肥。',
            tips: ['请沥干水分后投放。', '不要连带塑料袋一起投入。', '可尝试堆肥再利用。']
        };
    } else {
        result = {
            itemName: '纸制品 / 快递箱',
            confidence: 89,
            category: '可回收物',
            description: '未被严重污染的纸质废弃物，可回收再造。',
            tips: ['请撕掉胶带和快递单。', '拆解压扁后投放。', '严重油污纸张不可回收。']
        };
    }

    try {
        await WasteRecognitionRecord.create({
            userId: req.user?.id || null,
            imageUrl: `/uploads/${req.file.filename}`,
            originalFilename: req.file.originalname,
            wasteCategory: result.category,
            wasteName: result.itemName,
            confidence: result.confidence,
            aiExplanation: result.description,
            tips: result.tips,
            pointsEarned: 20,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    res.json(result);
};
