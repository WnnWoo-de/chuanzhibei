const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/products', storeController.listProducts);
router.get('/records', protect, storeController.listMyRedeemRecords);
router.post('/redeem', protect, storeController.redeemProduct);

module.exports = router;
