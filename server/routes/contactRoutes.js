const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getEnquiriesAdmin,
  updateEnquiryStatus
} = require('../controllers/contactController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const { validateContactEnquiry } = require('../middleware/validationMiddleware');

router.post('/', validateContactEnquiry, submitEnquiry);
router.get('/admin', verifyAdminToken, getEnquiriesAdmin);
router.patch('/admin/:id/status', verifyAdminToken, updateEnquiryStatus);

module.exports = router;
