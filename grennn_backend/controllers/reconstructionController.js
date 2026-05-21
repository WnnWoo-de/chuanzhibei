/**
 * controllers/reconstructionController.js - 旧物重构控制器
 * 负责接收图片、转发给 FastAPI AI 服务分析，并将结果持久化
 */
const fs = require('fs/promises');
const axios = require('axios');
const { ReconstructionRecord } = require('../models');

// FastAPI AI 服务地址，默认指向本机 8003 端口
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8003';

/** 清洗 FastAPI 返回的建议列表，统一字段并过滤无效项 */
const normalizeSuggestions = (suggestions) => {
    if (!Array.isArray(suggestions)) return [];

    return suggestions
        .map((item) => ({
            title: typeof item?.title === 'string' ? item.title.trim() : '',
            description: typeof item?.description === 'string' ? item.description.trim() : '',
            steps: Array.isArray(item?.steps)
                ? item.steps.filter((step) => typeof step === 'string' && step.trim()).map((step) => step.trim())
                : [],
            difficulty: typeof item?.difficulty === 'string' && item.difficulty.trim() ? item.difficulty.trim() : '中等',
            duration: typeof item?.duration === 'string' && item.duration.trim() ? item.duration.trim() : '2-4 小时',
            carbon_reduction:
                typeof item?.carbon_reduction === 'string' && item.carbon_reduction.trim()
                    ? item.carbon_reduction.trim()
                    : '不适用',
        }))
        .filter((item) => item.title);
};

/**
 * POST /api/v1/reconstruction/analyze
 * 上传旧物图片并调用 AI 识别材质、可改造性和重构建议
 */
exports.analyzeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        // 读取上传文件并转成 base64，便于通过 JSON 请求体转发给 FastAPI
        const imageBuffer = await fs.readFile(req.file.path);
        const base64Image = imageBuffer.toString('base64');

        const { data } = await axios.post(
            `${FASTAPI_BASE_URL}/api/ai/reconstruction/analyze`,
            {
                filename: req.file.originalname,
                mime_type: req.file.mimetype,
                image_base64: base64Image,
            },
            {
                timeout: 30000,
            },
        );

        // FastAPI 未返回成功状态时，视为上游分析失败
        if (data?.status !== 'success' || !data?.data) {
            return res.status(502).json({ error: data?.message || 'FastAPI analysis failed' });
        }

        const payload = data.data;
        // 对上游 AI 结果做兜底和字段规范化，保证前端总能拿到完整结构
        const analysis = {
            analysis_id: typeof payload.analysis_id === 'string' && payload.analysis_id.trim()
                ? payload.analysis_id.trim()
                : `rec_${Date.now()}`,
            image_url: `/uploads/${req.file.filename}`,
            item_name: typeof payload.item_name === 'string' && payload.item_name.trim()
                ? payload.item_name.trim()
                : '未识别物品',
            material: typeof payload.material === 'string' && payload.material.trim()
                ? payload.material.trim()
                : '未识别',
            integrity: typeof payload.integrity === 'string' && payload.integrity.trim()
                ? payload.integrity.trim()
                : '不适用',
            carbon_reduction:
                typeof payload.carbon_reduction === 'string' && payload.carbon_reduction.trim()
                    ? payload.carbon_reduction.trim()
                    : '不适用',
            reconstructable: Boolean(payload.reconstructable),
            confidence: typeof payload.confidence === 'string' && payload.confidence.trim()
                ? payload.confidence.trim()
                : '低',
            reason: typeof payload.reason === 'string' && payload.reason.trim()
                ? payload.reason.trim()
                : '暂未获得可靠判断依据',
            disposal_advice: typeof payload.disposal_advice === 'string' && payload.disposal_advice.trim()
                ? payload.disposal_advice.trim()
                : '请结合材质与当地回收要求分类处理',
            suggestions: normalizeSuggestions(payload.suggestions),
        };

        // 将分析结果摘要写入数据库，供后续个人记录或作品发布功能复用
        await ReconstructionRecord.create({
            userId: req.user?.id || null,
            imageUrl: analysis.image_url,
            originalFilename: req.file.originalname,
            material: analysis.material,
            integrity: analysis.integrity,
            carbonReduction: analysis.carbon_reduction,
            suggestions: analysis.suggestions,
            analysisId: analysis.analysis_id,
            pointsEarned: 50,
            isPublished: false,
        });

        return res.json(analysis);
    } catch (err) {
        // 优先返回 FastAPI 上游的 message，没有则回退到本地错误信息
        const message = err?.response?.data?.message || err.message;
        return res.status(500).json({ error: message || 'Reconstruction analysis failed' });
    }
};
