let globalOrders = [
  {
    id: 101,
    order_number: 'ORD-20260815-4829',
    customer_name: 'Aditee Kumar',
    customer_phone: '+91 70207 58779',
    customer_email: 'aditee@example.com',
    delivery_address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
    order_type: 'Home Delivery',
    payment_method: 'Cash on Delivery',
    payment_status: 'PAID',
    status: 'Confirmed',
    subtotal: 185.00,
    tax: 9.25,
    packing_charge: 15.00,
    delivery_charge: 0.00,
    discount_amount: 0.00,
    total_amount: 209.25,
    items: [
      { menuItemId: 10, item_name: 'Ghee Masala Dosa', price: 110.00, quantity: 1, subtotal: 110.00 },
      { menuItemId: 1, item_name: 'Chaha', price: 15.00, quantity: 1, subtotal: 15.00 },
      { menuItemId: 2, item_name: 'Filter Coffee', price: 25.00, quantity: 2, subtotal: 50.00 }
    ],
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 102,
    order_number: 'ORD-20260815-5912',
    customer_name: 'Rohan Sharma',
    customer_phone: '+91 98234 56789',
    customer_email: 'rohan@example.com',
    delivery_address: 'Main Market, Sinnar',
    order_type: 'Takeaway',
    payment_method: 'UPI / Online',
    payment_status: 'PAID',
    status: 'Preparing',
    subtotal: 140.00,
    tax: 7.00,
    packing_charge: 15.00,
    delivery_charge: 0.00,
    discount_amount: 0.00,
    total_amount: 162.00,
    items: [
      { menuItemId: 20, item_name: 'Paper Masala Dosa', price: 100.00, quantity: 1, subtotal: 100.00 },
      { menuItemId: 30, item_name: 'Sambar Vada (2 Pcs)', price: 40.00, quantity: 1, subtotal: 40.00 }
    ],
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 103,
    order_number: 'ORD-20260815-6301',
    customer_name: 'Priya Patel',
    customer_phone: '+91 91580 12345',
    customer_email: 'priya@example.com',
    delivery_address: 'Panchvati Hotel Lane, Sinnar',
    order_type: 'Dine-In',
    payment_method: 'Cash / Pay at Restaurant',
    payment_status: 'PENDING',
    status: 'Pending',
    subtotal: 210.00,
    tax: 10.50,
    packing_charge: 0.00,
    delivery_charge: 0.00,
    discount_amount: 0.00,
    total_amount: 220.50,
    items: [
      { menuItemId: 15, item_name: 'Loni Sponge Dosa (3 Pcs)', price: 90.00, quantity: 1, subtotal: 90.00 },
      { menuItemId: 25, item_name: 'Special Mysore Masala Dosa', price: 120.00, quantity: 1, subtotal: 120.00 }
    ],
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const orderData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const orderNum = orderData.order_number || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      customer_name: orderData.customerName || orderData.customer_name || 'Customer',
      customer_phone: orderData.phone || orderData.customerPhone || orderData.customer_phone || '',
      customer_email: orderData.email || orderData.customerEmail || '',
      delivery_address: orderData.deliveryAddress || orderData.address || '',
      order_type: orderData.orderType || orderData.order_type || 'Home Delivery',
      payment_method: orderData.paymentMethod || orderData.payment_method || 'Cash on Delivery',
      payment_status: orderData.payment_status || 'PENDING',
      status: orderData.status || 'Pending',
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      packing_charge: orderData.packingFee || orderData.packing_charge || 15,
      delivery_charge: orderData.deliveryFee || orderData.delivery_charge || 30,
      discount_amount: orderData.discountAmount || orderData.discount_amount || 0,
      total_amount: orderData.totalAmount || orderData.total_amount || 0,
      items: orderData.items || [],
      created_at: new Date().toISOString()
    };

    // Prevent duplicate orders by order_number
    const existsIndex = globalOrders.findIndex(o => o.order_number === orderNum);
    if (existsIndex >= 0) {
      globalOrders[existsIndex] = { ...globalOrders[existsIndex], ...newOrder };
    } else {
      globalOrders.unshift(newOrder);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderNum,
      order: newOrder
    });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { id, order_number, status, payment_status } = body;

    globalOrders = globalOrders.map(o => {
      if (String(o.id) === String(id) || String(o.order_number) === String(order_number)) {
        return {
          ...o,
          status: status || o.status,
          payment_status: payment_status || o.payment_status,
          updated_at: new Date().toISOString()
        };
      }
      return o;
    });

    return res.status(200).json({ success: true, message: 'Order updated successfully' });
  }

  return res.status(200).json({
    success: true,
    count: globalOrders.length,
    orders: globalOrders
  });
}
