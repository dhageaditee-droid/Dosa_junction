const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const { validateMenuItem } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin protected routes
router.post('/admin', verifyAdminToken, validateMenuItem, createMenuItem);
router.put('/admin/:id', verifyAdminToken, updateMenuItem);
router.delete('/admin/:id', verifyAdminToken, deleteMenuItem);

module.exports = router;
