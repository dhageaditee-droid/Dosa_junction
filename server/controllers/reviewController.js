const db = require('../config/db');

// GET /api/reviews (Public approved reviews)
const getReviews = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM reviews WHERE is_approved = TRUE ORDER BY created_at DESC LIMIT 20');
    res.json({
      success: true,
      reviews: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { customerName, rating, comment } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Customer name, rating and comment are required.' });
    }

    const result = await db.query(
      `INSERT INTO reviews (customer_name, rating, comment, is_approved)
       VALUES ($1, $2, $3, TRUE)
       RETURNING *`,
      [customerName, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      review: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReviews,
  createReview
};
