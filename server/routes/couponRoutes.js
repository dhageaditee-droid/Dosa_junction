const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public coupon validation
router.post('/validate', couponController.validateCoupon);

// Admin Coupon Management Routes
router.get('/admin/all', verifyAdminToken, couponController.getAdminCoupons);
router.post('/admin', verifyAdminToken, couponController.createCoupon);
router.put('/admin/:id', verifyAdminToken, couponController.updateCoupon);
router.delete('/admin/:id', verifyAdminToken, couponController.deleteCoupon);

module.exports = router;
