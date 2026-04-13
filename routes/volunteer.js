const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.get('/activities', optionalAuth, volunteerController.getActivities);
router.post('/activities/:id/enroll', protect, volunteerController.enroll);
router.post('/activities/:id/log-hours', protect, volunteerController.logHours);

module.exports = router;
