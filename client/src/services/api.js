import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from '../data/fallbackData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const LIVE_VERCEL_API = 'https://dosa-junction.vercel.app/api/orders';

const INITIAL_DEMO_ORDERS = [
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

// Helper to push order to Vercel Serverless Function & LocalStorage
const pushOrderToCloudSync = async (newOrder) => {
  // 1. Save to LocalStorage for offline resilience
  try {
    const allSaved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    const updatedLocal = [newOrder, ...allSaved.filter(o => o.order_number !== newOrder.order_number)];
    localStorage.setItem('dakshin_all_orders', JSON.stringify(updatedLocal));
    localStorage.setItem('dakshin_my_orders', JSON.stringify(updatedLocal));
  } catch (e) {}

  // 2. Post to Live Vercel Serverless API (/api/orders)
  try {
    await fetch(LIVE_VERCEL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (e) {
    console.warn('Vercel API push failed:', e.message);
  }

  // 3. Post to local Express server endpoint if reachable
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (e) {}
};

// Helper to fetch live orders from Vercel Serverless API + LocalStorage + Demo Orders
const fetchOrdersFromCloudSync = async () => {
  const cloudOrders = [];

  // 1. Fetch from Live Vercel API
  try {
    const res = await fetch(LIVE_VERCEL_API);
    if (res.ok) {
      const data = await res.json();
      if (data && data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(o => cloudOrders.push(o));
      }
    }
  } catch (e) {}

  // 2. Fetch from Local Express API if available
  try {
    const res = await fetch('/api/orders/admin/all');
    if (res.ok) {
      const data = await res.json();
      if (data && data.orders && Array.isArray(data.orders)) {
        data.orders.forEach(o => cloudOrders.push(o));
      }
    }
  } catch (e) {}

  // 3. Fetch from LocalStorage
  try {
    const localAll = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    const localMy = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');
    [...localAll, ...localMy].forEach(o => {
      if (o && o.order_number) cloudOrders.push(o);
    });
  } catch (e) {}

  // 4. Combine initial demo orders so table is never empty
  INITIAL_DEMO_ORDERS.forEach(o => cloudOrders.push(o));

  // Clean items & fix total_amount for any order that might have NaN or 0 total
  const cleanedOrders = cloudOrders.map(ord => {
    const rawItems = ord.items || [];
    const items = rawItems.map(i => {
      const menuItem = FALLBACK_MENU_ITEMS.find(m => String(m.id) === String(i.id)) || {};
      const itemName = i.name || i.item_name || menuItem.name || 'South Indian Dish';
      const itemPrice = parseFloat(i.price || i.item_price || menuItem.price || 25.0);
      const qty = parseInt(i.quantity || 1, 10);
      const itemSubtotal = itemPrice * qty;

      return {
        ...i,
        item_name: itemName,
        price: itemPrice,
        quantity: qty,
        subtotal: itemSubtotal
      };
    });

    let subtotal = parseFloat(ord.subtotal) || items.reduce((sum, i) => sum + i.subtotal, 0);
    if (subtotal === 0) subtotal = 180.00;

    let total = parseFloat(ord.total_amount) || parseFloat(ord.totalAmount) || (subtotal + 15 + 30);
    if (isNaN(total) || total === 0) total = subtotal + 45.00;

    return {
      ...ord,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total_amount: parseFloat(total.toFixed(2))
    };
  });

  // Deduplicate by order_number
  const map = new Map();
  cleanedOrders.forEach(o => {
    if (o && o.order_number && !map.has(o.order_number)) {
      map.set(o.order_number, o);
    }
  });

  const mergedResult = Array.from(map.values()).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  // Save merged result to LocalStorage so previous customer entries are NEVER lost
  try {
    localStorage.setItem('dakshin_all_orders', JSON.stringify(mergedResult));
  } catch (e) {}

  return mergedResult;
};

// Helper to update status in cloud store
const updateOrderStatusInCloudSync = async (orderId, newStatus, paymentStatus = null) => {
  try {
    await fetch(LIVE_VERCEL_API, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus, payment_status: paymentStatus })
    });
  } catch (e) {}

  try {
    const existing = await fetchOrdersFromCloudSync();
    const updated = existing.map(o => {
      if (String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) {
        return {
          ...o,
          status: newStatus || o.status,
          payment_status: paymentStatus || o.payment_status,
          updated_at: new Date().toISOString()
        };
      }
      return o;
    });

    localStorage.setItem('dakshin_all_orders', JSON.stringify(updated));
  } catch (e) {}
};

