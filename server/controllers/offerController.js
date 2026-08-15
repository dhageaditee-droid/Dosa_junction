const db = require('../config/db');

// GET /api/offers (Public active offers)
const getOffers = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM offers 
       WHERE is_active = TRUE AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE 
       ORDER BY id DESC`
    );
    res.json({
      success: true,
      offers: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/offers (Admin: List all offers)
const getAllOffersAdmin = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM offers ORDER BY id DESC');
    res.json({
      success: true,
      offers: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/offers
const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      description,
      code,
      discountPercentage,
      discountAmount,
      minOrderAmount,
      imageUrl,
      startDate,
      endDate,
      isActive = true
    } = req.body;

    const result = await db.query(
      `INSERT INTO offers (title, description, code, discount_percentage, discount_amount, min_order_amount, image_url, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        description,
        code.toUpperCase(),
        discountPercentage || 0,
        discountAmount || 0,
        minOrderAmount || 0,
        imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        startDate,
        endDate,
        isActive
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Offer created successfully.',
      offer: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/offers/:id
const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      code,
      discountPercentage,
      discountAmount,
      minOrderAmount,
      imageUrl,
      startDate,
      endDate,
      isActive
    } = req.body;

    const result = await db.query(
      `UPDATE offers
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           code = COALESCE($3, code),
           discount_percentage = COALESCE($4, discount_percentage),
           discount_amount = COALESCE($5, discount_amount),
           min_order_amount = COALESCE($6, min_order_amount),
           image_url = COALESCE($7, image_url),
           start_date = COALESCE($8, start_date),
           end_date = COALESCE($9, end_date),
           is_active = COALESCE($10, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [title, description, code, discountPercentage, discountAmount, minOrderAmount, imageUrl, startDate, endDate, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer updated successfully.',
      offer: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/offers/:id
const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM offers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOffers,
  getAllOffersAdmin,
  createOffer,
  updateOffer,
  deleteOffer
};
