const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dakshin_bhavan_super_secret_jwt_key_2026_south_indian_delights';

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.'
      });
    }
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token. Please log in again.'
    });
  }
};

const verifyCustomerToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customer = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const optionalCustomerToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.customer = decoded;
      req.user = decoded;
    } catch (e) {
      // ignore expired optional token
    }
  }
  next();
};

module.exports = {
  verifyAdminToken,
  verifyCustomerToken,
  optionalCustomerToken
};
