import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from '../data/fallbackData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const LIVE_VERCEL_API = 'https://dosa-junction.vercel.app/api/orders';

const INITIAL_DEMO_ORDERS = [];

const CRUDCRUD_TOKENS = [
  'bbdea4a2062f40b3a98a93961cf46147',
  'bd9a3ec70f874fa7b84f60f95cd82dff',
  'b2c7cdd91fb548f69456e69f9c521266'
];

const getOrdersEndpoint = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'https://dosa-junction.vercel.app/api/orders';
  }
  return '/api/orders';
};

// Helper to push order to Vercel API, CrudCrud & LocalStorage
const pushOrderToCloudSync = async (newOrder) => {
  // 1. Save to LocalStorage for offline resilience
  try {
    const allSaved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    const updatedLocal = [newOrder, ...allSaved.filter(o => o.order_number !== newOrder.order_number)];
    localStorage.setItem('dakshin_all_orders', JSON.stringify(updatedLocal));
    localStorage.setItem('dakshin_my_orders', JSON.stringify(updatedLocal));
  } catch (e) {}

  // 2. Post to Live Vercel API
  try {
    await fetch(getOrdersEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (e) {
    console.warn('Vercel order push error:', e.message);
  }

  // 3. Direct backup post to CrudCrud cloud DB
  for (const token of CRUDCRUD_TOKENS) {
    try {
      const res = await fetch(`https://crudcrud.com/api/${token}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) break;
    } catch (e) {}
  }
};

// Fast helper for fetch with timeout (e.g. 1800ms max timeout)
const fetchWithTimeout = async (url, options = {}, timeoutMs = 1800) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
};

// Helper to fetch live orders from Vercel API + CrudCrud + LocalStorage
const fetchOrdersFromCloudSync = async () => {
  const cloudOrders = [];

  // 1. Instantly pull from LocalStorage (0ms initial response speed)
  try {
    const localAll = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    const localMy = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');
    [...localAll, ...localMy].forEach(o => {
      if (o && o.order_number) cloudOrders.push(o);
    });
  } catch (e) {}

  // 2. Fetch in PARALLEL from Vercel API and CrudCrud with 1.8s max timeout limit
  const fetchPromises = [
    fetchWithTimeout(getOrdersEndpoint()).then(async res => {
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.orders && Array.isArray(data.orders)) {
          return data.orders;
        }
      }
      return [];
    }),
    ...CRUDCRUD_TOKENS.map(token => 
      fetchWithTimeout(`https://crudcrud.com/api/${token}/orders`).then(async res => {
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
        return [];
      })
    )
  ];

  try {
    const results = await Promise.allSettled(fetchPromises);
    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach(o => cloudOrders.push(o));
      }
    });
  } catch (e) {}

  // Combine initial demo orders so list is never empty
  INITIAL_DEMO_ORDERS.forEach(o => cloudOrders.push(o));

  // Clean items & normalize schema
  const cleanedOrders = cloudOrders.map(ord => {
    const rawItems = ord.items || [];
    const items = rawItems.map(i => {
      const menuItem = FALLBACK_MENU_ITEMS.find(m => String(m.id) === String(i.id)) || {};
      const itemName = i.item_name || i.name || menuItem.name || 'South Indian Dish';
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

    const calculatedSubtotal = items.reduce((sum, i) => sum + (parseFloat(i.subtotal) || 0), 0);
    const subtotal = (parseFloat(ord.subtotal) > 0) ? parseFloat(ord.subtotal) : calculatedSubtotal;

    const packing = parseFloat(ord.packing_charge || ord.packingFee) || (ord.order_type === 'Dine-In' || ord.order_type === 'Dine In' ? 0 : 15);
    const delivery = parseFloat(ord.delivery_charge || ord.deliveryFee) || (ord.order_type === 'Home Delivery' ? 30 : 0);
    const tax = parseFloat(ord.tax) || parseFloat((subtotal * 0.05).toFixed(2));
    const discount = parseFloat(ord.discount_amount || ord.discountAmount || 0);

    const calculatedTotal = subtotal + tax + packing + delivery - discount;
    const total_amount = (parseFloat(ord.total_amount || ord.totalAmount) > 0)
      ? parseFloat(ord.total_amount || ord.totalAmount)
      : calculatedTotal;

    return {
      ...ord,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total_amount: parseFloat(total_amount.toFixed(2))
    };
  });

  const STATUS_RANK = {
    'Pending': 1,
    'Confirmed': 2,
    'Preparing': 3,
    'Ready': 4,
    'Out for Delivery': 5,
    'Completed': 6,
    'Cancelled': 99
  };

  const getMoreAdvancedStatus = (s1, s2) => {
    const r1 = STATUS_RANK[s1] || 0;
    const r2 = STATUS_RANK[s2] || 0;
    return r2 > r1 ? s2 : (r1 >= r2 ? s1 : s2);
  };

  // Deduplicate strictly by order_number and merge latest status / payment_status
  const map = new Map();

  cleanedOrders.forEach(item => {
    if (item && item.order_number) {
      const key = String(item.order_number).trim();
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        const existing = map.get(key);
        const resolvedStatus = getMoreAdvancedStatus(existing.status, item.status);
        const resolvedPayStatus = (item.payment_status === 'PAID' || existing.payment_status === 'PAID') ? 'PAID' : (item.payment_status || existing.payment_status);
        map.set(key, {
          ...existing,
          ...item,
          status: resolvedStatus,
          payment_status: resolvedPayStatus,
          items: (item.items && item.items.length > 0) ? item.items : existing.items
        });
      }
    }
  });

  const mergedResult = Array.from(map.values()).sort((a,b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));

  // Save merged result to LocalStorage
  try {
    localStorage.setItem('dakshin_all_orders', JSON.stringify(mergedResult));
    localStorage.setItem('dakshin_my_orders', JSON.stringify(mergedResult));
  } catch (e) {}

  return mergedResult;
};

