const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const idempotency = require('../middleware/idempotency');

router.get('/questions', quizController.listQuestions);
router.get('/records', protect, quizController.listMyRecords);
router.post('/records', protect, idempotency, quizController.saveRecord);

module.exports = router;
