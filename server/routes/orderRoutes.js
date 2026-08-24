const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyAdminToken, verifyCustomerToken, optionalCustomerToken } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validationMiddleware');

// Payment Session Routes (Temporary Reference PAY-DJ-XXXX before order creation)
router.post('/payment-sessions', optionalCustomerToken, validateOrder, orderController.createPaymentSession);
router.get('/payment-sessions/:paymentRef', orderController.getPaymentSession);
router.post('/payment-sessions/:paymentRef/proof', orderController.submitPaymentSessionProof);

// Admin Payment Session Verification Routes
router.get('/admin/payment-sessions', verifyAdminToken, orderController.getAdminPaymentSessions);
router.patch('/admin/payment-sessions/:id/verify', verifyAdminToken, orderController.verifyPaymentSession);

// Customer Order Routes
router.get('/my-orders', verifyCustomerToken, orderController.getMyOrders);
router.get('/track/:orderNumber', orderController.getOrderByNumber);

// Admin Order Routes
router.get('/admin/all', verifyAdminToken, orderController.getAdminOrders);
router.get('/admin/dashboard-stats', verifyAdminToken, orderController.getDashboardStats);
router.patch('/admin/:id/status', verifyAdminToken, orderController.updateOrderStatus);
router.patch('/admin/:id/payment', verifyAdminToken, orderController.updatePaymentStatus);

module.exports = router;
