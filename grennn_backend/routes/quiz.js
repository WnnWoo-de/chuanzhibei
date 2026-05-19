const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/questions', quizController.listQuestions);
router.get('/records', protect, quizController.listMyRecords);
router.post('/records', protect, quizController.saveRecord);

module.exports = router;
