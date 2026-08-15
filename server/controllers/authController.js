const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dakshin_bhavan_super_secret_jwt_key_2026_south_indian_delights';

// Admin Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: payload
    });
  } catch (err) {
    next(err);
  }
};

// Customer Registration
const customerRegister = async (req, res, next) => {
  try {
    const { name, phone, email, password, address, city, pincode } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, and password are required.'
      });
    }

    // Check if email already registered
    const existing = await db.query('SELECT id FROM customers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO customers (name, phone, email, password_hash, address, city, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, email, address, city, pincode, created_at`,
      [name.trim(), phone.trim(), email.trim().toLowerCase(), hashedPassword, address || null, city || null, pincode || null]
    );

    const customer = result.rows[0];

    // If address provided, save as default address
    if (address && city && pincode) {
      await db.query(
        `INSERT INTO customer_addresses (customer_id, label, address_line, city, pincode, is_default)
         VALUES ($1, 'Home', $2, $3, $4, TRUE)`,
        [customer.id, address, city, pincode]
      );
    }

    const payload = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: 'customer'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      customer
    });
  } catch (err) {
    next(err);
  }
};

// Customer Login
const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM customers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const customer = result.rows[0];
    if (!customer.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Account was created as guest. Please set a password or register.'
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const payload = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: 'customer'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get Profile
const getProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const result = await db.query('SELECT id, name, email, role, created_at FROM admins WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Admin account not found.' });
      return res.json({ success: true, user: result.rows[0], role: 'admin' });
    }

    const customerRes = await db.query('SELECT id, name, phone, email, address, city, pincode, created_at FROM customers WHERE id = $1', [req.user.id]);
    if (customerRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Customer account not found.' });

    const addressesRes = await db.query('SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, id DESC', [req.user.id]);

    res.json({
      success: true,
      customer: customerRes.rows[0],
      addresses: addressesRes.rows,
      role: 'customer'
    });
  } catch (err) {
    next(err);
  }
};

// Save Address
const saveAddress = async (req, res, next) => {
  try {
    const customerId = req.customer.id;
    const { label = 'Home', addressLine, landmark, city, pincode, isDefault = false } = req.body;

    if (!addressLine || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Address line, city, and PIN code are required.' });
    }

    if (isDefault) {
      await db.query('UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = $1', [customerId]);
    }

    const result = await db.query(
      `INSERT INTO customer_addresses (customer_id, label, address_line, landmark, city, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [customerId, label, addressLine, landmark || null, city, pincode, isDefault]
    );

    res.status(201).json({
      success: true,
      message: 'Address saved successfully!',
      address: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  customerRegister,
  customerLogin,
  getProfile,
  saveAddress
};
