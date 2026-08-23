const db = require('../config/db');

// Helper to generate unique order number like DJ1025 or ORD-20260815-7892
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomDigits}`;
};

// Helper to attach UPI URI and UPI ID to order response
const attachUpiDetails = (order, upiId = '11424716@indus') => {
  if (!order) return order;
  const formattedAmount = parseFloat(order.total_amount).toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Dosa%20Junction&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(order.order_number)}`;
  return {
    ...order,
    upi_id: upiId,
    upi_uri: upiUri
  };
};

// POST /api/orders (Customer: Create Order)
const createOrder = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      landmark,
      city,
      pincode,
      orderType,
      paymentMethod,
      couponCode,
      items,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Your cart is empty. Please add items to place an order.');
    }

    // Fetch dynamic rates or defaults from restaurant_settings
    const settingsRes = await client.query('SELECT key, value FROM restaurant_settings');
    const settingsMap = {};
    settingsRes.rows.forEach(r => { settingsMap[r.key] = r.value; });

    const taxPercent = parseFloat(settingsMap.tax_rate_percent || '5.0');
    const defaultPacking = parseFloat(settingsMap.packing_charge || '15.0');
    const defaultDelivery = parseFloat(settingsMap.delivery_charge || '30.0');
    const freeDeliveryThreshold = parseFloat(settingsMap.free_delivery_threshold || '400.0');
    const upiId = settingsMap.upi_id || '11424716@indus';

    // Calculate subtotal directly from database menu items to prevent client manipulation
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const itemRes = await client.query('SELECT id, name, price, is_available FROM menu_items WHERE id = $1', [item.id]);
      if (itemRes.rows.length === 0) {
        throw new Error(`Menu item ID ${item.id} no longer exists.`);
      }
      const dbItem = itemRes.rows[0];
      if (!dbItem.is_available) {
        throw new Error(`Sorry, "${dbItem.name}" is currently out of stock.`);
      }

      const itemPrice = parseFloat(dbItem.price);
      const qty = parseInt(item.quantity, 10);
      const itemSubtotal = itemPrice * qty;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        price: itemPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

    // Backend Coupon Discount Verification
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode && couponCode.trim()) {
      const couponRes = await client.query(
        `SELECT * FROM coupons 
         WHERE UPPER(code) = UPPER($1) 
           AND is_active = TRUE 
           AND start_date <= CURRENT_DATE 
           AND expiry_date >= CURRENT_DATE`,
        [couponCode.trim()]
      );

      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        const minOrder = parseFloat(coupon.min_order_amount || 0);

        if (calculatedSubtotal >= minOrder) {
          appliedCouponCode = coupon.code;
          const discountVal = parseFloat(coupon.discount_value);

          if (coupon.discount_type === 'percentage') {
            discountAmount = (calculatedSubtotal * discountVal) / 100;
            if (coupon.max_discount_amount) {
              const maxDisc = parseFloat(coupon.max_discount_amount);
              if (discountAmount > maxDisc) discountAmount = maxDisc;
            }
          } else {
            discountAmount = discountVal;
          }

          if (discountAmount > calculatedSubtotal) discountAmount = calculatedSubtotal;
        }
      }
    }

    const netSubtotal = Math.max(0, calculatedSubtotal - discountAmount);

    // Calculate taxes and charges
    const packingCharge = (orderType === 'Home Delivery' || orderType === 'Takeaway') ? defaultPacking : 0;
    let deliveryCharge = 0;
    if (orderType === 'Home Delivery') {
      deliveryCharge = calculatedSubtotal >= freeDeliveryThreshold ? 0 : defaultDelivery;
    }

    const taxAmount = parseFloat(((netSubtotal * taxPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((netSubtotal + taxAmount + packingCharge + deliveryCharge).toFixed(2));

    const orderNumber = generateOrderNumber();

    // 1. Safely create or match customer record in PostgreSQL
    let customerId = req.customer ? req.customer.id : null;
    
    // Verify customerId exists in database
    if (customerId) {
      const checkCust = await client.query('SELECT id FROM customers WHERE id = $1', [customerId]);
      if (checkCust.rows.length === 0) {
        customerId = null;
      }
    }

    if (!customerId && customerEmail && customerEmail.trim()) {
      const existingCust = await client.query('SELECT id FROM customers WHERE LOWER(email) = LOWER($1)', [customerEmail.trim()]);
      if (existingCust.rows.length > 0) {
        customerId = existingCust.rows[0].id;
      } else {
        const newCust = await client.query(
          `INSERT INTO customers (name, phone, email, address, city, pincode)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [customerName, customerPhone, customerEmail.trim().toLowerCase(), deliveryAddress || null, city || null, pincode || null]
        );
        customerId = newCust.rows[0].id;
      }
    } else if (!customerId && customerPhone && customerPhone.trim()) {
      const existingCustByPhone = await client.query('SELECT id FROM customers WHERE phone = $1', [customerPhone.trim()]);
      if (existingCustByPhone.rows.length > 0) {
        customerId = existingCustByPhone.rows[0].id;
      }
    }

    const isUpiPayment = paymentMethod && (paymentMethod.toLowerCase().includes('upi') || paymentMethod.toLowerCase().includes('qr'));
    const initialPaymentStatus = isUpiPayment ? 'Payment Verification Pending' : 'PENDING';

    // 2. Insert order record
    const orderRes = await client.query(
      `INSERT INTO orders 
        (order_number, customer_id, customer_name, customer_phone, customer_email, delivery_address, landmark, city, pincode, 
         order_type, payment_method, payment_status, status, subtotal, coupon_code, discount_amount, tax, packing_charge, delivery_charge, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pending', $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        orderNumber, customerId, customerName, customerPhone, customerEmail || null, 
        orderType === 'Home Delivery' ? deliveryAddress : null,
        orderType === 'Home Delivery' ? landmark || null : null,
        orderType === 'Home Delivery' ? city : null,
        orderType === 'Home Delivery' ? pincode : null,
        orderType, paymentMethod, initialPaymentStatus, calculatedSubtotal, appliedCouponCode, discountAmount, taxAmount, packingCharge, deliveryCharge, totalAmount, notes || ''
      ]
    );

    const createdOrder = orderRes.rows[0];

    // 3. Insert order items
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [createdOrder.id, vItem.menuItemId, vItem.itemName, vItem.price, vItem.quantity, vItem.subtotal]
      );
    }

    // 4. Create initial Payment entry
    await client.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, paid_amount)
       VALUES ($1, $2, $3, 0)`,
      [createdOrder.id, isUpiPayment ? 'upi_qr' : (paymentMethod === 'Cash on Delivery' ? 'cash_on_delivery' : 'pay_at_restaurant'), initialPaymentStatus]
    );

    await client.query('COMMIT');

    const formattedOrder = attachUpiDetails(createdOrder, upiId);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: createdOrder.order_number,
      upiUri: formattedOrder.upi_uri,
      upiId: formattedOrder.upi_id,
      order: {
        ...formattedOrder,
        items: validatedItems
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/orders/:orderNumber (Public: Track order by order number)
const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const orderRes = await db.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber.trim()]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order number not found.' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
    const formattedOrder = attachUpiDetails(order, upiId);

    res.json({
      success: true,
      order: {
        ...formattedOrder,
        items: itemsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my-orders (Customer: Get order history)
const getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.customer ? req.customer.id : null;
    const customerEmail = req.customer ? req.customer.email : null;

    let queryText = 'SELECT * FROM orders WHERE 1=0';
    const params = [];

    if (customerId) {
      params.push(customerId);
      queryText = `SELECT * FROM orders WHERE customer_id = $1`;
      if (customerEmail) {
        params.push(customerEmail);
        queryText += ` OR LOWER(customer_email) = LOWER($2)`;
      }
    } else if (customerEmail) {
      params.push(customerEmail);
      queryText = `SELECT * FROM orders WHERE LOWER(customer_email) = LOWER($1)`;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await db.query(queryText, params);
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';

    const ordersWithItems = await Promise.all(result.rows.map(async (ord) => {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      return { ...attachUpiDetails(ord, upiId), items: itemsRes.rows };
    }));

    res.json({ success: true, count: ordersWithItems.length, orders: ordersWithItems });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders (Admin: List orders with filters & search)
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, orderType, paymentStatus, today, search } = req.query;

    let queryText = `SELECT * FROM orders WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (orderType && orderType !== 'all') {
      params.push(orderType);
      queryText += ` AND order_type = $${params.length}`;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      params.push(paymentStatus);
      queryText += ` AND payment_status = $${params.length}`;
    }

    if (today === 'true') {
      queryText += ` AND created_at::date = CURRENT_DATE`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (order_number ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length} OR utr_number ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await db.query(queryText, params);
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';

    const ordersWithItems = await Promise.all(result.rows.map(async (ord) => {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      return { ...attachUpiDetails(ord, upiId), items: itemsRes.rows };
    }));

    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:orderNumber/payment-proof (Customer: Upload Screenshot & UTR)
const submitPaymentProof = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { orderNumber } = req.params;
    const { utrNumber, paymentScreenshot } = req.body;

    if (!utrNumber || !utrNumber.trim()) {
      return res.status(400).json({ success: false, message: 'UPI Transaction ID / UTR is required.' });
    }

    if (!paymentScreenshot || !paymentScreenshot.trim()) {
      return res.status(400).json({ success: false, message: 'Payment screenshot proof is required.' });
    }

    const cleanUtr = utrNumber.trim();

    // Fetch order
    const orderRes = await client.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber.trim()]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = orderRes.rows[0];

    // Check duplicate UTR across all other orders (ignoring rejected ones)
    const dupCheck = await client.query(
      `SELECT id, order_number FROM orders 
       WHERE LOWER(utr_number) = LOWER($1) 
         AND id != $2 
         AND payment_status != 'Payment Rejected'`,
      [cleanUtr, order.id]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `This UTR number (${cleanUtr}) has already been submitted for another order (#${dupCheck.rows[0].order_number}). Duplicate UTR numbers cannot be reused.`
      });
    }

    // Update order with UTR and screenshot, set status to Payment Verification Pending
    const updatedRes = await client.query(
      `UPDATE orders
       SET utr_number = $1,
           payment_screenshot = $2,
           payment_status = 'Payment Verification Pending',
           payment_proof_submitted_at = CURRENT_TIMESTAMP,
           rejection_reason = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [cleanUtr, paymentScreenshot, order.id]
    );

    await client.query(
      `UPDATE payments
       SET payment_status = 'Payment Verification Pending',
           transaction_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $2`,
      [cleanUtr, order.id]
    );

    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    
    const upiRes = await client.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
    const formattedOrder = attachUpiDetails(updatedRes.rows[0], upiId);

    res.json({
      success: true,
      message: 'Payment proof submitted successfully! Verification is pending.',
      order: {
        ...formattedOrder,
        items: itemsRes.rows
      }
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
};

// PATCH /api/admin/orders/:id/verify-payment (Admin: Verify/Approve or Reject payment)
const verifyPayment = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    let newPaymentStatus = '';
    let newOrderStatus = order.status;
    let reasonToSave = null;
    let paidAmount = order.paid_amount || 0;
    let paidAt = order.paid_at;

    if (action === 'approve') {
      newPaymentStatus = 'Payment Verified';
      newOrderStatus = 'Confirmed';
      paidAmount = order.total_amount;
      paidAt = new Date();
      reasonToSave = null;
    } else if (action === 'reject') {
      newPaymentStatus = 'Payment Rejected';
      reasonToSave = rejectionReason && rejectionReason.trim() ? rejectionReason.trim() : 'Payment proof verification rejected by admin.';
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid action. Must be "approve" or "reject".' });
    }

    const updatedRes = await client.query(
      `UPDATE orders
       SET payment_status = $1,
           status = $2,
           rejection_reason = $3,
           paid_amount = $4,
           paid_at = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [newPaymentStatus, newOrderStatus, reasonToSave, paidAmount, paidAt, id]
    );

    await client.query(
      `UPDATE payments
       SET payment_status = $1,
           paid_amount = $2,
           paid_at = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $4`,
      [newPaymentStatus, paidAmount, paidAt, id]
    );

    await client.query('COMMIT');

    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const upiRes = await client.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : 'dosajunction@upi';
    const formattedOrder = attachUpiDetails(updatedRes.rows[0], upiId);

    res.json({
      success: true,
      message: action === 'approve'
        ? `Payment verified & Order #${order.order_number} confirmed!`
        : `Payment rejected for Order #${order.order_number}.`,
      order: {
        ...formattedOrder,
        items: itemsRes.rows
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// PATCH /api/admin/orders/:id/status (Admin: Update order status)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
    }

    const result = await db.query(
      `UPDATE orders 
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : 'dosajunction@upi';
    const formattedOrder = attachUpiDetails(result.rows[0], upiId);

    res.json({
      success: true,
      message: `Order status updated to "${result.rows[0].status}".`,
      order: formattedOrder
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/orders/:id/payment (Admin: Update payment status PENDING -> PAID)
const updatePaymentStatus = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { paymentStatus = 'Payment Verified', paidAmount, paymentMethod } = req.body;

    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    const finalPaidAmount = paidAmount || order.total_amount;

    // Update order table
    const updatedOrderRes = await client.query(
      `UPDATE orders 
       SET payment_status = $1,
           paid_amount = $2,
           paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [paymentStatus, finalPaidAmount, id]
    );

    // Update payments table entry
    await client.query(
      `UPDATE payments
       SET payment_status = $1,
           paid_amount = $2,
           paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $3`,
      [paymentStatus, finalPaidAmount, id]
    );

    await client.query('COMMIT');

    const upiRes = await client.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : 'dosajunction@upi';
    const formattedOrder = attachUpiDetails(updatedOrderRes.rows[0], upiId);

    res.json({
      success: true,
      message: `Payment status marked as "${paymentStatus}" for order #${order.order_number}.`,
      order: formattedOrder
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res, next) => {
  try {
    const todayOrdersRes = await db.query(`SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount), 0)::numeric as revenue FROM orders WHERE created_at::date = CURRENT_DATE AND status != 'Cancelled'`);
    const totalOrdersRes = await db.query(`SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount), 0)::numeric as revenue FROM orders WHERE status != 'Cancelled'`);
    const pendingOrdersRes = await db.query(`SELECT COUNT(*)::int as count FROM orders WHERE status IN ('Pending', 'Confirmed', 'Preparing')`);
    const completedOrdersRes = await db.query(`SELECT COUNT(*)::int as count FROM orders WHERE status = 'Completed'`);
    const totalCustomersRes = await db.query(`SELECT COUNT(*)::int as count FROM customers`);
    const menuCountRes = await db.query(`SELECT COUNT(*)::int as count FROM menu_items`);

    const recentOrdersRes = await db.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 6`);
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : 'dosajunction@upi';

    // Attach items to each recent order
    const recentOrdersWithItems = await Promise.all(recentOrdersRes.rows.map(async (ord) => {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      return { ...attachUpiDetails(ord, upiId), items: itemsRes.rows };
    }));

    res.json({
      success: true,
      stats: {
        todayOrders: todayOrdersRes.rows[0].count,
        todayRevenue: parseFloat(todayOrdersRes.rows[0].revenue),
        totalOrders: totalOrdersRes.rows[0].count,
        totalRevenue: parseFloat(totalOrdersRes.rows[0].revenue),
        pendingOrders: pendingOrdersRes.rows[0].count,
        completedOrders: completedOrdersRes.rows[0].count,
        totalCustomers: totalCustomersRes.rows[0].count,
        totalMenuItems: menuCountRes.rows[0].count
      },
      recentOrders: recentOrdersWithItems
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getMyOrders,
  getAdminOrders,
  submitPaymentProof,
  verifyPayment,
  updateOrderStatus,
  updatePaymentStatus,
  getDashboardStats
};
