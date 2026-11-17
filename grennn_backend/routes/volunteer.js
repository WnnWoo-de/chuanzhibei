const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const idempotency = require('../middleware/idempotency');

router.get('/activities', optionalAuth, volunteerController.getActivities);
router.post('/activities/:id/enroll', protect, volunteerController.enroll);
router.post('/activities/:id/log-hours', protect, idempotency, volunteerController.logHours);

module.exports = router;
