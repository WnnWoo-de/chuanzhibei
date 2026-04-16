const fs = require('fs/promises');
const axios = require('axios');
const { ReconstructionRecord } = require('../models');

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8003';

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
                    : '',
        }))
        .filter((item) => item.title);
};

exports.analyzeImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
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

        if (data?.status !== 'success' || !data?.data) {
            return res.status(502).json({ error: data?.message || 'FastAPI analysis failed' });
        }

        const payload = data.data;
        const analysis = {
            analysis_id: typeof payload.analysis_id === 'string' && payload.analysis_id.trim()
                ? payload.analysis_id.trim()
                : `rec_${Date.now()}`,
            image_url: `/uploads/${req.file.filename}`,
            material: typeof payload.material === 'string' && payload.material.trim()
                ? payload.material.trim()
                : '材质识别中',
            integrity: typeof payload.integrity === 'string' && payload.integrity.trim()
                ? payload.integrity.trim()
                : '待评估',
            carbon_reduction:
                typeof payload.carbon_reduction === 'string' && payload.carbon_reduction.trim()
                    ? payload.carbon_reduction.trim()
                    : '0 kg CO₂e',
            suggestions: normalizeSuggestions(payload.suggestions),
        };

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
        const message = err?.response?.data?.message || err.message;
        return res.status(500).json({ error: message || 'Reconstruction analysis failed' });
    }
};
