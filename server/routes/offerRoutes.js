const express = require('express');
const router = express.Router();
const {
  getOffers,
  getAllOffersAdmin,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', getOffers);
router.get('/admin', verifyAdminToken, getAllOffersAdmin);
router.post('/admin', verifyAdminToken, createOffer);
router.put('/admin/:id', verifyAdminToken, updateOffer);
router.delete('/admin/:id', verifyAdminToken, deleteOffer);

module.exports = router;
