const db = require('../config/db');

// POST /api/coupons/validate (Public: Validate coupon & return discount)
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const orderSubtotal = parseFloat(subtotal || 0);

    const result = await db.query(
      `SELECT * FROM coupons 
       WHERE UPPER(code) = UPPER($1) 
         AND is_active = TRUE 
         AND start_date <= CURRENT_DATE 
         AND expiry_date >= CURRENT_DATE`,
      [code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const coupon = result.rows[0];

    const minOrder = parseFloat(coupon.min_order_amount || 0);
    if (orderSubtotal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order amount of ₹${minOrder.toFixed(2)}.`
      });
    }

    let discount = 0;
    const discountVal = parseFloat(coupon.discount_value);

    if (coupon.discount_type === 'percentage') {
      discount = (orderSubtotal * discountVal) / 100;
      if (coupon.max_discount_amount) {
        const maxDisc = parseFloat(coupon.max_discount_amount);
        if (discount > maxDisc) discount = maxDisc;
      }
    } else {
      discount = discountVal;
    }

    if (discount > orderSubtotal) discount = orderSubtotal;

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: discountVal,
        calculatedDiscount: parseFloat(discount.toFixed(2))
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/coupons (Admin: List all coupons)
const getAdminCoupons = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ success: true, coupons: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/coupons (Admin: Create coupon)
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount = null,
      startDate,
      expiryDate,
      isActive = true
    } = req.body;

    const result = await db.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, expiry_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        code.toUpperCase().trim(),
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount || null,
        startDate,
        expiryDate,
        isActive
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      isActive
    } = req.body;

    const result = await db.query(
      `UPDATE coupons
       SET code = COALESCE($1, code),
           description = COALESCE($2, description),
           discount_type = COALESCE($3, discount_type),
           discount_value = COALESCE($4, discount_value),
           min_order_amount = COALESCE($5, min_order_amount),
           max_discount_amount = COALESCE($6, max_discount_amount),
           start_date = COALESCE($7, start_date),
           expiry_date = COALESCE($8, expiry_date),
           is_active = COALESCE($9, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [code ? code.toUpperCase() : null, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, expiryDate, isActive, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Coupon not found.' });

    res.json({ success: true, message: 'Coupon updated successfully.', coupon: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
