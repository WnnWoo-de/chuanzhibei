const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const multer = require('multer');
const { optionalAuth } = require('../middleware/authMiddleware');

// 使用内存存储接收上传图片，加快转发速度到 AI 服务
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', optionalAuth, upload.single('file'), wasteController.analyzeImage);

module.exports = router;
