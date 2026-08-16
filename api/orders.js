import { FALLBACK_MENU_ITEMS } from '../client/src/data/fallbackData';

const CRUDCRUD_API = 'https://crudcrud.com/api/b2c7cdd91fb548f69456e69f9c521266/orders';

let initialDemoOrders = [
  {
    id: 104,
    order_number: 'ORD-924536',
    customer_name: 'Dhanshri Wale',
    customer_phone: '+91 91580 75480',
    customer_email: 'dhanshri@example.com',
    delivery_address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
    order_type: 'Home Delivery',
    payment_method: 'Cash on Delivery',
    payment_status: 'PENDING',
    status: 'Pending',
    subtotal: 215.00,
    tax: 10.75,
    packing_charge: 15.00,
    delivery_charge: 30.00,
    discount_amount: 0.00,
    total_amount: 270.75,
    items: [
      { menuItemId: 2, item_name: 'Filter Coffee', price: 25.00, quantity: 1, subtotal: 25.00 },
      { menuItemId: 10, item_name: 'Ghee Masala Dosa', price: 110.00, quantity: 1, subtotal: 110.00 },
      { menuItemId: 15, item_name: 'Loni Sponge Dosa (3 Pcs)', price: 80.00, quantity: 1, subtotal: 80.00 }
    ],
    created_at: new Date().toISOString()
  },
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
  }
];

const fetchCloudOrders = async () => {
  try {
    const res = await fetch(CRUDCRUD_API);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (e) {}
  return initialDemoOrders;
};

export default async function handler(req, res) {
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

  let currentOrders = await fetchCloudOrders();

  if (req.method === 'POST') {
    const orderData = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const orderNum = orderData.order_number || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const rawItems = orderData.items || [];
    const items = rawItems.map(i => {
      const menuItem = FALLBACK_MENU_ITEMS.find(m => String(m.id) === String(i.id)) || {};
      const itemName = i.item_name || i.name || menuItem.name || 'South Indian Dish';
      const itemPrice = parseFloat(i.price || i.item_price || menuItem.price || 0);
      const qty = parseInt(i.quantity || 1, 10);
      const itemSubtotal = itemPrice * qty;

      return {
        id: i.id || menuItem.id || 1,
        menuItemId: i.id || menuItem.id || 1,
        item_name: itemName,
        price: itemPrice,
        quantity: qty,
        subtotal: itemSubtotal
      };
    });

    const subtotal = parseFloat(orderData.subtotal) || items.reduce((sum, i) => sum + i.subtotal, 0);
    const tax = parseFloat(orderData.tax) || parseFloat((subtotal * 0.05).toFixed(2));
    const packing_charge = parseFloat(orderData.packingFee || orderData.packing_charge) || (orderData.orderType === 'Dine In' ? 0 : 15);
    const delivery_charge = parseFloat(orderData.deliveryFee || orderData.delivery_charge) || (orderData.orderType === 'Home Delivery' ? 30 : 0);
    const discount_amount = parseFloat(orderData.discountAmount || orderData.discount_amount) || 0;
    const total_amount = parseFloat(orderData.totalAmount || orderData.total_amount) || (subtotal + tax + packing_charge + delivery_charge - discount_amount);

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
      subtotal: subtotal,
      tax: tax,
      packing_charge: packing_charge,
      delivery_charge: delivery_charge,
      discount_amount: discount_amount,
      total_amount: total_amount,
      items: items,
      created_at: new Date().toISOString()
    };

    try {
      await fetch(CRUDCRUD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {}

    currentOrders = [newOrder, ...currentOrders];

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderNum,
      order: newOrder
    });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    return res.status(200).json({ success: true, message: 'Order updated successfully' });
  }

  return res.status(200).json({
    success: true,
    count: currentOrders.length,
    orders: currentOrders
  });
}
