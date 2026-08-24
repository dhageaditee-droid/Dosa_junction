const db = require('../config/db');

// Helper to generate unique order number like DJ-1025 or ORD-20260815-7892
const generateOrderNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `DJ-${randomDigits}`;
};

// Helper to generate temporary payment ref like PAY-DJ-1025
const generatePaymentRef = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PAY-DJ-${randomDigits}`;
};

// Helper to attach UPI URI and UPI ID to order response
const attachUpiDetails = (order, upiId = '11424716@indus') => {
  if (!order) return order;
  const formattedAmount = parseFloat(order.total_amount).toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=DosaJunction&am=${formattedAmount}&cu=INR`;
  return {
    ...order,
    upi_id: upiId,
    upi_uri: upiUri
  };
};

// Helper to attach UPI URI and UPI ID to payment session response
const attachSessionUpiDetails = (session, upiId = '11424716@indus') => {
  if (!session) return session;
  const formattedAmount = parseFloat(session.total_amount).toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=DosaJunction&am=${formattedAmount}&cu=INR`;
  return {
    ...session,
    upi_id: upiId,
    upi_uri: upiUri
  };
};

// POST /api/payment-sessions (Customer: Create Temporary Payment Session - NO Order Created Yet)
const createPaymentSession = async (req, res, next) => {
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
      couponCode,
      items,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Your cart is empty. Please add items to proceed.');
    }

    const settingsRes = await client.query('SELECT key, value FROM restaurant_settings');
    const settingsMap = {};
    settingsRes.rows.forEach(r => { settingsMap[r.key] = r.value; });

    const taxPercent = parseFloat(settingsMap.tax_rate_percent || '5.0');
    const defaultPacking = parseFloat(settingsMap.packing_charge || '15.0');
    const defaultDelivery = parseFloat(settingsMap.delivery_charge || '30.0');
    const freeDeliveryThreshold = parseFloat(settingsMap.free_delivery_threshold || '400.0');
    const upiId = settingsMap.upi_id || '11424716@indus';

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
        id: dbItem.id,
        menuItemId: dbItem.id,
        item_name: dbItem.name,
        name: dbItem.name,
        price: itemPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

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
    const packingCharge = (orderType === 'Home Delivery' || orderType === 'Takeaway') ? defaultPacking : 0;
    let deliveryCharge = 0;
    if (orderType === 'Home Delivery') {
      deliveryCharge = calculatedSubtotal >= freeDeliveryThreshold ? 0 : defaultDelivery;
    }

    const taxAmount = parseFloat(((netSubtotal * taxPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((netSubtotal + taxAmount + packingCharge + deliveryCharge).toFixed(2));

    const paymentRef = generatePaymentRef();
    let customerId = req.customer ? req.customer.id : null;

    const sessionRes = await client.query(
      `INSERT INTO payment_sessions
        (payment_ref, customer_id, customer_name, customer_phone, customer_email, delivery_address, landmark, city, pincode,
         order_type, payment_method, subtotal, coupon_code, discount_amount, tax, packing_charge, delivery_charge, total_amount, notes, cart_items, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Online UPI Payment', $11, $12, $13, $14, $15, $16, $17, $18, $19, 'Created')
       RETURNING *`,
      [
        paymentRef, customerId, customerName.trim(), customerPhone.trim(), customerEmail || null,
        orderType === 'Home Delivery' ? deliveryAddress.trim() : null,
        orderType === 'Home Delivery' ? landmark || null : null,
        orderType === 'Home Delivery' ? city : null,
        orderType === 'Home Delivery' ? pincode : null,
        orderType, calculatedSubtotal, appliedCouponCode, discountAmount, taxAmount, packingCharge, deliveryCharge, totalAmount, notes || '',
        JSON.stringify(validatedItems)
      ]
    );

    await client.query('COMMIT');

    const formattedSession = attachSessionUpiDetails(sessionRes.rows[0], upiId);

    res.status(201).json({
      success: true,
      message: 'Temporary payment session created. Please complete UPI payment.',
      paymentRef: formattedSession.payment_ref,
      totalAmount: formattedSession.total_amount,
      upiUri: formattedSession.upi_uri,
      upiId: formattedSession.upi_id,
      session: formattedSession
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/payment-sessions/:paymentRef (Public: Get payment session status & details)
const getPaymentSession = async (req, res, next) => {
  try {
    const { paymentRef } = req.params;
    const sessionRes = await db.query('SELECT * FROM payment_sessions WHERE payment_ref = $1', [paymentRef.trim()]);

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment session reference not found.' });
    }

    const session = sessionRes.rows[0];
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';

    const formattedSession = attachSessionUpiDetails(session, upiId);

    // If session is approved and has an order_id, attach order details as well
    let order = null;
    if (session.order_id) {
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [session.order_id]);
      if (orderRes.rows.length > 0) {
        const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [session.order_id]);
        order = { ...attachUpiDetails(orderRes.rows[0], upiId), items: itemsRes.rows };
      }
    }

    res.json({
      success: true,
      session: formattedSession,
      order
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payment-sessions/:paymentRef/proof (Customer: Submit UTR & Screenshot for payment session)
const submitPaymentSessionProof = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { paymentRef } = req.params;
    const { utrNumber, paymentScreenshot } = req.body;

    if (!utrNumber || !utrNumber.trim()) {
      return res.status(400).json({ success: false, message: 'UPI Transaction ID / UTR is required.' });
    }

    if (!paymentScreenshot || !paymentScreenshot.trim()) {
      return res.status(400).json({ success: false, message: 'Payment screenshot proof is required.' });
    }

    const cleanUtr = utrNumber.trim();

    const sessionRes = await client.query('SELECT * FROM payment_sessions WHERE payment_ref = $1', [paymentRef.trim()]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment session reference not found.' });
    }
    const session = sessionRes.rows[0];

    // Check duplicate UTR across all other non-rejected payment sessions & orders
    const dupSession = await client.query(
      `SELECT id, payment_ref FROM payment_sessions 
       WHERE LOWER(utr_number) = LOWER($1) 
         AND id != $2 
         AND status != 'Rejected'`,
      [cleanUtr, session.id]
    );

    if (dupSession.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `This UTR number (${cleanUtr}) has already been submitted for payment session #${dupSession.rows[0].payment_ref}. Duplicate UTR numbers cannot be reused.`
      });
    }

    const dupOrder = await client.query(
      `SELECT id, order_number FROM orders 
       WHERE LOWER(utr_number) = LOWER($1) 
         AND payment_status != 'Payment Rejected'`,
      [cleanUtr]
    );

    if (dupOrder.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `This UTR number (${cleanUtr}) has already been used for order #${dupOrder.rows[0].order_number}.`
      });
    }

    const updatedRes = await client.query(
      `UPDATE payment_sessions
       SET utr_number = $1,
           payment_screenshot = $2,
           status = 'Verification Pending',
           payment_proof_submitted_at = CURRENT_TIMESTAMP,
           rejection_reason = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [cleanUtr, paymentScreenshot, session.id]
    );

    const upiRes = await client.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
    const formattedSession = attachSessionUpiDetails(updatedRes.rows[0], upiId);

    res.json({
      success: true,
      message: 'Payment proof submitted successfully! Your payment is being verified. Your order will be placed after payment verification.',
      session: formattedSession
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/admin/payment-sessions (Admin: List payment sessions)
const getAdminPaymentSessions = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let queryText = `SELECT * FROM payment_sessions WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (payment_ref ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length} OR utr_number ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await db.query(queryText, params);
    const upiRes = await db.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';

    const formattedSessions = result.rows.map(s => attachSessionUpiDetails(s, upiId));

    res.json({
      success: true,
      count: formattedSessions.length,
      sessions: formattedSessions
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/payment-sessions/:id/verify (Admin: Approve Payment -> Create Order OR Reject Payment)
const verifyPaymentSession = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    const sessionRes = await client.query('SELECT * FROM payment_sessions WHERE id = $1 FOR UPDATE', [id]);
    if (sessionRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Payment session not found.' });
    }

    const session = sessionRes.rows[0];

    if (action === 'approve') {
      // IDEMPOTENCY CHECK: If an order was already created for this session, return it without creating a duplicate!
      if (session.order_id || session.order_number) {
        const existingOrderRes = await client.query('SELECT * FROM orders WHERE id = $1 OR order_number = $2', [session.order_id, session.order_number]);
        if (existingOrderRes.rows.length > 0) {
          const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [existingOrderRes.rows[0].id]);
          await client.query('COMMIT');
          return res.json({
            success: true,
            message: `Order #${existingOrderRes.rows[0].order_number} already verified & confirmed!`,
            order: { ...existingOrderRes.rows[0], items: itemsRes.rows },
            session
          });
        }
      }

      // Generate final Order ID e.g. DJ-1051
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `DJ-${randomDigits}`;

      const cartItems = typeof session.cart_items === 'string' ? JSON.parse(session.cart_items) : (session.cart_items || []);

      // Create official order in `orders` table ONLY AFTER ADMIN APPROVAL!
      const orderRes = await client.query(
        `INSERT INTO orders 
          (order_number, customer_id, customer_name, customer_phone, customer_email, delivery_address, landmark, city, pincode, 
           order_type, payment_method, payment_status, status, subtotal, coupon_code, discount_amount, tax, packing_charge, delivery_charge, total_amount, paid_amount, paid_at, utr_number, payment_screenshot, payment_proof_submitted_at, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Online UPI Payment', 'Payment Verified', 'Confirmed', $11, $12, $13, $14, $15, $16, $17, $17, CURRENT_TIMESTAMP, $18, $19, $20, $21)
         RETURNING *`,
        [
          orderNumber, session.customer_id, session.customer_name, session.customer_phone, session.customer_email,
          session.delivery_address, session.landmark, session.city, session.pincode,
          session.order_type, session.subtotal, session.coupon_code, session.discount_amount, session.tax, session.packing_charge, session.delivery_charge, session.total_amount,
          session.utr_number, session.payment_screenshot, session.payment_proof_submitted_at || new Date(), session.notes
        ]
      );

      const createdOrder = orderRes.rows[0];

      // Insert order items
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, item_name, price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [createdOrder.id, item.id || item.menuItemId, item.item_name || item.name, item.price, item.quantity, item.subtotal]
        );
      }

      // Insert payment row
      await client.query(
        `INSERT INTO payments (order_id, payment_method, payment_status, paid_amount, paid_at, transaction_id)
         VALUES ($1, 'upi_qr', 'Payment Verified', $2, CURRENT_TIMESTAMP, $3)`,
        [createdOrder.id, createdOrder.total_amount, session.utr_number]
      );

      // Update payment session to Approved and link created order ID
      const updatedSessionRes = await client.query(
        `UPDATE payment_sessions
         SET status = 'Approved',
             order_id = $1,
             order_number = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [createdOrder.id, createdOrder.order_number, id]
      );

      await client.query('COMMIT');

      const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id = $1', [createdOrder.id]);
      const upiRes = await client.query("SELECT value FROM restaurant_settings WHERE key = 'upi_id'");
      const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
      const formattedOrder = attachUpiDetails(createdOrder, upiId);

      res.json({
        success: true,
        message: `Payment Approved! Order ${createdOrder.order_number} has been placed & confirmed successfully!`,
        order: {
          ...formattedOrder,
          items: itemsRes.rows
        },
        session: updatedSessionRes.rows[0]
      });
    } else if (action === 'reject') {
      const reason = rejectionReason && rejectionReason.trim() ? rejectionReason.trim() : 'Payment proof verification rejected by admin.';

      const updatedSessionRes = await client.query(
        `UPDATE payment_sessions
         SET status = 'Rejected',
             rejection_reason = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [reason, id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Payment session #${session.payment_ref} rejected. No order was created.`,
        session: updatedSessionRes.rows[0]
      });
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid action. Must be "approve" or "reject".' });
    }
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
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
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

// PATCH /api/admin/orders/:id/payment (Admin: Update payment status)
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
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';
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
    const upiId = (upiRes.rows[0] && upiRes.rows[0].value) ? upiRes.rows[0].value.trim() : '11424716@indus';

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
  createPaymentSession,
  getPaymentSession,
  submitPaymentSessionProof,
  getAdminPaymentSessions,
  verifyPaymentSession,
  getOrderByNumber,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getDashboardStats
};
