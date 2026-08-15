const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/admin', verifyAdminToken, createCategory);
router.put('/admin/:id', verifyAdminToken, updateCategory);
router.delete('/admin/:id', verifyAdminToken, deleteCategory);

module.exports = router;
