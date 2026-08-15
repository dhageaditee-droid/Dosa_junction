const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || 'Validation failed. Please check input fields.',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const validateAdminLogin = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateCustomerRegister = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateCustomerLogin = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateOrder = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerPhone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),
  body('customerEmail').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address format'),
  body('orderType').isIn(['Dine In', 'Takeaway', 'Home Delivery']).withMessage('Invalid order type selection'),
  body('paymentMethod').isIn(['Cash on Delivery', 'Pay at Restaurant']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('Cart must contain at least 1 item'),
  body('items.*.id').isInt().withMessage('Invalid item ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  
  // Conditional address validation for Home Delivery
  body('deliveryAddress').custom((value, { req }) => {
    if (req.body.orderType === 'Home Delivery' && (!value || !value.trim())) {
      throw new Error('Delivery address is required for Home Delivery orders');
    }
    return true;
  }),
  body('city').custom((value, { req }) => {
    if (req.body.orderType === 'Home Delivery' && (!value || !value.trim())) {
      throw new Error('City is required for Home Delivery orders');
    }
    return true;
  }),
  body('pincode').custom((value, { req }) => {
    if (req.body.orderType === 'Home Delivery') {
      if (!value || !/^[0-9]{6}$/.test(value.trim())) {
        throw new Error('A valid 6-digit PIN code is required for Home Delivery orders');
      }
    }
    return true;
  }),
  handleValidationErrors
];

const validateMenuItem = [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a valid positive number'),
  body('categoryId').isInt().withMessage('Select a valid category'),
  handleValidationErrors
];

const validateContactEnquiry = [
  body('name').trim().notEmpty().withMessage('Your name is required'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile number required'),
  body('email').isEmail().withMessage('Valid email address required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 5 }).withMessage('Message should be at least 5 characters long'),
  handleValidationErrors
];

module.exports = {
  validateAdminLogin,
  validateCustomerRegister,
  validateCustomerLogin,
  validateOrder,
  validateMenuItem,
  validateContactEnquiry
};
