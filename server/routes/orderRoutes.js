const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyAdminToken, verifyCustomerToken, optionalCustomerToken } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validationMiddleware');

// Customer order routes
router.post('/', optionalCustomerToken, validateOrder, orderController.createOrder);
router.get('/my-orders', verifyCustomerToken, orderController.getMyOrders);
router.get('/track/:orderNumber', orderController.getOrderByNumber);
router.post('/:orderNumber/payment-proof', orderController.submitPaymentProof);

// Admin order routes
router.get('/admin/all', verifyAdminToken, orderController.getAdminOrders);
router.get('/admin/dashboard-stats', verifyAdminToken, orderController.getDashboardStats);
router.patch('/admin/:id/status', verifyAdminToken, orderController.updateOrderStatus);
router.patch('/admin/:id/payment', verifyAdminToken, orderController.updatePaymentStatus);
router.patch('/admin/:id/verify-payment', verifyAdminToken, orderController.verifyPayment);

module.exports = router;
