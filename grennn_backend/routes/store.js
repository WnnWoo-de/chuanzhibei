const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');
const idempotency = require('../middleware/idempotency');

router.get('/products', storeController.listProducts);
router.get('/records', protect, storeController.listMyRedeemRecords);
router.post('/redeem', protect, idempotency, storeController.redeemProduct);

module.exports = router;
