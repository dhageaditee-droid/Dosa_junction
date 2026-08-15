const db = require('../config/db');

// POST /api/contact (Public submit enquiry)
const submitEnquiry = async (req, res, next) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    const result = await db.query(
      `INSERT INTO contact_enquiries (name, phone, email, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, phone, email, subject, message]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We have received your enquiry and will contact you shortly.',
      enquiryId: result.rows[0].id
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/contact-enquiries (Admin list)
const getEnquiriesAdmin = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM contact_enquiries ORDER BY created_at DESC');
    res.json({
      success: true,
      enquiries: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/contact-enquiries/:id/status
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE contact_enquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Enquiry status updated.',
      enquiry: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitEnquiry,
  getEnquiriesAdmin,
  updateEnquiryStatus
};