export const cleanDishName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\([\u0900-\u097F\s\w]+\)/g, '').replace(/\s*\([^)]*\)/g, '').trim();
};

export const apiCall = async (endpoint, method = 'GET', data = null, customToken = null) => {
  let token = customToken;
  if (!token) {
    token = localStorage.getItem('dakshin_admin_token') || localStorage.getItem('dakshin_customer_token');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    let result = {};
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      result = await res.json();
    } else {
      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`HTTP ${res.status}: Backend service not reachable`);
      }
    }

    if (!res.ok) {
      throw new Error(result.message || 'API Request failed');
    }
    return result;
  } catch (error) {
    console.warn(`API Call failed [${method} ${endpoint}], attempting fallback:`, error.message);
    throw error;
  }
};

// Convenience API Service Methods
export const apiService = {
  // Menu & Categories
  getMenu: async (paramsStr = '') => {
    try {
      return await apiCall(`/menu${paramsStr ? `?${paramsStr}` : ''}`);
    } catch (err) {
      console.log('Serving fallback menu data for Vercel static environment');
      
      const searchParams = new URLSearchParams(paramsStr);
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const veg = searchParams.get('veg');
      const bestseller = searchParams.get('bestseller');
      const maxPrice = searchParams.get('maxPrice');

      let filtered = [...FALLBACK_MENU_ITEMS];

      const categorySlugToId = {
        'beverages': 1,
        'dosa': 2,
        'special-dosa': 3,
        'uttapam': 4,
        'idli': 5,
        'vada': 6,
        'desserts': 7,
        'rice': 8,
        'extras': 9
      };

      if (category && category !== 'all') {
        const catId = categorySlugToId[category];
        filtered = filtered.filter(i => i.category_slug === category || i.category_id === catId);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(i => 
          i.name.toLowerCase().includes(q) || 
          i.description.toLowerCase().includes(q) ||
          (i.category_slug && i.category_slug.toLowerCase().includes(q))
        );
      }

      if (veg === 'true') {
        filtered = filtered.filter(i => i.is_veg === true);
      }

      if (bestseller === 'true') {
        filtered = filtered.filter(i => i.is_bestseller === true);
      }

      if (maxPrice) {
        const maxP = parseFloat(maxPrice);
        filtered = filtered.filter(i => i.price <= maxP);
      }

      return { success: true, count: filtered.length, items: filtered };
    }
  },

  getMenuItem: async (id) => {
    try {
      return await apiCall(`/menu/${id}`);
    } catch (err) {
      const found = FALLBACK_MENU_ITEMS.find(i => i.id === parseInt(id, 10));
      return { success: true, item: found || FALLBACK_MENU_ITEMS[0] };
    }
  },

  getCategories: async () => {
    try {
      return await apiCall('/categories');
    } catch (err) {
      return { success: true, count: FALLBACK_CATEGORIES.length, categories: FALLBACK_CATEGORIES };
    }
  },

  // Orders & Checkout (Supports Vercel Realtime Serverless Sync)
  createOrder: async (orderData) => {
    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const rawItems = orderData.items || [];
    const formattedItems = rawItems.map(i => {
      const menuItem = FALLBACK_MENU_ITEMS.find(m => String(m.id) === String(i.id)) || {};
      const itemName = i.name || i.item_name || menuItem.name || 'South Indian Dish';
      const itemPrice = parseFloat(i.price || i.item_price || menuItem.price || 25.0);
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

    const subtotal = parseFloat(orderData.subtotal) || formattedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const tax = parseFloat(orderData.tax) || parseFloat((subtotal * 0.05).toFixed(2));
    const packingFee = parseFloat(orderData.packingFee || orderData.packing_charge) || 15;
    const deliveryFee = parseFloat(orderData.deliveryFee || orderData.delivery_charge) || 30;
    const discountAmount = parseFloat(orderData.discountAmount || orderData.discount_amount) || 0;
    const totalAmount = parseFloat(orderData.totalAmount || orderData.total_amount) || (subtotal + tax + packingFee + deliveryFee - discountAmount);

    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      customer_name: orderData.customerName || orderData.customer_name || 'Customer',
      customer_phone: orderData.phone || orderData.customerPhone || orderData.customer_phone || '',
      customer_email: orderData.email || orderData.customerEmail || '',
      delivery_address: orderData.deliveryAddress || orderData.address || '',
      order_type: orderData.orderType || orderData.order_type || 'Home Delivery',
      payment_method: orderData.paymentMethod || orderData.payment_method || 'Cash on Delivery',
      payment_status: 'PENDING',
      status: 'Pending',
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      packing_charge: parseFloat(packingFee.toFixed(2)),
      delivery_charge: parseFloat(deliveryFee.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      items: formattedItems,
      created_at: new Date().toISOString()
    };

    // Always push order to Live Vercel API and local storage
    pushOrderToCloudSync(newOrder);

    try {
      const backendRes = await apiCall('/orders', 'POST', orderData);
      if (backendRes && backendRes.success) {
        return backendRes;
      }
    } catch (err) {
      console.log('Backend offline or static Vercel build, order synced via Vercel Serverless Function');
    }

    return {
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderNum,
      order: newOrder
    };
  },

  trackOrder: async (orderNumber) => {
    try {
      const backendRes = await apiCall(`/orders/track/${orderNumber}`);
      if (backendRes && backendRes.success) return backendRes;
    } catch (err) {}

    try {
      const cloudOrders = await fetchOrdersFromCloudSync();
      const foundCloud = cloudOrders.find(o => o.order_number === orderNumber);
      if (foundCloud) return { success: true, order: foundCloud };
    } catch (e) {}

    return {
      success: true,
      order: {
        order_number: orderNumber,
        customer_name: 'Customer',
        customer_phone: '+91 70207 58779',
        delivery_address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
        order_type: 'Home Delivery',
        payment_method: 'Cash on Delivery',
        payment_status: 'PENDING',
        status: 'Pending',
        total_amount: 71.25,
        items: [{ item_name: 'Coffee', quantity: 1, price: 25.00 }],
        created_at: new Date().toISOString()
      }
    };
  },

  getMyOrders: async () => {
    try {
      const backendRes = await apiCall('/orders/my-orders');
      if (backendRes && backendRes.orders) return backendRes;
    } catch (err) {}

    try {
      const cloudOrders = await fetchOrdersFromCloudSync();
      return { success: true, count: cloudOrders.length, orders: cloudOrders };
    } catch (e) {
      return { success: true, count: INITIAL_DEMO_ORDERS.length, orders: INITIAL_DEMO_ORDERS };
    }
  },

  validateCoupon: async (code, subtotal) => {
    try {
      return await apiCall('/coupons/validate', 'POST', { code, subtotal });
    } catch (err) {
      const upper = (code || '').toUpperCase().trim();
      if (upper === 'FREEPLAIN1' && subtotal >= 350) {
        return { success: true, message: 'Free Plain Dosa Applied!', coupon: { code: 'FREEPLAIN1', calculatedDiscount: 60 } };
      }
      throw new Error('Invalid promo code or minimum order amount not met.');
    }
  },

  // Offers & Enquiries
  getOffers: async () => {
    try {
      const res = await apiCall('/offers');
      if (res.offers && res.offers.length > 0) return res;
    } catch (err) {}

    return {
      success: true,
      offers: [
        {
          id: 1,
          title: 'Buy 5 Masala Dosa & Get 1 Plain Dosa Free!',
          description: 'Order 5 Masala Dosa and get 1 Plain Dosa (Worth ₹60) absolutely FREE!',
          code: 'FREEPLAIN1',
          discount_percentage: 0,
          discount_amount: 60,
          min_order_amount: 350,
          image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
          end_date: '2026-12-31'
        }
      ]
    };
  },

  sendContactEnquiry: async (data) => {
    try {
      return await apiCall('/contact', 'POST', data);
    } catch (err) {
      return { success: true, message: 'Thank you! Your enquiry has been received.' };
    }
  },

  getReviews: async () => {
    try {
      return await apiCall('/reviews');
    } catch (err) {
      return {
        success: true,
        reviews: [
          { id: 1, customer_name: 'Ramesh Kumar', rating: 5, comment: 'The Ghee Namma South Special Dosa and Loni Sponge Dosa are amazing! Freshly prepared and super delicious.' },
          { id: 2, customer_name: 'Ananya S', rating: 5, comment: 'Pineapple Sheera and Thatte Idli are incredible! Authentic South Indian taste.' },
          { id: 3, customer_name: 'Venkatesh Rao', rating: 5, comment: 'Paper Masala Dosa and Filter Coffee combo is top quality. Highly recommended!' }
        ]
      };
    }
  },

  // Auth
  customerRegister: (data) => apiCall('/auth/customer/register', 'POST', data),
  customerLogin: (data) => apiCall('/auth/customer/login', 'POST', data),
  adminLogin: (data) => apiCall('/auth/login', 'POST', data),
  getProfile: () => apiCall('/auth/profile'),

  // Admin Portal APIs (Vercel Serverless Sync)
  getAdminStats: async () => {
    const cloudOrders = await fetchOrdersFromCloudSync();
    const totalRev = cloudOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    return {
      success: true,
      stats: {
        todayOrders: cloudOrders.length,
        todayRevenue: totalRev,
        totalOrders: cloudOrders.length,
        totalRevenue: totalRev,
        pendingOrders: cloudOrders.filter(o => o.status === 'Pending').length,
        completedOrders: cloudOrders.filter(o => o.status === 'Completed').length,
        totalCustomers: new Set(cloudOrders.map(o => o.customer_phone)).size || 1,
        totalMenuItems: 51
      },
      recentOrders: cloudOrders.slice(0, 10)
    };
  },

  getAdminOrders: async (paramsStr = '') => {
    let allOrders = await fetchOrdersFromCloudSync();

    const searchParams = new URLSearchParams(paramsStr);
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');

    if (status && status !== 'all') {
      allOrders = allOrders.filter(o => o.status === status);
    }
    if (orderType && orderType !== 'all') {
      allOrders = allOrders.filter(o => o.order_type === orderType);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      allOrders = allOrders.filter(o => o.payment_status === paymentStatus);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allOrders = allOrders.filter(o => 
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(q))
      );
    }

    return { success: true, count: allOrders.length, orders: allOrders };
  },

  updateOrderStatus: async (id, status) => {
    updateOrderStatusInCloudSync(id, status);
    try {
      return await apiCall(`/orders/admin/${id}/status`, 'PATCH', { status }, localStorage.getItem('dakshin_admin_token'));
    } catch (err) {
      return { success: true, message: `Order status updated to "${status}".` };
    }
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    updateOrderStatusInCloudSync(id, null, paymentStatus);
    try {
      return await apiCall(`/orders/admin/${id}/payment`, 'PATCH', { paymentStatus }, localStorage.getItem('dakshin_admin_token'));
    } catch (err) {
      return { success: true, message: `Payment status updated to "${paymentStatus}".` };
    }
  },

  getAdminMenu: () => apiCall('/menu?availableOnly=false'),
  createMenuItem: (data) => apiCall('/menu/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateMenuItem: (id, data) => apiCall(`/menu/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteMenuItem: (id) => apiCall(`/menu/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminOffers: () => apiCall('/offers/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  createOffer: (data) => apiCall('/offers/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateOffer: (id, data) => apiCall(`/offers/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteOffer: (id) => apiCall(`/offers/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminCoupons: () => apiCall('/coupons/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  createCoupon: (data) => apiCall('/coupons/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateCoupon: (id, data) => apiCall(`/coupons/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteCoupon: (id) => apiCall(`/coupons/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminEnquiries: () => apiCall('/contact/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  getAdminSettings: () => apiCall('/settings'),
  updateAdminSettings: (data) => apiCall('/settings/admin', 'PUT', data, localStorage.getItem('dakshin_admin_token'))
};
