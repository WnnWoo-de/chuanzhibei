const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimit');

// 游客也可计算，但限制提交频率，避免匿名刷表
const carbonWriteLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: '碳足迹提交过于频繁，请稍后再试',
});

router.post('/records', carbonWriteLimiter, optionalAuth, carbonController.createRecord);
router.get('/records/latest', protect, carbonController.getLatestRecord);

module.exports = router;
