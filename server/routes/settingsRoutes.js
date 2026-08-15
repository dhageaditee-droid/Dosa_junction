const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/admin', verifyAdminToken, updateSettings);

module.exports = router;
