const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/db');

describe('Dakshin Bhavan Comprehensive REST API Integration Test Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let testOrderNumber = '';
  let createdMenuItemId = null;
  let createdCouponId = null;

  const testCustomerEmail = `testuser_${Date.now()}@example.com`;
  const testCustomerPassword = 'TestPassword123';

  afterAll(async () => {
    // Clean test data and close DB pool cleanly
    try {
      await pool.query("DELETE FROM customers WHERE email LIKE 'testuser_%'");
      await pool.query("DELETE FROM orders WHERE customer_name = 'Test Suite Customer'");
      if (createdMenuItemId) {
        await pool.query("DELETE FROM menu_items WHERE id = $1", [createdMenuItemId]);
      }
      if (createdCouponId) {
        await pool.query("DELETE FROM coupons WHERE id = $1", [createdCouponId]);
      }
    } catch (e) {
      // Cleanup catch
    }
    await pool.end();
  });

  // 1. Health Check
  it('GET /api/health - should return 200 OK with online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'online');
  });

  // 2. Admin Login & Auth Protection
  it('POST /api/auth/login - should authenticate admin and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@dosajunction.com',
        password: 'Admin@123456'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  it('GET /api/orders/admin/all - should reject unauthorized request without JWT token', async () => {
    const res = await request(app).get('/api/orders/admin/all');
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Customer Registration & Login
  it('POST /api/auth/customer/register - should register new customer account', async () => {
    const res = await request(app)
      .post('/api/auth/customer/register')
      .send({
        name: 'Test Suite Customer',
        phone: '9876543210',
        email: testCustomerEmail,
        password: testCustomerPassword,
        address: '123 Test Street',
        city: 'Bengaluru',
        pincode: '560001'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    customerToken = res.body.token;
  });

  it('POST /api/auth/customer/login - should authenticate customer with valid password', async () => {
    const res = await request(app)
      .post('/api/auth/customer/login')
      .send({
        email: testCustomerEmail,
        password: testCustomerPassword
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  // 4. Menu & Search API
  it('GET /api/menu - should return menu items list', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('GET /api/menu?search=dosa - should filter matching dosa items', async () => {
    const res = await request(app).get('/api/menu?search=dosa');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  // 5. Coupon Validation
  it('POST /api/coupons/validate - should validate valid coupon SOUTH10', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'SOUTH10',
        subtotal: 300
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.coupon).toHaveProperty('calculatedDiscount');
  });

  // 6. Order Creation (COD & Pay at Restaurant)
  it('POST /api/orders - should create Cash on Delivery order with recalculated prices', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Test Suite Customer',
        customerPhone: '9876543210',
        customerEmail: testCustomerEmail,
        deliveryAddress: '100 Feet Road, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        orderType: 'Home Delivery',
        paymentMethod: 'Cash on Delivery',
        couponCode: 'SOUTH10',
        items: [
          { id: 1, quantity: 2 },
          { id: 2, quantity: 1 }
        ]
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('orderNumber');
    expect(res.body.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    testOrderNumber = res.body.orderNumber;
  });

  it('POST /api/orders - should create Takeaway Pay-at-Restaurant order without requiring address', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Test Suite Customer',
        customerPhone: '9876543210',
        customerEmail: testCustomerEmail,
        orderType: 'Takeaway',
        paymentMethod: 'Pay at Restaurant',
        items: [{ id: 19, quantity: 2 }]
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.order_type).toBe('Takeaway');
  });

  // 7. Order Tracking
  it('GET /api/orders/track/:orderNumber - should return order details for visual tracking', async () => {
    const res = await request(app).get(`/api/orders/track/${testOrderNumber}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.order_number).toBe(testOrderNumber);
  });

  // 8. Admin Order Lifecycle Management
  it('GET /api/orders/admin/all - should return admin orders list with JWT', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('PATCH /api/orders/admin/:id/status - should transition status from Pending to Confirmed', async () => {
    const orderRes = await request(app).get(`/api/orders/track/${testOrderNumber}`);
    const orderId = orderRes.body.order.id;

    const res = await request(app)
      .patch(`/api/orders/admin/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Confirmed' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.status).toBe('Confirmed');
  });

  it('PATCH /api/orders/admin/:id/payment - should mark payment status as PAID', async () => {
    const orderRes = await request(app).get(`/api/orders/track/${testOrderNumber}`);
    const orderId = orderRes.body.order.id;

    const res = await request(app)
      .patch(`/api/orders/admin/${orderId}/payment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentStatus: 'PAID' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.payment_status).toBe('PAID');
  });

  // 9. Admin Menu CRUD
  it('POST /api/menu/admin - should create new menu item', async () => {
    const res = await request(app)
      .post('/api/menu/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Podi Idli',
        description: 'Test spiced mini idli',
        price: 110,
        categoryId: 4,
        isVeg: true,
        spiceLevel: 'spicy',
        preparationTime: '10 mins',
        isAvailable: true,
        isBestseller: true
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    createdMenuItemId = res.body.item.id;
  });

  it('DELETE /api/menu/admin/:id - should delete menu item', async () => {
    if (!createdMenuItemId) return;
    const res = await request(app)
      .delete(`/api/menu/admin/${createdMenuItemId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    createdMenuItemId = null;
  });

  // 10. Form Validation & Error Handling
  it('POST /api/orders - should reject empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Test Customer',
        customerPhone: '9876543210',
        orderType: 'Home Delivery',
        paymentMethod: 'Cash on Delivery',
        items: []
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
