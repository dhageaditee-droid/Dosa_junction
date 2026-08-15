import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from '../data/fallbackData';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

// Convenience API Service Methods with Static Fallbacks for Vercel Deployment
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

  // Orders & Checkout
  createOrder: async (orderData) => {
    try {
      return await apiCall('/orders', 'POST', orderData);
    } catch (err) {
      console.log('Serving static fallback order placement for Vercel environment');
      const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder = {
        id: Date.now(),
        order_number: orderNum,
        customer_name: orderData.customerName || 'Customer',
        phone: orderData.phone || '',
        delivery_address: orderData.deliveryAddress || '',
        payment_method: orderData.paymentMethod || 'COD',
        payment_status: 'pending',
        status: 'pending',
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        packing_fee: orderData.packingFee || 15,
        delivery_fee: orderData.deliveryFee || 30,
        discount_amount: orderData.discountAmount || 0,
        total_amount: orderData.totalAmount || 0,
        items: orderData.items || [],
        created_at: new Date().toISOString()
      };

      try {
        const savedOrders = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');
        savedOrders.unshift(newOrder);
        localStorage.setItem('dakshin_my_orders', JSON.stringify(savedOrders));
      } catch (e) {
        console.error(e);
      }

      return {
        success: true,
        message: 'Order placed successfully!',
        orderNumber: orderNum,
        order: newOrder
      };
    }
  },

  trackOrder: async (orderNumber) => {
    try {
      return await apiCall(`/orders/track/${orderNumber}`);
    } catch (err) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');
        const found = savedOrders.find(o => o.order_number === orderNumber);
        if (found) {
          return { success: true, order: found };
        }
      } catch (e) {}

      return {
        success: true,
        order: {
          order_number: orderNumber,
          customer_name: 'Customer',
          phone: '+91 70207 58779',
          delivery_address: 'Sinnar Gaurav, Near Panchvati Hotel, Sinnar',
          payment_method: 'COD',
          payment_status: 'pending',
          status: 'confirmed',
          total_amount: 71.25,
          items: [{ item_name: 'Coffee', quantity: 1, item_price: 25.00 }],
          created_at: new Date().toISOString()
        }
      };
    }
  },

  getMyOrders: async () => {
    try {
      return await apiCall('/orders/my-orders');
    } catch (err) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('dakshin_my_orders') || '[]');
        return { success: true, count: savedOrders.length, orders: savedOrders };
      } catch (e) {
        return { success: true, count: 0, orders: [] };
      }
    }
  },

  validateCoupon: async (code, subtotal) => {
    try {
      return await apiCall('/coupons/validate', 'POST', { code, subtotal });
    } catch (err) {
      const upper = (code || '').toUpperCase().trim();
      if (upper === 'SOUTH10' && subtotal >= 150) {
        const disc = Math.min(50, subtotal * 0.10);
        return { success: true, message: '10% Discount Applied!', coupon: { code: 'SOUTH10', calculatedDiscount: disc } };
      } else if (upper === 'SOUTH20' && subtotal >= 300) {
        const disc = Math.min(100, subtotal * 0.20);
        return { success: true, message: '20% Discount Applied!', coupon: { code: 'SOUTH20', calculatedDiscount: disc } };
      } else if (upper === 'WELCOME50' && subtotal >= 200) {
        return { success: true, message: '₹50 Instant OFF Applied!', coupon: { code: 'WELCOME50', calculatedDiscount: 50 } };
      }
      throw new Error('Invalid coupon code or minimum order amount not met.');
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

  // Admin Portal APIs
  getAdminStats: () => apiCall('/orders/admin/dashboard-stats', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  getAdminOrders: (params = '') => apiCall(`/orders/admin/all${params ? `?${params}` : ''}`, 'GET', null, localStorage.getItem('dakshin_admin_token')),
  updateOrderStatus: (id, status) => apiCall(`/orders/admin/${id}/status`, 'PATCH', { status }, localStorage.getItem('dakshin_admin_token')),
  updatePaymentStatus: (id, paymentStatus) => apiCall(`/orders/admin/${id}/payment`, 'PATCH', { paymentStatus }, localStorage.getItem('dakshin_admin_token')),

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
