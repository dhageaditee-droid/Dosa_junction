const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAdminToken, verifyCustomerToken } = require('../middleware/authMiddleware');
const { validateAdminLogin, validateCustomerRegister, validateCustomerLogin } = require('../middleware/validationMiddleware');

// Admin Auth
router.post('/login', validateAdminLogin, authController.login);

// Customer Auth
router.post('/customer/register', validateCustomerRegister, authController.customerRegister);
router.post('/customer/login', validateCustomerLogin, authController.customerLogin);

// Unified Profile API
router.get('/profile', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Token required' });
  next();
}, (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dakshin_bhavan_super_secret_jwt_key_2026_south_indian_delights');
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}, authController.getProfile);

// Save Customer Address
router.post('/customer/addresses', verifyCustomerToken, authController.saveAddress);

module.exports = router;