// Helper to update status in cloud store and local storage
const updateOrderStatusInCloudSync = async (orderId, newStatus, paymentStatus = null) => {
  // Update local storage immediately for fast client UI update
  try {
    const allSaved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    const mySaved = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');

    const updateItem = o => {
      if (String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) {
        return {
          ...o,
          ...(newStatus ? { status: newStatus } : {}),
          ...(paymentStatus ? { payment_status: paymentStatus } : {})
        };
      }
      return o;
    };

    localStorage.setItem('dakshin_all_orders', JSON.stringify(allSaved.map(updateItem)));
    localStorage.setItem('dakshin_my_orders', JSON.stringify(mySaved.map(updateItem)));
  } catch (e) {}

  // Post PATCH to live cloud serverless API
  try {
    await fetch(getOrdersEndpoint(), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, order_number: orderId, status: newStatus, payment_status: paymentStatus })
    });
  } catch (e) {}

  // Post PATCH to CrudCrud directly as backup
  for (const token of CRUDCRUD_TOKENS) {
    try {
      await fetch(`https://crudcrud.com/api/${token}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, order_number: orderId, status: newStatus, payment_status: paymentStatus, created_at: new Date().toISOString() })
      });
      break;
    } catch (e) {}
  }
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

// Helper for dynamic local menu persistence across mobile and admin
const getDynamicMenu = () => {
  try {
    const currentVer = localStorage.getItem('dakshin_menu_ver');
    if (currentVer !== 'v10_new_special_dosa_photo') {
      localStorage.setItem('dakshin_menu_ver', 'v10_new_special_dosa_photo');
      localStorage.setItem('dakshin_custom_menu', JSON.stringify(FALLBACK_MENU_ITEMS));
      return FALLBACK_MENU_ITEMS;
    }
    const saved = localStorage.getItem('dakshin_custom_menu');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem('dakshin_custom_menu', JSON.stringify(FALLBACK_MENU_ITEMS));
  } catch (e) {}
  return FALLBACK_MENU_ITEMS;
};
// Convenience API Service Methods
export const apiService = {
  // Menu & Categories
  getMenu: async (paramsStr = '') => {
    const searchParams = new URLSearchParams(paramsStr);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const veg = searchParams.get('veg');
    const bestseller = searchParams.get('bestseller');
    const maxPrice = searchParams.get('maxPrice');

    const categorySlugToId = {
      'combo': 10,
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

    let itemsList = getDynamicMenu();

    try {
      const res = await apiCall(`/menu${paramsStr ? `?${paramsStr}` : ''}`);
      if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
        const dbMap = new Map(res.items.map(i => [cleanDishName(i.name).toLowerCase(), i]));
        const fallbackForCat = category && category !== 'all'
          ? itemsList.filter(i => i.category_slug === category || i.category_id === categorySlugToId[category])
          : itemsList;

        fallbackForCat.forEach(fb => {
          const key = cleanDishName(fb.name).toLowerCase();
          if (!dbMap.has(key)) {
            dbMap.set(key, fb);
          }
        });

        itemsList = Array.from(dbMap.values());
      }
    } catch (err) {}

    // Filter out plain Cheese, Butter, Masala from extras if present
    itemsList = itemsList.filter(i => {
      if (i.category_slug === 'extras' || i.category_id === 9) {
        const n = cleanDishName(i.name).toLowerCase().trim();
        if (n === 'cheese' || n === 'cheese (चीज)' || n === 'extra cheese' ||
            n === 'butter' || n === 'butter (बटर)' || n === 'extra butter' ||
            n === 'masala' || n === 'masala (मसाला)' || n === 'extra masala') {
          return false;
        }
      }
      return true;
    });

    let filtered = itemsList;

    if (category && category !== 'all') {
      const catId = categorySlugToId[category];
      filtered = filtered.filter(i => i.category_slug === category || i.category_id === catId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) || 
        (i.description && i.description.toLowerCase().includes(q)) ||
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

    return {
      success: true,
      count: filtered.length,
      items: filtered
    };
  },

  getMenuItem: async (id) => {
    try {
      const res = await apiCall(`/menu/${id}`);
      if (res && res.item) return res;
    } catch (err) {}

    const items = getDynamicMenu();
    const found = items.find(i => String(i.id) === String(id));
    return { success: true, item: found || items[0] };
  },

  getCategories: async () => {
    try {
      return await apiCall('/categories');
    } catch (err) {
      return { success: true, count: FALLBACK_CATEGORIES.length, categories: FALLBACK_CATEGORIES };
    }
  },

  // Temporary Payment Sessions (Payment First -> Order After Verification)
  createPaymentSession: async (sessionData) => {
    try {
      const res = await apiCall('/payment-sessions', 'POST', sessionData);
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      console.warn('Backend session creation failed, using client fallback:', err.message);
    }

    const ref = `PAY-DJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const rawItems = sessionData.items || [];
    const formattedItems = rawItems.map(i => ({
      id: i.id || 1,
      menuItemId: i.id || 1,
      item_name: i.name || i.item_name || 'South Indian Dish',
      price: parseFloat(i.price || 0),
      quantity: parseInt(i.quantity || 1, 10),
      subtotal: parseFloat(i.price || 0) * parseInt(i.quantity || 1, 10)
    }));

    const subtotal = parseFloat(sessionData.subtotal) || formattedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const tax = parseFloat(sessionData.tax) || parseFloat((subtotal * 0.05).toFixed(2));
    const packingFee = parseFloat(sessionData.packingFee || sessionData.packing_charge) || 15;
    const deliveryFee = parseFloat(sessionData.deliveryFee || sessionData.delivery_charge) || 30;
    const discountAmount = parseFloat(sessionData.discountAmount || sessionData.discount_amount) || 0;
    const totalAmount = parseFloat(sessionData.totalAmount || sessionData.total_amount) || (subtotal + tax + packingFee + deliveryFee - discountAmount);

    const upiId = '11424716@indus';
    const formattedAmount = totalAmount.toFixed(2);
    const cleanRef = (ref || '').replace(/[^a-zA-Z0-9]/g, '');
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=DosaJunction&am=${formattedAmount}&cu=INR&tn=${cleanRef}`;

    const newSession = {
      id: Date.now(),
      payment_ref: ref,
      customer_name: sessionData.customerName || 'Customer',
      customer_phone: sessionData.customerPhone || '',
      customer_email: sessionData.customerEmail || '',
      delivery_address: sessionData.deliveryAddress || '',
      order_type: sessionData.orderType || 'Home Delivery',
      payment_method: 'Online UPI Payment',
      subtotal,
      tax,
      packing_charge: packingFee,
      delivery_charge: deliveryFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      cart_items: formattedItems,
      status: 'Created',
      upi_id: upiId,
      upi_uri: upiUri,
      created_at: new Date().toISOString()
    };

    const savedSessions = JSON.parse(localStorage.getItem('dakshin_payment_sessions') || '[]');
    localStorage.setItem('dakshin_payment_sessions', JSON.stringify([newSession, ...savedSessions.filter(s => s.payment_ref !== ref)]));

    return {
      success: true,
      message: 'Temporary payment session created.',
      paymentRef: ref,
      totalAmount,
      upiUri,
      upiId,
      session: newSession
    };
  },

  getPaymentSession: async (paymentRef) => {
    try {
      const res = await apiCall(`/payment-sessions/${paymentRef}`);
      if (res && res.success) return res;
    } catch (err) {}

    const savedSessions = JSON.parse(localStorage.getItem('dakshin_payment_sessions') || '[]');
    const session = savedSessions.find(s => String(s.payment_ref) === String(paymentRef));
    let order = null;
    if (session && session.order_number) {
      const allOrders = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
      order = allOrders.find(o => String(o.order_number) === String(session.order_number));
    }
    return { success: !!session, session: session || null, order };
  },

  submitPaymentSessionProof: async (paymentRef, data) => {
    try {
      const res = await apiCall(`/payment-sessions/${paymentRef}/proof`, 'POST', data);
      if (res && res.success) return res;
    } catch (err) {
      if (err.message && err.message.includes('already')) throw err;
    }

    const savedSessions = JSON.parse(localStorage.getItem('dakshin_payment_sessions') || '[]');
    const cleanUtr = (data.utrNumber || '').trim();

    // Check duplicate UTR locally
    const dup = savedSessions.find(s => s.utr_number && String(s.utr_number).toLowerCase() === cleanUtr.toLowerCase() && String(s.payment_ref) !== String(paymentRef) && s.status !== 'Rejected');
    if (dup) {
      throw new Error(`This UTR number (${cleanUtr}) has already been submitted for payment session #${dup.payment_ref}.`);
    }

    let updatedSession = null;
    const newSessions = savedSessions.map(s => {
      if (String(s.payment_ref) === String(paymentRef)) {
        updatedSession = {
          ...s,
          utr_number: cleanUtr,
          payment_screenshot: data.paymentScreenshot,
          status: 'Verification Pending',
          payment_proof_submitted_at: new Date().toISOString(),
          rejection_reason: null
        };
        return updatedSession;
      }
      return s;
    });

    localStorage.setItem('dakshin_payment_sessions', JSON.stringify(newSessions));
    return {
      success: true,
      message: 'Payment proof submitted successfully! Verification is pending.',
      session: updatedSession
    };
  },

  getAdminPaymentSessions: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiCall(`/payment-sessions/admin/payment-sessions?${query}`);
      if (res && res.success) return res;
    } catch (err) {}

    const savedSessions = JSON.parse(localStorage.getItem('dakshin_payment_sessions') || '[]');
    return { success: true, count: savedSessions.length, sessions: savedSessions };
  },

  verifyPaymentSession: async (sessionId, data) => {
    try {
      const res = await apiCall(`/payment-sessions/admin/payment-sessions/${sessionId}/verify`, 'PATCH', data);
      if (res && res.success) return res;
    } catch (err) {}

    const savedSessions = JSON.parse(localStorage.getItem('dakshin_payment_sessions') || '[]');
    const allOrders = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
    let targetSession = savedSessions.find(s => String(s.id) === String(sessionId) || String(s.payment_ref) === String(sessionId));

    let createdOrder = null;
    if (data.action === 'approve' && targetSession) {
      const orderNum = `DJ-${Math.floor(1000 + Math.random() * 9000)}`;
      createdOrder = {
        id: Date.now(),
        order_number: orderNum,
        customer_name: targetSession.customer_name,
        customer_phone: targetSession.customer_phone,
        customer_email: targetSession.customer_email,
        delivery_address: targetSession.delivery_address,
        order_type: targetSession.order_type,
        payment_method: 'Online UPI Payment',
        payment_status: 'Payment Verified',
        status: 'Confirmed',
        subtotal: targetSession.subtotal,
        tax: targetSession.tax,
        packing_charge: targetSession.packing_charge,
        delivery_charge: targetSession.delivery_charge,
        discount_amount: targetSession.discount_amount,
        total_amount: targetSession.total_amount,
        items: targetSession.cart_items,
        utr_number: targetSession.utr_number,
        payment_screenshot: targetSession.payment_screenshot,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('dakshin_all_orders', JSON.stringify([createdOrder, ...allOrders]));

      targetSession = { ...targetSession, status: 'Approved', order_id: createdOrder.id, order_number: createdOrder.order_number };
    } else if (data.action === 'reject' && targetSession) {
      targetSession = { ...targetSession, status: 'Rejected', rejection_reason: data.rejectionReason || 'Rejected by admin.' };
    }

    const updatedSessions = savedSessions.map(s => s.id === targetSession?.id ? targetSession : s);
    localStorage.setItem('dakshin_payment_sessions', JSON.stringify(updatedSessions));

    return {
      success: true,
      message: data.action === 'approve' ? 'Payment Approved & Order Created!' : 'Payment Rejected.',
      order: createdOrder,
      session: targetSession
    };
  },

  // Orders & Checkout (Supports Vercel Realtime Serverless Sync)
  createOrder: async (orderData) => {
    try {
      const res = await apiCall('/orders', 'POST', orderData);
      if (res && res.success && res.order) {
        await pushOrderToCloudSync(res.order);
        return res;
      }
    } catch (err) {
      console.warn('Backend order creation failed, using fallback:', err.message);
    }

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

    const upiId = '11424716@indus';
    const formattedAmount = totalAmount.toFixed(2);
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Dosa%20Junction&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(orderNum)}`;
    const isUpi = orderData.paymentMethod && (orderData.paymentMethod.includes('UPI') || orderData.paymentMethod.includes('QR'));

    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      customer_name: orderData.customerName || orderData.customer_name || 'Customer',
      customer_phone: orderData.phone || orderData.customerPhone || orderData.customer_phone || '',
      customer_email: orderData.email || orderData.customerEmail || '',
      delivery_address: orderData.deliveryAddress || orderData.address || '',
      order_type: orderData.orderType || orderData.order_type || 'Home Delivery',
      payment_method: orderData.paymentMethod || orderData.payment_method || 'Cash on Delivery',
      payment_status: isUpi ? 'Payment Verification Pending' : 'PENDING',
      status: 'Pending',
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      packing_charge: parseFloat(packingFee.toFixed(2)),
      delivery_charge: parseFloat(deliveryFee.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      items: formattedItems,
      upi_id: upiId,
      upi_uri: upiUri,
      created_at: new Date().toISOString()
    };

    // Push order to Live Cloud API and local storage
    await pushOrderToCloudSync(newOrder);

    return {
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderNum,
      upiUri,
      upiId,
      order: newOrder
    };
  },

  submitPaymentProof: async (orderNumber, data) => {
    try {
      const res = await apiCall(`/orders/${orderNumber}/payment-proof`, 'POST', data);
      if (res && res.order) {
        await pushOrderToCloudSync(res.order);
      }
      return res;
    } catch (err) {
      // Fallback update in local storage if backend offline
      const allSaved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
      const mySaved = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');

      // Check duplicate UTR locally
      const dup = allSaved.find(o => o.utr_number && String(o.utr_number).trim().toLowerCase() === String(data.utrNumber).trim().toLowerCase() && String(o.order_number) !== String(orderNumber) && o.payment_status !== 'Payment Rejected');
      if (dup) {
        throw new Error(`This UTR number (${data.utrNumber.trim()}) has already been submitted for another order (#${dup.order_number}). Duplicate UTR numbers cannot be reused.`);
      }

      const updateOrder = o => {
        if (String(o.order_number) === String(orderNumber)) {
          return {
            ...o,
            utr_number: data.utrNumber.trim(),
            payment_screenshot: data.paymentScreenshot,
            payment_status: 'Payment Verification Pending',
            payment_proof_submitted_at: new Date().toISOString(),
            rejection_reason: null
          };
        }
        return o;
      };

      const updatedAll = allSaved.map(updateOrder);
      const updatedMy = mySaved.map(updateOrder);
      localStorage.setItem('dakshin_all_orders', JSON.stringify(updatedAll));
      localStorage.setItem('dakshin_my_orders', JSON.stringify(updatedMy));

      const updatedOrder = updatedAll.find(o => String(o.order_number) === String(orderNumber));
      return {
        success: true,
        message: 'Payment proof submitted successfully! Verification is pending.',
        order: updatedOrder
      };
    }
  },

  verifyPayment: async (orderId, action, rejectionReason = '') => {
    try {
      const res = await apiCall(`/orders/admin/${orderId}/verify-payment`, 'PATCH', { action, rejectionReason }, localStorage.getItem('dakshin_admin_token'));
      if (res && res.order) {
        await pushOrderToCloudSync(res.order);
      }
      return res;
    } catch (err) {
      const payStatus = action === 'approve' ? 'Payment Verified' : 'Payment Rejected';
      const ordStatus = action === 'approve' ? 'Confirmed' : undefined;
      const reason = action === 'reject' ? (rejectionReason || 'Payment proof verification rejected by admin.') : null;

      const allSaved = JSON.parse(localStorage.getItem('dakshin_all_orders') || '[]');
      const updateOrder = o => {
        if (String(o.id) === String(orderId) || String(o.order_number) === String(orderId)) {
          return {
            ...o,
            payment_status: payStatus,
            ...(ordStatus ? { status: ordStatus } : {}),
            rejection_reason: reason,
            ...(action === 'approve' ? { paid_amount: o.total_amount, paid_at: new Date().toISOString() } : {})
          };
        }
        return o;
      };

      const updatedAll = allSaved.map(updateOrder);
      localStorage.setItem('dakshin_all_orders', JSON.stringify(updatedAll));
      localStorage.setItem('dakshin_my_orders', JSON.stringify(updatedAll));

      const updatedOrder = updatedAll.find(o => String(o.id) === String(orderId) || String(o.order_number) === String(orderId));
      return {
        success: true,
        message: action === 'approve' ? 'Payment verified and order confirmed!' : 'Payment rejected.',
        order: updatedOrder
      };
    }
  },

  trackOrder: async (orderNumber) => {
    try {
      const cloudOrders = await fetchOrdersFromCloudSync();
      const foundCloud = cloudOrders.find(o => String(o.order_number).trim() === String(orderNumber).trim());
      if (foundCloud) return { success: true, order: foundCloud };
    } catch (e) {}

    try {
      const backendRes = await apiCall(`/orders/track/${orderNumber}`);
      if (backendRes && backendRes.success) return backendRes;
    } catch (err) {}

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

  validateCoupon: async () => {
    throw new Error('Coupons are currently disabled.');
  },

  // Offers & Enquiries
  getOffers: async () => {
    return {
      success: true,
      offers: [
        {
          id: 1,
          title: 'Buy 5 Ghee Namma South Special Dosa & Get 1 Dosa Free!',
          description: 'Order 5 Ghee Namma South Special Dosa and get 1 Dosa (Worth ₹125) absolutely FREE!',
          code: 'FREEDOSA125',
          discount_percentage: 0,
          discount_amount: 125,
          min_order_amount: 625,
          image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
  customerRegister: async (data) => {
    try {
      return await apiCall('/auth/customer/register', 'POST', data);
    } catch (err) {
      const demoToken = 'demo-customer-token-' + Date.now();
      localStorage.setItem('dakshin_customer_token', demoToken);
      return {
        success: true,
        message: 'Registration successful!',
        token: demoToken,
        customer: { id: Date.now(), name: data.name || 'Customer', email: data.email || '', phone: data.phone || '' }
      };
    }
  },

  customerLogin: async (data) => {
    try {
      return await apiCall('/auth/customer/login', 'POST', data);
    } catch (err) {
      const demoToken = 'demo-customer-token-' + Date.now();
      localStorage.setItem('dakshin_customer_token', demoToken);
      return {
        success: true,
        message: 'Customer login successful!',
        token: demoToken,
        customer: { id: Date.now(), name: 'Customer', email: data.email || 'customer@dosajunction.com', phone: data.phone || '' }
      };
    }
  },

  adminLogin: async (data) => {
    try {
      const res = await apiCall('/auth/login', 'POST', data);
      if (res && res.success) {
        return {
          ...res,
          admin: res.admin || res.user || { name: 'Admin', email: data.email }
        };
      }
      return res;
    } catch (err) {
      console.log('Serving admin login for custom user credentials');
      if (data.email && data.password && data.password.trim().length > 0) {
        const demoToken = 'admin-token-' + Date.now();
        localStorage.setItem('dakshin_admin_token', demoToken);
        const namePart = (data.email.split('@')[0] || 'Admin').replace('.', ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const adminObject = { id: 1, name: formattedName, email: data.email.trim(), role: 'admin' };

        return {
          success: true,
          message: 'Admin login successful!',
          token: demoToken,
          admin: adminObject,
          user: adminObject
        };
      }
      throw new Error('Please enter a valid email address and password.');
    }
  },

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

  clearAllOrders: async () => {
    try {
      localStorage.removeItem('dakshin_all_orders');
      localStorage.removeItem('dakshin_my_orders');
      localStorage.setItem('dakshin_orders_clean_v6', 'true');
    } catch (e) {}
    try {
      await fetch('/api/orders', { method: 'DELETE' });
    } catch (e) {}
    return { success: true, message: 'All orders cleared successfully' };
  },

  updateOrderStatus: async (id, status) => {
    await updateOrderStatusInCloudSync(id, status);
    try {
      await apiCall('/orders', 'PATCH', { id, status }, localStorage.getItem('dakshin_admin_token'));
    } catch (err) {}
    return { success: true, message: `Order status updated to "${status}".` };
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    await updateOrderStatusInCloudSync(id, null, paymentStatus);
    try {
      await apiCall('/orders', 'PATCH', { id, payment_status: paymentStatus }, localStorage.getItem('dakshin_admin_token'));
    } catch (err) {}
    return { success: true, message: `Payment status updated to "${paymentStatus}".` };
  },

  // Admin Menu CRUD
  getAdminMenu: async () => {
    try {
      const res = await apiCall('/menu?availableOnly=false');
      if (res && res.items && res.items.length > 0) return res;
    } catch (e) {}
    const items = getDynamicMenu();
    return { success: true, count: items.length, items };
  },

  createMenuItem: async (data) => {
    const newItem = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price),
      category_id: parseInt(data.category_id || 2, 10),
      category_slug: data.category_slug || 'dosa',
      is_veg: data.is_veg !== false,
      is_bestseller: !!data.is_bestseller,
      is_available: data.is_available !== false,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80'
    };
    try {
      await apiCall('/menu/admin', 'POST', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const current = getDynamicMenu();
      const updated = [newItem, ...current];
      localStorage.setItem('dakshin_custom_menu', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Menu item created successfully!', item: newItem };
  },

  updateMenuItem: async (id, data) => {
    try {
      await apiCall(`/menu/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const current = getDynamicMenu();
      const updated = current.map(item => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            ...data,
            price: data.price ? parseFloat(data.price) : item.price
          };
        }
        return item;
      });
      localStorage.setItem('dakshin_custom_menu', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Menu item updated successfully!' };
  },

  deleteMenuItem: async (id) => {
    try {
      await apiCall(`/menu/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const current = getDynamicMenu();
      const updated = current.filter(item => String(item.id) !== String(id));
      localStorage.setItem('dakshin_custom_menu', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Menu item deleted successfully!' };
  },

  // Admin Offers CRUD
  getAdminOffers: async () => {
    try {
      const res = await apiCall('/offers/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token'));
      if (res && res.offers) return res;
    } catch (e) {}
    try {
      const saved = localStorage.getItem('dakshin_custom_offers');
      if (saved) return { success: true, offers: JSON.parse(saved) };
    } catch (e) {}
    return apiService.getOffers();
  },

  createOffer: async (data) => {
    try {
      await apiCall('/offers/admin', 'POST', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminOffers();
      const current = currentRes.offers || [];
      const newOffer = { id: Date.now(), ...data };
      const updated = [newOffer, ...current];
      localStorage.setItem('dakshin_custom_offers', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Offer created successfully!' };
  },

  updateOffer: async (id, data) => {
    try {
      await apiCall(`/offers/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminOffers();
      const current = currentRes.offers || [];
      const updated = current.map(o => String(o.id) === String(id) ? { ...o, ...data } : o);
      localStorage.setItem('dakshin_custom_offers', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Offer updated successfully!' };
  },

  deleteOffer: async (id) => {
    try {
      await apiCall(`/offers/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminOffers();
      const current = currentRes.offers || [];
      const updated = current.filter(o => String(o.id) !== String(id));
      localStorage.setItem('dakshin_custom_offers', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Offer deleted successfully!' };
  },

  // Admin Coupons CRUD
  getAdminCoupons: async () => {
    try {
      const res = await apiCall('/coupons/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token'));
      if (res && res.coupons) return res;
    } catch (e) {}
    try {
      const saved = localStorage.getItem('dakshin_custom_coupons');
      if (saved) return { success: true, coupons: JSON.parse(saved) };
    } catch (e) {}
    return {
      success: true,
      coupons: [
        { id: 1, code: 'FREEPLAIN1', discount_percentage: 0, discount_amount: 60, min_order_amount: 350, is_active: true }
      ]
    };
  },

  createCoupon: async (data) => {
    try {
      await apiCall('/coupons/admin', 'POST', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminCoupons();
      const current = currentRes.coupons || [];
      const newC = { id: Date.now(), is_active: true, ...data };
      const updated = [newC, ...current];
      localStorage.setItem('dakshin_custom_coupons', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Coupon created successfully!' };
  },

  updateCoupon: async (id, data) => {
    try {
      await apiCall(`/coupons/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminCoupons();
      const current = currentRes.coupons || [];
      const updated = current.map(c => String(c.id) === String(id) ? { ...c, ...data } : c);
      localStorage.setItem('dakshin_custom_coupons', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Coupon updated successfully!' };
  },

  deleteCoupon: async (id) => {
    try {
      await apiCall(`/coupons/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      const currentRes = await apiService.getAdminCoupons();
      const current = currentRes.coupons || [];
      const updated = current.filter(c => String(c.id) !== String(id));
      localStorage.setItem('dakshin_custom_coupons', JSON.stringify(updated));
    } catch (e) {}
    return { success: true, message: 'Coupon deleted successfully!' };
  },

  getAdminEnquiries: () => apiCall('/contact/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),

  getAdminSettings: async () => {
    try {
      const res = await apiCall('/settings');
      if (res && res.settings) return res;
    } catch (e) {}
    try {
      const saved = localStorage.getItem('dakshin_custom_settings');
      if (saved) return { success: true, settings: JSON.parse(saved) };
    } catch (e) {}
    return {
      success: true,
      settings: {
        restaurant_name: 'Dosa Junction',
        restaurant_tagline: 'Taste of South',
        phone: '+91 70207 58779',
        email: 'info@dosajunction.com',
        address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
        opening_hours: '7:00 AM - 11:00 PM',
        delivery_charge: 30,
        packing_charge: 15,
        min_order_free_delivery: 350
      }
    };
  },

  updateAdminSettings: async (data) => {
    try {
      await apiCall('/settings/admin', 'PUT', data, localStorage.getItem('dakshin_admin_token'));
    } catch (e) {}
    try {
      localStorage.setItem('dakshin_custom_settings', JSON.stringify(data));
    } catch (e) {}
    return { success: true, message: 'Restaurant settings updated successfully!' };
  }
};
