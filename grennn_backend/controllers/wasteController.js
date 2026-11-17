const crypto = require('crypto');
const { WasteRecognitionRecord } = require('../models');
const { awardPoints } = require('../services/points');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8003/api/ai/predict';

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

        // 转发图片给 Python AI 视觉识别服务
        const aiResponse = await axios.post(AI_SERVICE_URL, form, {
            headers: form.getHeaders(),
            timeout: 60000
        });

        if (aiResponse.data.status === 'success') {
            const aiData = aiResponse.data.data;
            const category = normalizeCategory(aiData.category);

            // 将 AI 响应转换为前端期望的格式
            const result = {
                itemName: aiData.name || aiData.itemName || '未识别物品',
                confidence: normalizeConfidence(aiData.confidence),
                category,
                description: aiData.reason || 'AI 识别结果',
                tips: normalizeTips(aiData.tips, category),
                pointsEarned: 0,
            };

            // 使用随机文件名与真实扩展名，避免原始文件名造成路径穿越
            const extMap = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp',
                'image/gif': 'gif',
            };
            const ext = extMap[String(req.file.mimetype || '').toLowerCase()] || 'jpg';
            const filename = `waste-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
            const filePath = path.join(uploadsDir, filename);
            await fs.promises.writeFile(filePath, req.file.buffer);

            // 保存识别记录；数据库临时不可用时不影响本次识别结果返回
            try {
                const record = await WasteRecognitionRecord.create({
                    userId: req.user?.id || null,
                    imageUrl: `/uploads/${filename}`,
                    originalFilename: path.basename(req.file.originalname || '').slice(0, 200),
                    wasteCategory: result.category,
                    wasteName: result.itemName,
                    confidence: result.confidence,
                    aiExplanation: result.description,
                    tips: result.tips,
                    pointsEarned: 20,
                });

                if (req.user?.id) {
                    const reward = await awardPoints({
                        userId: req.user.id,
                        amount: 20,
                        reason: 'waste',
                        eventKey: `waste:${record.id}`,
                        dailyCap: 100,
                    });
                    result.pointsEarned = reward.awarded;
                    result.points = reward.points;
                }
            } catch (saveErr) {
                console.error('保存垃圾识别记录失败:', saveErr.message);
            }

            return res.json(result);
        } else {
            throw new Error(aiResponse.data.message || 'AI 识别异常');
        }
    } catch (error) {
        console.error('垃圾分类失败:', error.message);
        res.status(500).json({ error: error.message || '服务器繁忙或 AI 请求超时' });
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

const normalizeConfidence = (confidence) => {
    if (typeof confidence === 'number' && Number.isFinite(confidence)) {
        return Math.max(1, Math.min(99, Math.round(confidence)));
    }
    const text = String(confidence || '').trim();
    if (text.includes('高')) return 92;
    if (text.includes('中')) return 78;
    if (text.includes('低')) return 58;
    const parsed = Number.parseFloat(text.replace('%', ''));
    if (Number.isFinite(parsed)) {
        return Math.max(1, Math.min(99, Math.round(parsed)));
    }
    return 88;
};

const normalizeTips = (tips, category) => {
    if (Array.isArray(tips)) {
        const cleaned = tips
            .map((tip) => String(tip || '').trim())
            .filter(Boolean)
            .slice(0, 4);
        if (cleaned.length) return cleaned;
    }
    return generateTipsByCategory(category);
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
