const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const upload = require('../middleware/uploadMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/analyze', optionalAuth, upload.single('file'), wasteController.analyzeImage);

module.exports = router;
