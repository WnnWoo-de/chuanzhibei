const { WasteRecognitionRecord } = require('../models');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.analyzeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const form = new FormData();
        form.append('file', req.file.buffer, { filename: req.file.originalname });

        // 转发图片给本地 8000 端口的 Python AI 服务
        const aiResponse = await axios.post('http://127.0.0.1:8000/api/ai/predict', form, {
            headers: form.getHeaders(),
            timeout: 15000 // 15秒超时保护
        });

        if (aiResponse.data.status === 'success') {
            const aiData = aiResponse.data.data;

            // 将 AI 响应转换为前端期望的格式
            const result = {
                itemName: aiData.name,
                confidence: 95, // AI 识别默认置信度
                category: normalizeCategory(aiData.category),
                description: aiData.reason || 'AI 识别结果',
                tips: generateTipsByCategory(normalizeCategory(aiData.category))
            };

            // 保存文件到磁盘
            const filename = `${Date.now()}-${req.file.originalname}`;
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, req.file.buffer);

            // 保存到数据库
            await WasteRecognitionRecord.create({
                userId: req.user?.id || null,
                imageUrl: `/uploads/${filename}`,
                originalFilename: req.file.originalname,
                wasteCategory: result.category,
                wasteName: result.itemName,
                confidence: result.confidence,
                aiExplanation: result.description,
                tips: result.tips,
                pointsEarned: 20,
            });

            return res.json(result);
        } else {
            throw new Error(aiResponse.data.message || 'AI 识别异常');
        }
    } catch (error) {
        console.error('垃圾分类失败:', error.message);
        res.status(500).json({ error: '服务器繁忙或 AI 请求超时' });
    }
};

// 标准化分类名称，确保与前端一致
const normalizeCategory = (category) => {
    const categoryMap = {
        '可回收物': '可回收物',
        '有害垃圾': '有害垃圾',
        '湿垃圾': '厨余垃圾', // 将 AI 返回的湿垃圾映射为厨余垃圾（前端使用厨余垃圾）
        '厨余垃圾': '厨余垃圾',
        '干垃圾': '其他垃圾', // 将 AI 返回的干垃圾映射为其他垃圾（前端使用其他垃圾）
        '其他垃圾': '其他垃圾'
    };
    return categoryMap[category] || '其他垃圾';
};

// 根据分类生成环保建议
const generateTipsByCategory = (category) => {
    const tipsMap = {
        '可回收物': ['请清空瓶内残留液体并简单冲洗。', '建议压扁后投放，以节省回收桶空间。', '如果是玻璃瓶，请小心轻放避免破碎。'],
        '有害垃圾': ['请勿破坏电池外壳，防止有害物质泄漏。', '必须投放到专门的有害垃圾桶或回收点。', '建议优先使用可充电电池。'],
        '厨余垃圾': ['请沥干水分后投放。', '不要连带塑料袋一起投入。', '可尝试堆肥再利用。'],
        '其他垃圾': ['请尽量沥干水分。', '难以回收的废弃物请投放至干垃圾桶。']
    };
    return tipsMap[category] || ['请按照当地垃圾分类标准投放。'];
};
