const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.post('/records', optionalAuth, carbonController.createRecord);
router.get('/records/latest', protect, carbonController.getLatestRecord);

module.exports = router;
